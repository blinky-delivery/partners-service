import { Body, Controller, Get, Logger, Param, Post, Put, Query, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/users/users.types';
import { MenuService } from './menu.service';
import { StoreService } from 'src/store/store.service';
import { CreateDraftMenuDto, UpdateMenuDto } from './menu.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('menu')
@UseGuards(ClerkAuthGuard)
export class MenuController {
    private readonly logger = new Logger(MenuController.name)
    constructor(private readonly menuSerice: MenuService, private readonly storeService: StoreService) { }

    @Get("")
    async getMenuById(@Query("menu_id") menuId: string, @CurrentUser() user: RequestUser) {
        return this.menuSerice.getMenuById(menuId)
    }

    @Get("store_menus")
    async getStoreMenus(@CurrentUser() user: RequestUser, @Query("store_id") storeId: string, @Query('site_id') siteId?: string) {
        const authorized = await this.storeService.isUserStoreOwnerByExtAuthId(storeId, user.clerkId)
        if (authorized) {
            return this.menuSerice.getMenusByStoreSiteId(storeId, siteId)
        } else {
            throw new UnauthorizedException('Forbidden');
        }
    }

    @Post()
    async createDraftMenu(
        @CurrentUser() user: RequestUser,
        @Body() dto: CreateDraftMenuDto,
    ) {
        await this.storeService.checkUserStoreOwnership(dto.storeId, user.clerkId)
        return this.menuSerice.createMenu(dto)
    }


    @Put(':menu_id')
    @UseInterceptors(FileInterceptor('cover_image'))
    async updateMenu(
        @CurrentUser() user: RequestUser,
        @Body() dto: UpdateMenuDto,
        @UploadedFile() cover_image: Express.Multer.File,

    ) {

    }

}
