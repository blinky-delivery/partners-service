import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

const NearbyStoresQueryRadius = 7000;

@Injectable()
export class QueryService {
    private readonly logger = new Logger(QueryService.name);

    constructor(private readonly drizzleService: DrizzleService) { }

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

    async getSiteListing(siteId: string) {
        try {
            const listing = await this.drizzleService.partnersDb.query.menuCategories.findMany({
                where: (menuCategories, { eq }) => eq(menuCategories.menuId, siteId),
                with: {
                    products: true
                },
            });

            if (!listing.length) {
                this.logger.warn(`No listings found for siteId: ${siteId}`);
            }

            return listing;
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
                            modifer: true,
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
}