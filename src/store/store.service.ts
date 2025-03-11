import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
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
            throw new InternalServerErrorException('Failed to create store');
        }
    }

    async setUpStore(params: CreateStoreParams) {
        await this.drizzleService.partnersDb.transaction(async (tx) => {
            try {
                const insertStoreResult = await tx.insert(partnersSchema.stores)
                    .values({
                        ownerId: params.userId,
                        applicationId: params.applicationId,
                        address: params.address,
                        contactPhone: params.contactPhone,
                        name: params.name,
                        numberOfSites: params.numberOfSites,
                        storeTypeId: params.storeType,
                    }).returning()
                const store = insertStoreResult.pop()
                if (!store) {
                    throw new Error('Failed to create store')
                }

                // Associate the user with the store
                await tx.update(partnersSchema.storeUsers).set({ storeId: store.id }).where(eq(partnersSchema.storeUsers.id, params.userId))

                const insertSiteResult = await tx.insert(partnersSchema.storeSites)
                    .values({
                        storeId: store.id,
                        cityId: params.city,
                        address: params.address,
                        name: params.name,
                        storeTypeId: params.storeType,
                        approved: false,
                        phone: params.contactPhone,

                    }).returning()
                const site = insertSiteResult.pop()

                if (!site) {
                    throw new Error('Failed to create site')
                }

                const insertMenuResult = await tx.insert(partnersSchema.menus)
                    .values({
                        id: site.id, // Really important menu identifier
                        storeId: store.id,
                        storeSiteId: site.id,
                        name: '',
                        description: '',
                        enabled: true,
                        status: 'approved',
                        sort: 1,
                    }).returning()

                const menu = insertMenuResult.pop()
                if (!menu) {
                    throw new Error('Failed to create menu')
                }

            } catch (error) {
                tx.rollback()
                this.logger.error(
                    `Failed to insert store into database for Application ID: ${params.applicationId}`,
                )
                throw new InternalServerErrorException('Failed to create store')
            }
        })
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
            const store = await this.drizzleService.partnersDb.query.stores.findFirst({ where: (fields, { eq }) => eq(fields.ownerId, user.id) })

            if (!store) {
                this.logger.warn(`Store with ID ${storeId} not found.`)
                throw new Error('Store not found')
            }
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

    async getSiteById(siteId: string) {
        this.logger.log(`Fetching site with ID: ${siteId}`);
        try {
            const sites = await this.drizzleService.partnersDb
                .select()
                .from(partnersSchema.storeSites)
                .where(eq(partnersSchema.storeSites.id, siteId));
            const site = sites.pop();

            if (!site) {
                this.logger.warn(`Site with ID ${siteId} not found.`);
            }

            return site;
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to fetch site with ID: ${siteId}`, error.stack);
            } else {
                this.logger.error(`Failed to fetch site with ID: ${siteId}`);
            }
            throw new Error('Failed to fetch site');
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
        this.logger.log(`Creating or fetching file folder for store with ID: ${storeId}`);
        try {
            const folder = await this.storageService.getFolderById(storeId);

            if (folder) {
                this.logger.log(`Folder found for store with ID: ${storeId}`);
                return folder;
            } else {
                const store = await this.getStoreById(storeId);
                if (store) {
                    this.logger.log(`Creating new folder for store with ID: ${storeId}`);
                    return this.storageService.createFileFolder(store.name, store.id);
                } else {
                    this.logger.warn(`Store with ID: ${storeId} not found, cannot create folder`);
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to create or fetch file folder for store with ID: ${storeId}`, error.stack);
            } else {
                this.logger.error(`Failed to create or fetch file folder for store with ID: ${storeId}`);
            }
            throw new Error('Failed to create or fetch file folder');
        }
    }

}
