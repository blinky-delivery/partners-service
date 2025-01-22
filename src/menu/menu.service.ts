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

    async createMenu(params: CreateMenuParams) {
        try {
            const [createdMenu] = await this.drizzleService.partnersDb
                .insert(partnersSchema.menus)
                .values({
                    storeId: params.storeId,
                    storeSiteId: params.siteId,
                    name: params.name,
                    description: params.description,
                    status: Menutatus.DRAFT,
                    enabled: true,
                }).returning()

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

    async updateMenuCoverImage(menuId: string, coverImage: Express.Multer.File) {
        try {
            const menu = await this.getMenuById(menuId)
            const folder = await this.storeService.createOrGetStoreFileFolder(menu.storeId)
            if (!folder) throw new InternalServerErrorException("Error getting store files folder")
            const coverImageFile = await this.storageService.uploadFileToDirectus(coverImage, folder.id)

            const updatedMenu = await this.drizzleService.partnersDb
                .update(partnersSchema.menus)
                .set({ coverImage: coverImageFile.id })
                .where(eq(partnersSchema.menus.id, menuId))
                .returning()

            if (!updatedMenu) {
                throw new Error('Failed to update menu cover image in database')
            }

            return coverImageFile.id
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to update cover image for menu with id ${menuId}`, error.stack)
            } else {
                this.logger.error(`Failed to update cover image for menu with id ${menuId}`)
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
