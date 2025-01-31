import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

interface CreateProdcutParams {
    menuCategoryId: string
    name: string
    description: string | null,
    price: number
    taxRate: number | null
}

interface UpdateProductParams {
    menuCategoryId: string
    name: string
    description: string | null,
    price: number
    taxRate: number | null
    primaryImageId: string | null
}

type UpdateProductQuery = typeof partnersSchema.products.$inferInsert

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
                    orderBy: (fields, { asc }) => asc(fields.sort),
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

            const lastProduct = await this.drizzleService.partnersDb.query.products.findFirst({
                where: (products, { eq }) => eq(products.menuCategoryId, params.menuCategoryId),
                orderBy: (products, { desc }) => desc(products.sort),
            });

            const sortOrder = lastProduct ? lastProduct.sort + 1 : 1;

            const [createdProduct] = await this.drizzleService.partnersDb
                .insert(partnersSchema.products)
                .values({
                    storeId: menu.storeId,
                    menuId: menu.id,
                    menuCategoryId: params.menuCategoryId,
                    name: params.name,
                    price: params.price,
                    description: params.description,
                    taxRate: params.taxRate,
                    sort: sortOrder,
                }).returning();

            this.logger.log(`Product created successfully: ${JSON.stringify(createdProduct)}`);
            return createdProduct;

        } catch (error) {
            this.logger.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(productId: string, params: UpdateProductParams) {

        try {
            this.logger.log(`Updating product with ID: ${productId} and params: ${JSON.stringify(params)}`);

            const product = await this.drizzleService.partnersDb
                .query
                .products
                .findFirst({ where: (fields, { eq }) => eq(fields.id, productId) });

            if (!product) {
                this.logger.error(`Product not found: ${productId}`);
                return null;
            }

            let updateProductQuery: UpdateProductQuery = {
                storeId: product.storeId,
                menuId: product.menuId,
                menuCategoryId: params.menuCategoryId,
                primaryImageId: params.primaryImageId,
                name: params.name,
                description: params.description,
                taxRate: params.taxRate,
                price: params.price,
            }

            const updatedProduct = await this.drizzleService.partnersDb
                .update(partnersSchema.products)
                .set(updateProductQuery)
                .where(eq(partnersSchema.products.id, productId))
                .returning();

            this.logger.log(`Product updated successfully: ${JSON.stringify(updatedProduct)}`);
            return updatedProduct;

        } catch (error) {
            this.logger.error(`Error updating product with ID: ${productId}`, error);
            throw error;
        }
    }

    async resortProducts(menuCategoryId: string, newOrder: string[]) {
        this.logger.log(`Resorting products for menu category ${menuCategoryId}`);
        const products = await this.getProductsByMenuCategory(menuCategoryId);
        const productMap = new Map(products.map(product => [product.id, product]));

        await this.drizzleService.partnersDb.transaction(async (tx) => {
            for (const [index, productId] of newOrder.entries()) {
                const product = productMap.get(productId);
                if (!product) {
                    this.logger.warn(`Product with id ${productId} not found in menu category ${menuCategoryId}`);
                    throw new NotFoundException(`Product with id ${productId} not found in menu category ${menuCategoryId}`);
                }
                this.logger.log(`Updating sort order for product ${productId} to ${index + 1}`);
                try {
                    await tx.update(partnersSchema.products)
                        .set({ sort: index + 1 })
                        .where(eq(partnersSchema.products.id, productId))
                        .returning();
                } catch (err) {
                    tx.rollback();
                    throw err;
                }
            }
        });
        this.logger.log(`Successfully resorted products for menu category ${menuCategoryId}`);

        return newOrder;
    }

    async getProductsByNameSearchAndMenuId(menuId: string, productNameQuery: string) {
        try {
            this.logger.log(`Fetching products for menu ID: ${menuId} with product name query: ${productNameQuery}`);
            const products = await this.drizzleService.partnersDb
                .query
                .products
                .findMany({
                    where: (fields, { eq, like }) => {
                        const menuConditon = eq(fields.menuId, menuId)
                        if (productNameQuery.length) {
                            return menuConditon
                        } else {
                            return and(menuConditon, like(fields.name, `%${productNameQuery}%`))
                        }
                    },
                    orderBy: (fields, { asc }) => asc(fields.sort),
                    with: {
                        primaryImage: true,
                    }
                });
            this.logger.log(`Products fetched successfully for menu ID: ${menuId} with product name query: ${productNameQuery}`);
            return products;
        } catch (error) {
            this.logger.error(`Error fetching products for menu ID: ${menuId} with product name query: ${productNameQuery}`, error);
            throw error;
        }
    }

}
