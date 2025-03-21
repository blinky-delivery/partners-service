import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import { partnersSchema } from 'src/database/partners.database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { Menutatus } from './menu.types';
import { StoreService } from 'src/store/store.service';
import { StorageService } from 'src/storage/storage.service';

export interface CreateMenuParams {
    name: string
    description: string
    storeId: string
    siteId: string
}

export interface UpdateMenuParams {
    id: string
    name: string
    description: string
    enabled: boolean
    siteId: string
}

export interface CreateMenuCategoryParams {
    menuId: string
    name: string
}

export interface UpdateMenuCategoryParams {
    id: string
    name: string
    description: string
}

type InsertMenuParams = typeof partnersSchema.menus.$inferInsert
@Injectable()
export class MenuService {
    private readonly logger = new Logger(MenuService.name)
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly storeService: StoreService,
        private readonly storageService: StorageService
    ) { }

    async getMenuById(menuId: string) {
        try {
            const menu = await this.drizzleService.partnersDb.query.menus.findFirst({ where: (menus, { eq }) => eq(menus.id, menuId) })
            if (!menu) {
                throw new NotFoundException(`Menu with id ${menuId} not found`)
            }
            return menu
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get menu by id ${menuId}`, error.stack)
            } else {
                this.logger.error(`Failed to get menu by id ${menuId}`)
            }
            throw error
        }
    }

    async getMenusByStoreId(storeId: string,) {
        try {
            const menus = await this.drizzleService.partnersDb.query.menus
                .findMany(
                    {
                        where: (menus, { eq, }) => eq(menus.storeId, storeId),
                        orderBy: (menus, { asc }) => asc(menus.sort),
                    }
                )
            return menus
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get menus by store id ${storeId}`, error.stack)
            } else {
                this.logger.error(`Failed to get menus by store id ${storeId}`)
            }
            throw error
        }
    }

    async getOrCreateStoreSiteDefaultMenu(siteId: string) {
        this.logger.log(`Getting or creating default menu for site id ${siteId}`)
        try {
            const storeSite = await this.storeService.getSiteById(siteId)
            if (storeSite) {
                this.logger.log(`Found store site with id ${siteId}`)
                const menu = await this.drizzleService.partnersDb.query
                    .menus
                    .findFirst({
                        where: (menus, { eq }) => eq(menus.id, storeSite.id),
                    })
                if (menu) {
                    this.logger.log(`Found existing menu for site id ${siteId}`)
                    return menu
                } else {
                    this.logger.log(`No existing menu found for site id ${siteId}, creating default menu`)
                    const result = await this.drizzleService.partnersDb
                        .insert(partnersSchema.menus)
                        .values({
                            id: storeSite.id, // This is really important !!!
                            storeId: storeSite.storeId,
                            name: '',
                            description: '',
                            enabled: true,
                            sort: 1,
                            status: Menutatus.APPROVED,
                        }).returning()
                    const defaultMenu = result.pop()

                    if (defaultMenu) {
                        this.logger.log(`Created default menu for site id ${siteId}`)
                        return defaultMenu
                    } else {
                        throw new InternalServerErrorException('Failed to create default menu')
                    }
                }
            } else {
                throw new NotFoundException(`Store site with id ${siteId} not found`)
            }
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get or create default menu for site id ${siteId}`, error.stack)
            } else {
                this.logger.error(`Failed to get or create default menu for site id ${siteId}`)
            }
            throw error
        }
    }

    async createMenu(params: CreateMenuParams, isMainMenu = false) {

        let insertMenuParams: InsertMenuParams = {
            storeId: params.storeId,
            storeSiteId: params.siteId,
            name: params.name,
            description: params.description,
            status: Menutatus.DRAFT,
            enabled: true,
        }

        if (isMainMenu) insertMenuParams.id = params.siteId

        try {
            const [createdMenu] = await this.drizzleService.partnersDb
                .insert(partnersSchema.menus)
                .values(insertMenuParams).returning()

            if (!createdMenu) {
                throw new Error('Failed to insert menu in database')
            }

            return createdMenu
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error('Failed to create menu', error.stack)
            } else {
                this.logger.error('Failed to create menu')
            }
            throw error
        }
    }

    async updateMenu(params: UpdateMenuParams) {
        let updateQuery: Partial<typeof partnersSchema.menus.$inferInsert> = {
            name: params.name,
            description: params.description,
            enabled: params.enabled,
            status: Menutatus.DRAFT,
            storeSiteId: params.siteId,
        }

        try {
            const [updatedMenu] = await this.drizzleService.partnersDb
                .update(partnersSchema.menus)
                .set(updateQuery)
                .where(eq(partnersSchema.menus.id, params.id))
                .returning()

            if (!updatedMenu) {
                throw new Error('Failed to update menu in database')
            }

            return updatedMenu
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to update menu with id ${params.id}`, error.stack)
            } else {
                this.logger.error(`Failed to update menu with id ${params.id}`)
            }
            throw error
        }
    }


    async createMenuCategory(params: CreateMenuCategoryParams) {
        try {
            const lastCategory = await this.drizzleService.partnersDb.query.menuCategories.findFirst({
                where: (menuCategories, { eq }) => eq(menuCategories.menuId, params.menuId),
                orderBy: (menuCategories, { desc }) => desc(menuCategories.sort),
            })

            const sortOrder = lastCategory ? lastCategory.sort + 1 : 1
            const categorCreateResult = await this.drizzleService.partnersDb
                .insert(partnersSchema.menuCategories)
                .values({
                    menuId: params.menuId,
                    name: params.name,
                    enabled: true,
                    sort: sortOrder,
                    status: '',
                }).returning()
            const createdCategory = categorCreateResult.pop()

            if (!createdCategory) {
                throw new Error('Failed to insert menu category in database')
            }

            this.logger.log(`Menu category created with id ${createdCategory.id} for menu ${params.menuId}`)
            return createdCategory
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error('Failed to create menu category', error.stack)
            } else {
                this.logger.error('Failed to create menu category')
            }
            throw error
        }
    }


    async updateMenuCategory(params: UpdateMenuCategoryParams) {
        try {
            const updateResult = await this.drizzleService.partnersDb
                .update(partnersSchema.menuCategories)
                .set({
                    name: params.name,
                    description: params.description,
                }).where(eq(partnersSchema.menuCategories.id, params.id))
                .returning()
            const updatedCategory = updateResult.pop()

            if (updatedCategory) {
                this.logger.log(`Menu category with id ${params.id} updated successfully`)
                return updatedCategory
            } else {
                this.logger.error(`Failed to update menu category with id ${params.id}`)
                throw new InternalServerErrorException('Failed to update menu category')
            }

        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to update menu category with id ${params.id}`, error.stack)
            } else {
                this.logger.error(`Failed to update menu category with id ${params.id}`)
            }
            throw error
        }
    }

    async getMenuCategories(menuId: string) {
        try {
            const categories = this.drizzleService.partnersDb
                .query.
                menuCategories
                .findMany({
                    where: (menuCategories, { eq }) => eq(menuCategories.menuId, menuId)
                })

            return categories
        } catch (error) {
            throw error
        }
    }

    async resortMenuCategories(menuId: string, newOrder: string[]) {
        this.logger.log(`Resorting categories for menu ${menuId}`)
        const categories = await this.getMenuCategories(menuId)
        const categoryMap = new Map(categories.map(category => [category.id, category]))

        await this.drizzleService.partnersDb.transaction(async (tx) => {
            for (const [index, categoryId] of newOrder.entries()) {
                const category = categoryMap.get(categoryId)
                if (!category) {
                    this.logger.warn(`Category with id ${categoryId} not found in menu ${menuId}`)
                    throw new NotFoundException(`Category with id ${categoryId} not found in menu ${menuId}`)
                }
                this.logger.log(`Updating sort order for category ${categoryId} to ${index + 1}`)
                try {
                    await tx.update(partnersSchema.menuCategories)
                        .set({ sort: index + 1 })
                        .where(eq(partnersSchema.menuCategories.id, categoryId))
                        .returning()
                } catch (err) {
                    tx.rollback()
                    throw err
                }
            }
        })
        this.logger.log(`Successfully resorted categories for menu ${menuId}`)

        return newOrder
    }



}
