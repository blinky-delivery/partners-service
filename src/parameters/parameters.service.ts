import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { cities, storeTypes } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';

@Injectable()
export class ParametersService {
    private readonly logger = new Logger(ParametersService.name);

    constructor(private readonly drizzleService: DrizzleService) { }

    async getStoreTypes() {
        this.logger.log('Fetching store types');
        const storeTypesData = await this.drizzleService.db.select().from(storeTypes).where(eq(storeTypes.enabled, true)).orderBy(storeTypes.sort);
        this.logger.log(`Fetched ${storeTypesData.length} store types`);
        return storeTypesData;
    }

    async getCities() {
        this.logger.log('Fetching cities');
        const citiesData = await this.drizzleService.db.select().from(cities).orderBy(cities.sort);
        this.logger.log(`Fetched ${citiesData.length} cities`);
        return citiesData;
    }
}