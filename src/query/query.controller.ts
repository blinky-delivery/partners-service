import { Controller, NotFoundException, Query, Get, Param, UseInterceptors, Post, Body } from '@nestjs/common';
import { QueryService } from './query.service';
import { ExcludeResponseInterceptor } from 'src/response/response.interceptor';
import { DeliveryCalculatorService } from 'src/order/delivery-calculator/delivery-calculator.service';
import { CoordinateDto, DistanceResponseDto, TransportProfile } from 'src/order/delivery-calculator/delivery-calculator.types';
import { PriceEstimationRequestDto, PriceEstimationResponseDto } from 'src/order/order.dto';
import { OrderPricingService } from 'src/order/order-pricing/order-pricing.service';

@Controller('query')
@ExcludeResponseInterceptor()
export class QueryController {
    constructor(
        private readonly queryService: QueryService,
        private readonly deliveryCalculatorService: DeliveryCalculatorService,
        private readonly orderPricingService: OrderPricingService,

    ) { }

    @Get('categories')
    async getCategories() {
        return this.queryService.getCategories();
    }

    @Get('sites')
    async getStoreSitesInRadius(
        @Query('latitude') latitude: number,
        @Query('longitude') longitude: number,
        @Query('category') category: string,
    ) {
        if (!latitude || !longitude) {
            throw new NotFoundException('Latitude and Longitude are required');
        }

        if (!category) {
            return this.queryService.getStoreSitesInRadius(latitude, longitude);
        } else {
            return this.queryService.getStoreSitesInRadiusByCategory(latitude, longitude, category);
        }
    }

    @Get('site-listing/:siteId')
    async getSiteListing(@Param('siteId') siteId: string) {
        return this.queryService.getSiteListing(siteId);
    }

    @Get('product/:productId')
    async getProductDetails(@Param('productId') productId: string) {
        return this.queryService.getProductDetails(productId);
    }


    @Post('calculate')
    async calculateDelivery(
        @Body() { origin, destination }: { origin: CoordinateDto, destination: CoordinateDto }
    ): Promise<DistanceResponseDto> {
        return this.deliveryCalculatorService.calculateDistance(origin, destination);
    }

    @Get('transport-profiles')
    getTransportProfiles(): { profiles: TransportProfile[] } {
        return { profiles: Object.values(TransportProfile) };
    }

    @Post('estimate-price')
    async estimateOrderPrice(
        @Body() dto: PriceEstimationRequestDto
    ): Promise<PriceEstimationResponseDto> {
        return this.orderPricingService.estimateOrderPice(dto);
    }

}
