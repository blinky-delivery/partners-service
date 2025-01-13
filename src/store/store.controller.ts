import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
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


    @Get('user-store/:store_id')
    async getUserStore(@CurrentUser() user: RequestUser, @Param('store_id') storeId: string) {
        this.logger.debug(`GET /store/user-store/${storeId}`);
        return await this.storeService.getUserStore(storeId, user.clerkId);
    }

}
