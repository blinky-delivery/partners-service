import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

interface CreateProdcutParams {
    menuCategoryId: string
    name: string
    description: string | null,
    price: number
    taxRate: number | null
}
@Injectable()
export class ProductService {
    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }

    private readonly logger = new Logger(ProductService.name)

    async getProductsByMenuCategory(menuCategoryId: string) {
        try {
            this.logger.log(`Fetching products for menu category ID: ${menuCategoryId}`);
            const products = await this.drizzleService.partnersDb
                .query
                .products
                .findMany({
                    where: (fields, { eq }) => eq(fields.menuCategoryId, menuCategoryId),
                    with: {
                        primaryImage: true,
                    }
                });

            this.logger.log(`Products fetched successfully for menu category ID: ${menuCategoryId}`);
            return products;
        } catch (error) {
            this.logger.error(`Error fetching products for menu category ID: ${menuCategoryId}`, error);
            throw error;
        }
    }

    async createProduct(params: CreateProdcutParams) {
        try {
            this.logger.log(`Creating product with params: ${JSON.stringify(params)}`);
            const menuCategory = await this.drizzleService.partnersDb
                .query
                .menuCategories
                .findFirst({ where: (fields, { eq }) => eq(fields.id, params.menuCategoryId) });

            if (!menuCategory) {
                this.logger.error(`Menu category not found: ${params.menuCategoryId}`);
                return null;
            }

            const menu = await this.drizzleService.partnersDb
                .query
                .menus
                .findFirst({ where: (fields, { eq }) => eq(fields.id, menuCategory.menuId) });

            if (!menu) {
                this.logger.error(`Menu not found for menu category: ${menuCategory.menuId}`);
                return null;
            }

            const [createdProduct] = await this.drizzleService.partnersDb
                .insert(partnersSchema.products)
                .values({
                    menuCategoryId: params.menuCategoryId,
                    storeId: menu.storeId,
                    name: params.name,
                    price: params.price,
                    description: params.description,
                    taxRate: params.taxRate,
                }).returning();


            this.logger.log(`Product created successfully: ${JSON.stringify(createdProduct)}`);
            return createdProduct;

        } catch (error) {
            this.logger.error('Error creating product:', error);
            throw error;
        }
    }

}
