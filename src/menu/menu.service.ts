import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import { partnersSchema } from 'src/database/partners.database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { Menutatus } from './menu.types';

export interface CreateMenuParams {
    name: string
    description: string
    storeId: string
    siteId: string
}

@Injectable()
export class MenuService {
    private readonly logger = new Logger(MenuService.name)
    constructor(private readonly drizzleService: DrizzleService) { }

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

    async getMenusByStoreSiteId(storeId: string, siteId?: string) {
        try {
            const menus = await this.drizzleService.partnersDb.query.menus.findMany({ where: (menus, { eq, and }) => siteId != undefined ? and(eq(menus.storeId, storeId), eq(menus.storeSiteId, siteId)) : eq(menus.storeId, storeId) })
            return menus
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get menus by store id ${storeId} and store site id ${siteId}`, error.stack)
            } else {
                this.logger.error(`Failed to get menus by store id ${storeId} and store site id ${siteId}`)
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



}
