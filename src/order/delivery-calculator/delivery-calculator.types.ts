// delivery-calculator.types.ts
export enum ServiceProvider {
    MAPBOX = 'mapbox',
    OPEN_ROUTE = 'openroute',
}

export enum TransportProfile {
    DRIVING = 'driving',
    WALKING = 'walking',
    CYCLING = 'cycling',
    DRIVING_CAR = 'driving-car',
    FOOT_WALKING = 'foot-walking',
    CYCLING_REGULAR = 'cycling-regular',
}

export interface CoordinateDto {
    lat: number;
    lng: number;
}

export interface DistanceResponseDto {
    distance: number; // in meters
    duration?: number; // in seconds
    serviceUsed: ServiceProvider;
    calculatedAt: Date;
}

export interface ErrorResponseDto {
    statusCode: number;
    message: string;
    failedServices: ServiceProvider[];
    timestamp: string;
}

export const ROUTING_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 200,
    SERVICE_PROVIDERS: Object.values(ServiceProvider),
} as const;

