import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

@Injectable()
export class QueryService {

    private readonly logger = new Logger(QueryService.name)

    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }

    async getStoreSitesInRadius(radiusInMeters: number, latitude: number, longitude: number) {
        try {
            return await this.drizzleService.partnersDb
                .select()
                .from(partnersSchema.storeSites)
                .where(sql`
            ST_DWithin(
              ${partnersSchema.storeSites.location}::geography,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
              ${radiusInMeters}
            )
          `)
        } catch (error) {
            this.logger.error(`Failed to fetch store sites nearby location lat:${latitude} long:${longitude} in radius:${radiusInMeters}`)
        }

        return []
    }

    async getSiteListing(siteId: string) {
        try {
            const listing = await this.drizzleService.partnersDb.query.menuCategories
                .findMany({
                    where: ((menuCategories, { eq }) => eq(menuCategories.menuId, siteId)),
                    with: {
                        products: true,
                    }
                })
            return listing
        } catch (error) {
            throw new InternalServerErrorException('')
        }
    }

    async getProductDetails(productId: string) {
        const product = await this.drizzleService.partnersDb.query.products.findFirst({
            where: (fields, { eq }) => eq(fields.id, productId)
        })

        if (!product) {
            this.logger.error(`product with id ${productId} not found in database`)
            throw new NotFoundException()
        }

        return product
    }

}
