import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Body, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, Post } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';
import { Cache } from 'cache-manager'; // ! Don't forget this import
import { PriceEstimationRequestDto, PriceEstimationResponseDto } from 'src/order/order.dto';
import { OrderPricingService } from 'src/order/order-pricing/order-pricing.service';

const NearbyStoresQueryRadius = 7000;

@Injectable()
export class QueryService {
    private readonly logger = new Logger(QueryService.name);

    constructor(
        private readonly drizzleService: DrizzleService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly pricingService: OrderPricingService,
    ) { }


    async getCategories() {
        try {
            const categories = await this.drizzleService.partnersDb
                .query.categories.findMany();

            this.logger.log(`Fetched ${categories.length} categories`);
            return categories;
        } catch (error) {
            this.logger.error('Failed to fetch categories');
            throw new InternalServerErrorException('Error fetching categories');
        }
    }

    async getStoreSitesInRadius(latitude: number, longitude: number) {
        try {
            const stores = await this.drizzleService.partnersDb
                .select()
                .from(partnersSchema.storeSites)
                .where(sql`
                    ST_DWithin(
                        ${partnersSchema.storeSites.location}::geography,
                        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
                        ${NearbyStoresQueryRadius}
                    )
                `);

            this.logger.log(`Fetched ${stores.length} store sites within ${NearbyStoresQueryRadius}m of (${latitude}, ${longitude})`);
            return stores;
        } catch (error) {
            this.logger.error(`Failed to fetch store sites near (${latitude}, ${longitude}) in radius: ${NearbyStoresQueryRadius}`);
            throw new InternalServerErrorException('Error fetching nearby store sites');
        }
    }

    async getStoreSitesInRadiusByCategory(latitude: number, longitude: number, categoryId: string) {
        try {
            const stores = await this.drizzleService.partnersDb
                .select()
                .from(partnersSchema.storeSites)
                .where(sql`
                ST_DWithin(
                    ${partnersSchema.storeSites.location}::geography,
                    ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
                    ${NearbyStoresQueryRadius}
                )
                AND ${categoryId} = ANY(${partnersSchema.storeSites.categoryIds})
            `)

            this.logger.log(`Fetched ${stores.length} store sites within ${NearbyStoresQueryRadius}m of (${latitude}, ${longitude}) and category ${categoryId}`)
            return stores

        } catch (error) {
            this.logger.error(`Failed to fetch store sites near (${latitude}, ${longitude}) in radius: ${NearbyStoresQueryRadius} and category ${categoryId}`);
            throw new InternalServerErrorException('Error fetching nearby by category store sites');
        }
    }

    async getSiteListing(siteId: string) {
        try {
            const site = await this.drizzleService.partnersDb.query.storeSites.findFirst({
                where: (fields, { eq }) => eq(fields.id, siteId),
            })
            if (!site) {
                this.logger.warn(`Site with id ${siteId} not found`);
                throw new NotFoundException(`Site with id ${siteId} not found`);
            }
            const menuCategories = await this.drizzleService.partnersDb.query.menuCategories.findMany({
                where: (menuCategories, { eq }) => eq(menuCategories.menuId, siteId),
                with: {
                    products: true
                },
            });

            if (!menuCategories.length) {
                this.logger.warn(`No listings found for siteId: ${siteId}`);
            }

            return {
                id: site.id,
                name: site.name,
                address: site.address,
                description: site.description,
                headerImage: site.headerImage,
                latitude: site.location?.x,
                longitude: site.location?.y,
                menuCategories: menuCategories
            }

        } catch (error) {
            this.logger.error(`Failed to fetch site listing for siteId: ${siteId}, error: ${error}`)
            throw new InternalServerErrorException('Error fetching site listing');
        }
    }

    async getProductDetails(productId: string) {
        try {

            const product = await this.drizzleService.partnersDb.query.products.findFirst({
                where: (fields, { eq }) => eq(fields.id, productId),
                with: {
                    modifiersToProducts: {
                        with: {
                            modifer: {
                                with: {
                                    options: true
                                }
                            },
                        }
                    }

                }
            });

            if (!product) {
                this.logger.warn(`Product with id ${productId} not found`);
                throw new NotFoundException(`Product with id ${productId} not found`);
            }

            this.logger.log(`Fetched product details for productId: ${productId}`);
            return product;
        } catch (error) {
            this.logger.error(`Failed to fetch product details for productId: ${productId}`);
            throw new InternalServerErrorException('Error fetching product details');
        }
    }

    @Post('estimate-price')
    async estimatePrice(
        @Body() request: PriceEstimationRequestDto
    ): Promise<PriceEstimationResponseDto> {
        return this.pricingService.estimateOrderPice(request);
    }
}