import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
    ServiceProvider,
    TransportProfile,
    CoordinateDto,
    DistanceResponseDto,
    ErrorResponseDto,
    ROUTING_CONFIG
} from './delivery-calculator.types';

@Injectable()
export class DeliveryCalculatorService {
    private readonly logger = new Logger(DeliveryCalculatorService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async calculateDistance(
        origin: CoordinateDto,
        destination: CoordinateDto,
        profile: TransportProfile = TransportProfile.DRIVING
    ): Promise<DistanceResponseDto> {
        const failedServices: ServiceProvider[] = [];
        let lastError: Error;

        for (let attempt = 0; attempt < ROUTING_CONFIG.MAX_RETRIES; attempt++) {
            const service = this.getNextServiceProvider(attempt, failedServices);

            try {
                const result = await this.tryService(service, origin, destination, profile);
                return this.createSuccessResponse(result, service);
            } catch (error) {
                error = error as Error;
                lastError = error as Error;
                failedServices.push(service);
                this.logServiceError(service, error as Error, attempt);

                if (attempt === ROUTING_CONFIG.MAX_RETRIES - 1) break;
                await this.delayRetry(attempt);
            }
        }

        throw this.createErrorResponse(failedServices, lastError!);
    }

    private getNextServiceProvider(
        attempt: number,
        failedServices: ServiceProvider[]
    ): ServiceProvider {
        // Filter out already failed services
        const availableServices = ROUTING_CONFIG.SERVICE_PROVIDERS.filter(
            s => !failedServices.includes(s)
        );

        // Random selection from available services
        return availableServices[
            Math.floor(Math.random() * availableServices.length)
        ];
    }

    private async tryService(
        service: ServiceProvider,
        origin: CoordinateDto,
        destination: CoordinateDto,
        profile: TransportProfile
    ): Promise<Omit<DistanceResponseDto, 'serviceUsed' | 'calculatedAt'>> {
        switch (service) {
            case ServiceProvider.MAPBOX:
                return this.mapboxDistance(origin, destination, profile as TransportProfile.DRIVING);
            case ServiceProvider.OPEN_ROUTE:
                return this.openRouteDistance(origin, destination, profile);
            default:
                throw new Error(`Unsupported service provider: ${service}`);
        }
    }

    private async mapboxDistance(
        origin: CoordinateDto,
        destination: CoordinateDto,
        profile: TransportProfile.DRIVING
    ): Promise<Omit<DistanceResponseDto, 'serviceUsed' | 'calculatedAt'>> {
        const apiKey = this.getConfigValue('MAPBOX_API_KEY');
        const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;

        const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}` +
            `?access_token=${apiKey}&geometries=geojson`;

        const response = await firstValueFrom(this.httpService.get(url));

        if (!response.data?.routes?.[0]) {
            throw new Error('Invalid response structure from Mapbox API');
        }

        return {
            distance: response.data.routes[0].distance,
            duration: response.data.routes[0].duration,
        };
    }

    private async openRouteDistance(
        origin: CoordinateDto,
        destination: CoordinateDto,
        profile: TransportProfile
    ): Promise<Omit<DistanceResponseDto, 'serviceUsed' | 'calculatedAt'>> {
        const apiKey = this.getConfigValue('OPENROUTE_API_KEY');

        const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

        const response = await firstValueFrom(
            this.httpService.post(url, {
                coordinates: [
                    [origin.lng, origin.lat],
                    [destination.lng, destination.lat],
                ],
            }, {
                headers: this.createOpenRouteHeaders(apiKey),
            })
        );

        if (!response.data?.features?.[0]?.properties?.segments?.[0]) {
            throw new Error('Invalid response structure from OpenRouteService API');
        }

        const segment = response.data.features[0].properties.segments[0];
        return {
            distance: segment.distance,
            duration: segment.duration,
        };
    }

    // Helper methods
    private getConfigValue(key: string): string {
        const value = this.configService.get<string>(key);
        if (!value) throw new Error(`Missing configuration for ${key}`);
        return value;
    }

    private createOpenRouteHeaders(apiKey: string) {
        return {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json, application/geo+json',
        };
    }

    private createSuccessResponse(
        result: Omit<DistanceResponseDto, 'serviceUsed' | 'calculatedAt'>,
        service: ServiceProvider
    ): DistanceResponseDto {
        return {
            ...result,
            serviceUsed: service,
            calculatedAt: new Date(),
        };
    }

    private createErrorResponse(
        failedServices: ServiceProvider[],
        error: Error
    ): ErrorResponseDto {
        return {
            statusCode: HttpStatus.BAD_GATEWAY,
            message: `All services failed after ${ROUTING_CONFIG.MAX_RETRIES} attempts. Last error: ${error.message}`,
            failedServices,
            timestamp: new Date().toISOString(),
        };
    }

    private logServiceError(service: ServiceProvider, error: Error, attempt: number) {
        this.logger.warn(
            `Service: ${service} | Attempt: ${attempt + 1} | Error: ${this.formatError(error)}`
        );
    }

    private formatError(error: AxiosError | Error): string {
        if ('response' in error) {
            return `${error.message} - Status: ${error.response?.status} - Data: ${JSON.stringify(error.response?.data)}`;
        }
        return error.message;
    }

    private async delayRetry(attempt: number) {
        await new Promise(resolve => setTimeout(
            resolve,
            ROUTING_CONFIG.RETRY_DELAY_MS * (attempt + 1)
        ));
    }
}