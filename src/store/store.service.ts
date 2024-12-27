import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { databaseSchema } from 'src/database/database-schema';

interface CreateStoreParams {
    applicationId: string
    userId: string
    name: string
    contactPhone: string
    numberOfSites: number
    storeType: number
    city: number
    address: string
}

@Injectable()
export class StoreService {
    private readonly logger = new Logger(StoreService.name);

    constructor(
        private readonly drizzleService: DrizzleService,

    ) { }

    async create(params: CreateStoreParams) {
        this.logger.log(`Creating a store with application ID :${params.applicationId}`);
        try {
            const [createdStore] = await this.drizzleService.db
                .insert(databaseSchema.stores)
                .values({
                    ownerId: params.userId,
                    applicationId: params.applicationId,
                    address: params.address,
                    contactPhone: params.contactPhone,
                    name: params.name,
                    numberOfSites: params.numberOfSites,
                    storeTypeId: params.storeType,
                }).returning()

            this.logger.log(`Store created with ID: ${createdStore.id}`)
            return createdStore
        } catch (error) {
            this.logger.error(
                `Failed to insert store into database for Application ID: ${params.applicationId}`,
            );
        }
    }

}