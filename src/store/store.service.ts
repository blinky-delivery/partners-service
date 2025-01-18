import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema, stores } from 'src/database/partners.database-schema';
import { eq } from 'drizzle-orm';
import { UsersService } from 'src/users/users.service';
import { StorageService } from 'src/storage/storage.service';

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
        private readonly storageService: StorageService

    ) { }

    async create(params: CreateStoreParams) {
        this.logger.log(`Creating a store with application ID :${params.applicationId}`);
        try {
            const [createdStore] = await this.drizzleService.partnersDb
                .insert(partnersSchema.stores)
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
            const stores = await this.drizzleService.partnersDb
                .select()
                .from(partnersSchema.stores)
                .where(eq(partnersSchema.stores.id, storeId));
            const store = stores.pop();

            if (!store) {
                this.logger.warn(`Store with ID ${storeId} not found.`);
            }

            return store;
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to fetch store with ID: ${storeId}`, error.stack);
            } else {
                this.logger.error(`Failed to fetch store with ID: ${storeId}`);
            }
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
            if (error instanceof Error) {
                this.logger.error(`Failed to fetch store for user with extAuthId: ${extAuthId}`, error.stack);
            } else {
                this.logger.error(`Failed to fetch store for user with extAuthId: ${extAuthId}`);
            }
            throw new Error('Failed to fetch store');
        }
    }

    async getStoreSites(storeId: string, extAuthId: string) {
        this.logger.log(`Fetching sites for store with ID: ${storeId} for user with extAuthId: ${extAuthId}`);
        try {
            const user = await this.userService.getUserByExtAuthId(extAuthId);
            if (storeId !== user.storeId) {
                this.logger.warn(`User with ID: ${user.id} does not belong to store with ID: ${storeId}`);
                return null;
            }

            const storeSites = await this.drizzleService.partnersDb
                .select()
                .from(partnersSchema.storeSites)
                .where(eq(partnersSchema.storeSites.storeId, storeId));

            return storeSites;
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to fetch store sites for store with ID ${storeId} and user with extAuthId: ${extAuthId}`, error.stack);
            } else {
                this.logger.error(`Failed to fetch store sites for store with ID ${storeId} and user with extAuthId: ${extAuthId}`);
            }
            throw new Error('Failed to fetch store sites');
        }
    }

    async isUserStoreOwnerByExtAuthId(storeId: string, extAuthId: string): Promise<boolean> {
        this.logger.log(`Checking if user with extAuthId: ${extAuthId} owns store with ID: ${storeId}`);
        try {
            const user = await this.userService.getUserByExtAuthId(extAuthId);
            if (storeId !== user.storeId) {
                this.logger.warn(`User with ID: ${user.id} does not own store with ID: ${storeId}`);
                throw new UnauthorizedException('Forbidden');
            }
            return true;
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to check store ownership for user with extAuthId: ${extAuthId}`, error.stack);
            } else {
                this.logger.error(`Failed to check store ownership for user with extAuthId: ${extAuthId}`);
            }
            throw new Error('Failed to check store ownership');
        }
    }

    async checkUserStoreOwnership(storeId: string, extAuthId: string): Promise<void> {
        this.logger.log(`Checking store ownership for store ID: ${storeId} and user with extAuthId: ${extAuthId}`);
        try {
            const user = await this.userService.getUserByExtAuthId(extAuthId);
            if (storeId !== user.storeId) {
                this.logger.warn(`User with ID: ${user.id} does not own store with ID: ${storeId}`);
                throw new UnauthorizedException('Forbidden');
            }
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to check store ownership for user with extAuthId: ${extAuthId}`, error.stack);
            } else {
                this.logger.error(`Failed to check store ownership for user with extAuthId: ${extAuthId}`);
            }
            throw new Error('Failed to check store ownership');
        }
    }

    async createOrGetStoreFileFolder(storeId: string) {
        try {
            const folder = await this.storageService.getFolderById(storeId)

            if (folder) {
                return folder
            }

            else {
                const store = await this.getStoreById(storeId)
                if (store) {
                    return this.storageService.createFileFolder(store.name, store.id)
                }
            }

        } catch (error) {

        }
    }

}
