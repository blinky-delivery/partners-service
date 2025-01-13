import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { databaseSchema } from 'src/database/database-schema';
import { eq } from 'drizzle-orm';
import { UsersService } from 'src/users/users.service';

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
        private readonly userService: UsersService,

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


    async getStoreById(storeId: string) {
        this.logger.log(`Fetching store with ID: ${storeId}`);
        try {
            const stores = await this.drizzleService.db
                .select()
                .from(databaseSchema.stores)
                .where(eq(databaseSchema.stores.id, storeId));
            const store = stores.pop();

            if (!store) {
                this.logger.warn(`Store with ID ${storeId} not found.`);
            }

            return store;
        } catch (error) {
            this.logger.error(`Failed to fetch store with ID: ${storeId}`, error.stack);
            throw new Error('Failed to fetch store');
        }
    }

    async getUserStore(storeId: string, extAuthId: string) {
        this.logger.log(`Fetching store with ID: ${storeId} for user with extAuthId: ${extAuthId}`);
        try {
            const user = await this.userService.getUserByExtAuthId(extAuthId);

            if (storeId !== user.storeId) {
                this.logger.warn(`User with ID: ${user.id} does not belong to store with ID: ${storeId}`);
                return null;
            }

            const store = await this.getStoreById(storeId);

            return store;
        } catch (error) {
            this.logger.error(`Failed to fetch store for user with extAuthId: ${extAuthId}`, error.stack);
            throw new Error('Failed to fetch store');
        }
    }

}