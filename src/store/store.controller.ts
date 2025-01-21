import { Controller, Get, Logger, Param, Query, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/users/users.types';

@Controller('stores')
@UseGuards(ClerkAuthGuard)
export class StoreController {
    private readonly logger = new Logger(StoreController.name)
    constructor(
        private readonly storeService: StoreService,
    ) { }


    @Get('user-store')
    async getUserStore(@Query('store_id') storeId: string, @CurrentUser() user: RequestUser) {
        this.logger.debug(`GET /store/user-store/${storeId}`);
        return await this.storeService.getUserStore(storeId, user.clerkId);
    }

    @Get('user-store/sites')
    async getStoreSites(@Query('store_id') storeId: string, @CurrentUser() user: RequestUser) {
        this.logger.debug(`GET /store/user-store/sites/${storeId}`)
        return await this.storeService.getStoreSites(storeId, user.clerkId)
    }

    @Get('user-store/sites/:site_id')
    async getSiteById(@Param('site_id') site_id: string, @CurrentUser() user: RequestUser) {
        this.logger.debug(`GET /store/user-store/sites/${site_id}`)
        return await this.storeService.getSiteById(site_id)
    }


}
