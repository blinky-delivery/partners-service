import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';


export interface CreateModifierParams {
    menuId: string
    storeSiteId: string
    name: string
    productsIds: string[]
    required: boolean
    multipleAllowed: boolean
    minQuantity: number
    maxQuantity: number
    maxFreeQuantity: number
    options: {
        name: string
        price: number
    }[],
}
export interface UpdateModifierParams {
    id: string
    name: string
    required: boolean
    multipleAllowed: boolean
    minQuantity: number
    maxQuantity: number
    maxFreeQuantity: number
    options: {
        name: string
        price: number
    }[],
    productsIds: string[]
}
@Injectable()
export class ModifierService {
    private readonly logger = new Logger(ModifierService.name)
    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }

    async getModifiersByStoreSiteId(storeSiteId: string) {
        this.logger.log(`Fetching modifiers for storeSiteId: ${storeSiteId}`);
        try {
            const modifiers = await this.drizzleService.partnersDb
                .query
                .modifiers
                .findMany({
                    where: ((fields, { eq }) => eq(fields.storeSiteId, storeSiteId)),
                    with: {
                        options: true,
                        modifiersToProducts: {
                            with: {
                                product: true
                            }
                        }
                    }
                })

            return modifiers;
        } catch (error) {
            this.logger.error('Failed to fetch modifiers', error);
            throw error;
        }
    }

    async createModifer(params: CreateModifierParams) {
        this.logger.log('Starting createModifier transaction');
        await this.drizzleService.partnersDb.transaction(async (tx) => {
            try {
                this.logger.log('Inserting modifier');
                const insertModiferResult = await tx.insert(partnersSchema.modifiers)
                    .values({
                        storeSiteId: params.storeSiteId,
                        menuId: params.menuId,
                        name: params.name,
                        maxQuantity: params.maxQuantity,
                        minQuantity: params.minQuantity,
                        maxFreeQuantity: params.maxFreeQuantity,
                        multipleAllowed: params.multipleAllowed,
                        required: params.required,
                    }).returning()

                const modifier = insertModiferResult.pop()
                const modiferOptions = params.options

                if (modifier && modiferOptions.length) {
                    this.logger.log('Inserting modifier options')
                    for (const [index, option] of modiferOptions.entries()) {
                        await tx.insert(partnersSchema.modifierOptions)
                            .values({
                                modiferId: modifier.id,
                                name: option.name,
                                price: option.price,
                                sort: index + 1
                            })
                    }
                    this.logger.log('Inserting modifier associated products')
                    for (const [_, productId] of params.productsIds.entries()) {
                        await tx.insert(partnersSchema.modifiersToProducts).values({
                            modifierId: modifier.id,
                            prdocutId: productId,
                        })
                    }
                }
                this.logger.log('Transaction completed successfully');
            } catch (error) {
                this.logger.error('Transaction failed, rolling back', error);
                tx.rollback()
                throw error
            }
        })
    }



    async updateModifier(params: UpdateModifierParams) {
        this.logger.log(`Updating modifier with id: ${params.id}`);
        try {
            const modifier = await this.drizzleService.partnersDb.query
                .modifiers
                .findFirst({
                    where: ((fields, { eq }) => eq(fields.id, params.id))
                });
            if (!modifier) {
                this.logger.warn(`Modifier with id: ${params.id} not found`);
                throw new NotFoundException();
            }

            const updatedModifier = await this.drizzleService.partnersDb.transaction(async (tx) => {
                try {
                    this.logger.log(`Updating modifier details for id: ${params.id}`)
                    const updateResult = await tx
                        .update(partnersSchema.modifiers)
                        .set({
                            name: params.name,
                            required: params.required,
                            maxFreeQuantity: params.maxFreeQuantity,
                            minQuantity: params.minQuantity,
                            multipleAllowed: params.multipleAllowed,
                            maxQuantity: params.maxQuantity,
                        })
                        .where(eq(partnersSchema.modifiers.id, params.id))
                        .returning()

                    const updatedModifer = updateResult.pop()
                    if (!updatedModifer) throw new InternalServerErrorException(`Could not update modifier details with id: ${params.id}`)

                    this.logger.log(`Resetting options for modifier id: ${params.id}`)
                    await tx.delete(partnersSchema.modifierOptions)
                        .where(eq(partnersSchema.modifierOptions.modiferId, modifier.id))

                    for (const [index, option] of params.options.entries()) {
                        await tx.insert(partnersSchema.modifierOptions)
                            .values({
                                modiferId: modifier.id,
                                name: option.name,
                                price: option.price,
                                sort: index + 1
                            });
                    }

                    this.logger.log(`Resetting associated products for modifier id: ${params.id}`)
                    await tx.delete(partnersSchema.modifiersToProducts)
                        .where(eq(partnersSchema.modifiersToProducts.modifierId, modifier.id))
                    for (const [_, productId] of params.productsIds.entries()) {
                        await tx.insert(partnersSchema.modifiersToProducts).values({
                            modifierId: modifier.id,
                            prdocutId: productId,
                        })
                    }

                    this.logger.log(`Modifier with id: ${params.id} updated successfully`)
                    return updatedModifer

                } catch (error) {
                    this.logger.error(`Failed to update modifier with id: ${params.id}, rolling back`, error)
                    tx.rollback();
                    throw error;
                }
            })

            return updatedModifier
        } catch (error) {
            this.logger.error(`Failed to update modifier with id: ${params.id}`, error)
            throw error;
        }
    }

}
