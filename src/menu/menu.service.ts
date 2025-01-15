import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { databaseSchema } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { MenuVersionStatus, MenuWithVersionResponse } from './menu.types';

export interface CreateDraftMenuParams {
    name: string
    description: string
    storeId: string
}

@Injectable()
export class MenuService {
    private readonly logger = new Logger(MenuService.name)
    constructor(private readonly drizzleService: DrizzleService) { }

    async getMenusByStoreId(storeId: string) {
        try {
            const menus = await this.drizzleService.db.select().from(databaseSchema.menus).where(eq(databaseSchema.menus.storeId, storeId))
            return menus
        } catch (error) {
        }
    }

    async getMenuById(menuId: string) {
        try {
            const menus = (await this.drizzleService.db.select().from(databaseSchema.menus).where(eq(databaseSchema.menus.id, menuId)))
            const menu = menus.pop()
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

    async createDraftMenu(params: CreateDraftMenuParams) {
        const menuWithDraftVersion = await this.drizzleService.db.transaction(async (tx) => {
            const [menu] = await tx.insert(databaseSchema.menus)
                .values({
                    storeId: params.storeId,
                }).returning()

            if (!menu) {
                tx.rollback()
                this.logger.error('Failed to insert menu')
                throw new InternalServerErrorException('Failed to insert menu')
            }

            const [menuDraftVersion] = await tx
                .insert(databaseSchema.menuVersions)
                .values({
                    menu_id: menu.id,
                    name: params.name,
                    description: params.description,
                    status: MenuVersionStatus.DRAFT,
                }).returning()

            if (!menuDraftVersion) {
                tx.rollback()
                this.logger.error('Failed to insert menu draft version')
                throw new InternalServerErrorException('Failed to insert menu draft version')
            }

            const [menuWithDraftVersion] = await tx.update(databaseSchema.menus).set({
                inProgressMenuVersionId: menuDraftVersion.id
            }).returning()

            if (!menuWithDraftVersion) {
                tx.rollback()
                this.logger.error('Failed to set menu draft version on menu')
                throw new InternalServerErrorException('Failed to set menu draft version on menu')
            }


            return menuDraftVersion


        })

        const createdMenu = await this.drizzleService.db.query.menus.findFirst({
            where: (menus, { eq }) => eq(menus.id, menuWithDraftVersion.id),
            with: {
                inProgressMenuVersion: true,
                publishedMenuVersion: true
            }
        })

        if (!createdMenu) {
            this.logger.error('Failed to retrieve the created menu with draft version')
            throw new InternalServerErrorException('Failed to retrieve the created menu with draft version')
        }

        return createdMenu
    }



}
