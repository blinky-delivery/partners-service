import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';
import { ProductService } from 'src/product/product.service';
import { StoreService } from 'src/store/store.service';

@Injectable()
export class QueryService {

    private readonly logger = new Logger(QueryService.name)

    constructor(
        private readonly storeService: StoreService,
        private readonly drizzleService: DrizzleService,
        private readonly productService: ProductService
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


}
