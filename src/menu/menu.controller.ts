import { Body, Controller, Get, Logger, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser, UserRole } from 'src/users/users.types';
import { MenuService } from './menu.service';
import { StoreService } from 'src/store/store.service';
import { CreateDraftMenuDto } from './menu.dto';

@Controller('menu')
@UseGuards(ClerkAuthGuard)
export class MenuController {
    private readonly logger = new Logger(MenuController.name)
    constructor(private readonly menuSerice: MenuService, private readonly storeServcie: StoreService) { }

    @Get("store_menus/:store_id")
    async getStoreMenus(@Param("store_id") storeId: string, @CurrentUser() user: RequestUser) {
        const authorized = await this.storeServcie.isUserStoreOwnerByExtAuthId(storeId, user.clerkId)
        if (authorized) {
            return this.menuSerice.getMenusByStoreId(storeId)
        } else {
            throw new UnauthorizedException('Forbidden');
        }
    }

    @Post()
    async createDraftMenu(@CurrentUser() user: RequestUser, @Body() dto: CreateDraftMenuDto) {
        await this.storeServcie.checkUserStoreOwnership(dto.storeId, user.clerkId)
        return this.menuSerice.createDraftMenu(dto)
    }


}
