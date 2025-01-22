import { Body, Controller, Get, Logger, Param, Post, Put, Query, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/users/users.types';
import { MenuService } from './menu.service';
import { StoreService } from 'src/store/store.service';
import { CreateDraftMenuDto, CreateMenuCategoryDto, ResortMenuCategoriesDto, UpdateMenuDto } from './menu.dto';
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
    async getStoreMenus(@CurrentUser() user: RequestUser, @Query("store_id") storeId: string) {
        const authorized = await this.storeService.isUserStoreOwnerByExtAuthId(storeId, user.clerkId)
        if (authorized) {
            return this.menuSerice.getMenusByStoreId(storeId)
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
    async updateMenu(
        @CurrentUser() user: RequestUser,
        @Param('menu_id') menuId: string,
        @Body() dto: UpdateMenuDto,

    ) {
        return this.menuSerice.updateMenu({
            id: menuId,
            name: dto.name,
            description: dto.description,
            enabled: dto.enabled,
            siteId: dto.siteId
        })
    }

    @Put('cover_image')
    @UseInterceptors(FileInterceptor('file'))
    async updateMenuCoverImage(
        @CurrentUser() user: RequestUser,
        @Query('menu_id') menuId: string,
        @UploadedFile('file') imageFile: Express.Multer.File,
    ) {
        return this.menuSerice.updateMenuCoverImage(menuId, imageFile)
    }

    @Post('categories')
    async createMenuCategory(@CurrentUser() user: RequestUser, @Body() dto: CreateMenuCategoryDto) {
        return this.menuSerice.createMenuCategory(dto)
    }

    @Get('categories')
    async getMenuCategories(@CurrentUser() user: RequestUser, @Query('menu_id') menuId: string) {
        return this.menuSerice.getMenuCategories(menuId)
    }

    @Put('categories/sort')
    async resortMenuCategories(@CurrentUser() user: RequestUser, @Body() dto: ResortMenuCategoriesDto) {
        return this.menuSerice.resortMenuCategories(dto.menuId, dto.newOrder)
    }

}
