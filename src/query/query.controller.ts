import { Controller, NotFoundException, Query, Get, Param, UseInterceptors } from '@nestjs/common';
import { QueryService } from './query.service';
import { ExcludeResponseInterceptor } from 'src/response/response.interceptor';

@Controller('query')
@ExcludeResponseInterceptor()
export class QueryController {
    constructor(private readonly queryService: QueryService) { }

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


}
