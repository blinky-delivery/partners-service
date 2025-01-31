import { Body, Controller, Get, Logger, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { ProductService } from './product.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/users/users.types';
import { CreateProdcutDto, ResortProductsDto, UpdateProductDto } from './product.dto';



@Controller('product')
@UseGuards(ClerkAuthGuard)
export class ProductController {
    private readonly logger = new Logger(ProductController.name)

    constructor(
        private readonly productService: ProductService,
    ) { }


    @Post()
    async createProduct(
        @CurrentUser() user: RequestUser,
        @Body() dto: CreateProdcutDto,
    ) {
        return this.productService.createProduct(dto)
    }

    @Get('/menu_category')
    async getProductsByMenuCategory(
        @CurrentUser() user: RequestUser,
        @Query('menu_category_id') menuCategoryId: string,
    ) {
        return this.productService.getProductsByMenuCategory(menuCategoryId)
    }

    @Get('/menu')
    async getProductsByMenu(
        @Query('menu_id') menuId: string,
        @Query('product_name_query') productNameQuery: string
    ) {
        return this.productService.getProductsByNameSearchAndMenuId(menuId, productNameQuery)
    }

    @Put('sort')
    async resortMenuCategories(@CurrentUser() user: RequestUser, @Body() dto: ResortProductsDto) {
        return this.productService.resortProducts(dto.menuCategoryId, dto.newOrder)
    }

    @Put('update')
    async updateProduct(@Body() dto: UpdateProductDto) {
        return this.productService.updateProduct(dto.productId, dto)
    }




}
