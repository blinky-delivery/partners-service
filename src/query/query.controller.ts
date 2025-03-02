import { Controller, NotFoundException, Query, Get, Param } from '@nestjs/common';
import { QueryService } from './query.service';

@Controller('query')
export class QueryController {
    constructor(private readonly queryService: QueryService) { }

    @Get('stores')
    async getStoreSitesInRadius(
        @Query('latitude') latitude: number,
        @Query('longitude') longitude: number
    ) {
        if (!latitude || !longitude) {
            throw new NotFoundException('Latitude and Longitude are required');
        }
        return this.queryService.getStoreSitesInRadius(latitude, longitude);
    }

    @Get('site-listing/:siteId')
    async getSiteListing(@Param('siteId') siteId: string) {
        return this.queryService.getSiteListing(siteId);
    }

    @Get('product/:productId')
    async getProductDetails(@Param('productId') productId: string) {
        return this.queryService.getProductDetails(productId);
    }
}
