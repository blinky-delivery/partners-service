import { Injectable, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { OrderPricingService } from '../order-pricing/order-pricing.service';
import { DrizzleService, Transaction } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';
import { CreateOrderDto } from '../order.dto';
import { custom, options } from 'joi';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';


@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly drizzle: DrizzleService,
        private readonly pricingService: OrderPricingService,
    ) { }



    async createOrder(createOrderDto: CreateOrderDto) {
        return this.drizzle.partnersDb.transaction(async (tx) => {

            try {
                const customer = await tx.query.customers.findFirst({
                    where: eq(partnersSchema.customers.id, createOrderDto.customerId),
                });
                if (!customer) throw new Error('Customer not found');

                const storeSite = await tx.query.storeSites.findFirst({
                    where: eq(partnersSchema.storeSites.id, createOrderDto.storeSiteId),
                });
                if (!storeSite) throw new Error('Store site not found');

                const orderCode = await this.generateStoreSiteOrderCode(tx, createOrderDto.storeSiteId)

                const priceEstimation = await this.pricingService.estimateOrderPice({
                    storeSiteId: createOrderDto.storeSiteId,
                    deliveryLocation: createOrderDto.deliveryDetails,
                    items: createOrderDto.items,
                });

                const [order] = await tx.insert(partnersSchema.orders)
                    .values({
                        customerId: createOrderDto.customerId,
                        storeSiteId: createOrderDto.storeSiteId,
                        deliveryAddress: createOrderDto.deliveryDetails.address,
                        deliveryLatitude: createOrderDto.deliveryDetails.latitude,
                        deliveryLongitude: createOrderDto.deliveryDetails.longitude,
                        deliveryLocation: sql`ST_SetSRID(ST_MakePoint(${createOrderDto.deliveryDetails.longitude}, ${createOrderDto.deliveryDetails.latitude}), 4326)`,
                        totalAmount: priceEstimation.breakdown.total,
                        status: 'pending',
                        approximatedDistance: priceEstimation.approximatedDistance,
                        deliveryPrice: priceEstimation.breakdown.deliveryPrice,
                        taxAmount: priceEstimation.breakdown.taxAmount,
                        serviceFee: priceEstimation.breakdown.serviceFee,
                        itemsAmount: priceEstimation.breakdown.itemsTotal,
                        orderCode: orderCode,

                    })
                    .returning();

                for (const item of createOrderDto.items) {
                    const product = await tx.query.products.findFirst({
                        where: eq(partnersSchema.products.id, item.productId),
                    });

                    if (!product) {
                        this.logger.warn(`Product ${item.productId} not found, skipping`);
                        continue;
                    }

                    const [orderItem] = await tx.insert(partnersSchema.orderItems)
                        .values({
                            orderId: order.id,
                            productId: item.productId,
                            productName: product.name,
                            basePrice: product.price,
                            quantity: item.quantity,
                        })
                        .returning();

                    // 6. Create order item options
                    for (const option of item.selectedOptions) {
                        const modifierOption = await tx.query.modifierOptions.findFirst({
                            where: eq(partnersSchema.modifierOptions.id, option.modifierOptionId),
                        });

                        if (modifierOption) {
                            await tx.insert(partnersSchema.orderItemOptions)
                                .values({
                                    orderItemId: orderItem.id,
                                    modifierOptionId: option.modifierOptionId,
                                    optionName: modifierOption.name,
                                    optionPrice: modifierOption.price,
                                    quantity: option.quantity,
                                });
                        }
                    }
                }

                return this.getOrderDetails(order.id);
            } catch (error) {
                this.logger.error(`Order creation failed: ${error}`);
                throw new Error('Failed to create order');
            }
        });
    }

    async getOrderDetails(orderId: string) {
        return this.drizzle.partnersDb.query.orders.findFirst({
            where: eq(partnersSchema.orders.id, orderId),
            with: {
                items: {
                    with: {
                        options: true,
                    }
                },
                customer: true,
                storeSite: true,
            },
        });
    }

    private async generateStoreSiteOrderCode(
        tx: Transaction,
        storeSiteId: string
    ): Promise<string> {
        const now = new Date();
        const datePart = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD format

        // Get or create sequence using Drizzle's query builder
        const [sequence] = await tx
            .insert(partnersSchema.storeSiteDailySequences)
            .values({
                storeSiteId,
                date: sql`CURRENT_DATE`,
                lastSequence: 1,
            })
            .onConflictDoUpdate({
                target: [
                    partnersSchema.storeSiteDailySequences.storeSiteId,
                    partnersSchema.storeSiteDailySequences.date
                ],
                set: {
                    lastSequence: sql`${partnersSchema.storeSiteDailySequences.lastSequence} + 1`
                }
            })
            .returning({
                lastSequence: partnersSchema.storeSiteDailySequences.lastSequence
            });

        if (!sequence) throw new Error('Failed to generate sequence');

        const sequenceNumber = sequence.lastSequence;
        if (sequenceNumber > 9999) throw new Error('Daily order limit exceeded');

        return `${datePart}${sequenceNumber.toString().padStart(4, '0')}`;
    }
}