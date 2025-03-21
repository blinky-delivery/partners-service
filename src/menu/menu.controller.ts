import { Body, Controller, Get, Logger, Param, Post, Put, Query, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/users/users.types';
import { MenuService } from './menu.service';
import { StoreService } from 'src/store/store.service';
import { CreateDraftMenuDto, CreateMenuCategoryDto, ResortMenuCategoriesDto, UpdateMenuCateogryDto, UpdateMenuDto } from './menu.dto';

@Controller('menu')
@UseGuards(ClerkAuthGuard)
export class MenuController {
    private readonly logger = new Logger(MenuController.name)
    constructor(private readonly menuSerice: MenuService, private readonly storeService: StoreService) { }

    @Get("")
    async getMenuById(@Query("menu_id") menuId: string, @CurrentUser() user: RequestUser) {
        return this.menuSerice.getMenuById(menuId)
    }


    // Will not be used for now
    // @Get("store_menus")
    // async getStoreMenus(@CurrentUser() user: RequestUser, @Query("store_id") storeId: string) {
    //     const authorized = await this.storeService.isUserStoreOwnerByExtAuthId(storeId, user.clerkId)
    //     if (authorized) {
    //         return this.menuSerice.getMenusByStoreId(storeId)
    //     } else {
    //         throw new UnauthorizedException('Forbidden');
    //     }
    // }

    @Get("site_menu")
    async getStoreSiteMenu(@CurrentUser() user: RequestUser, @Query("site_id") siteId: string) {
        return this.menuSerice.getOrCreateStoreSiteDefaultMenu(siteId)
    }

    @Post()
    async createDraftMenu(
        @CurrentUser() user: RequestUser,
        @Body() dto: CreateDraftMenuDto,
    ) {
        await this.storeService.checkUserStoreOwnership(dto.storeId, user.clerkId)
        return this.menuSerice.createMenu(dto)
    }


    // @Put(':menu_id')
    // async updateMenu(
    //     @CurrentUser() user: RequestUser,
    //     @Param('menu_id') menuId: string,
    //     @Body() dto: UpdateMenuDto,

    // ) {
    //     return this.menuSerice.updateMenu({
    //         id: menuId,
    //         name: dto.name,
    //         description: dto.description,
    //         enabled: dto.enabled,
    //         siteId: dto.siteId
    //     })
    // }


    @Post('categories')
    async createMenuCategory(@CurrentUser() user: RequestUser, @Body() dto: CreateMenuCategoryDto) {
        return this.menuSerice.createMenuCategory(dto)
    }

    @Get('categories')
    async getMenuCategories(@CurrentUser() user: RequestUser, @Query('menu_id') menuId: string) {
        return this.menuSerice.getMenuCategories(menuId)
    }

    @Put('categories')
    async updateMenuCateogry(@Body() dto: UpdateMenuCateogryDto) {
        return this.menuSerice.updateMenuCategory(dto)
    }

    @Put('categories/sort')
    async resortMenuCategories(@CurrentUser() user: RequestUser, @Body() dto: ResortMenuCategoriesDto) {
        return this.menuSerice.resortMenuCategories(dto.menuId, dto.newOrder)
    }

}
