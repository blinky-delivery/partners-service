import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { DeliveryCalculatorService } from '../delivery-calculator/delivery-calculator.service';
import { CartItemDto, PriceEstimationRequestDto, PriceEstimationResponseDto } from '../order.dto';
import { StoreService } from 'src/store/store.service';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class OrderPricingService {
    private readonly logger = new Logger(OrderPricingService.name)
    private readonly TAX_RATE = 0.1; // 10%
    private readonly SERVICE_FEE_RATE = 0.05; // 5%
    private readonly BASE_DELIVERY_FEE = 20; // Base delivery fee in MAD
    private readonly DELIVERY_RATE_PER_KM = 5;

    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly deliveryCalculator: DeliveryCalculatorService,
        private readonly storeService: StoreService,
        private readonly productService: ProductService,
    ) { }


    async estimateOrderPice(dto: PriceEstimationRequestDto): Promise<PriceEstimationResponseDto> {
        const storeSite = await this.storeService.getSiteById(dto.storeSiteId)

        if (!storeSite) {
            throw new Error('Store site not found')
        }

        if (storeSite.latitude === null || storeSite.longitude === null) {
            throw new Error('Store site location not found')
        }

        const distanceResult = await this.deliveryCalculator.calculateDistance(
            { lat: storeSite.latitude, lng: storeSite.longitude },
            { lat: dto.deliveryLocation.latitude, lng: dto.deliveryLocation.longitude },
        )

        const itemsTotal = await this.calculateItemsTotal(dto.items)

        const deliveryPrice = await this.calculateDeliveryPrice(distanceResult.distance)

        const taxAmount = itemsTotal * this.TAX_RATE

        const serviceFee = (itemsTotal + deliveryPrice) * this.SERVICE_FEE_RATE

        const totalAmount = itemsTotal + deliveryPrice + taxAmount + serviceFee


        return {
            breakdown: {
                itemsTotal: Number(itemsTotal.toFixed(2)),
                deliveryPrice: Number(deliveryPrice.toFixed(2)),
                taxAmount: Number(taxAmount.toFixed(2)),
                serviceFee: Number(serviceFee.toFixed(2)),
                total: Number(totalAmount.toFixed(2))
            },
            approximatedDistance: distanceResult.distance,
            currency: 'MAD',
        }

    }

    private async calculateItemsTotal(items: CartItemDto[]): Promise<number> {
        let total = 0

        for (const item of items) {
            const product = await this.productService.getProductById(item.productId)

            if (!product) {
                this.logger.error(`Product ${item.productId} not found`)
                throw new Error(`Product ${item.productId} not found`)
            }

            const basePrice = product.price * item.quantity

            let modifersPrice = 0

            for (const option of item.selectedOptions) {
                const modifierOption = await this.productService.getModiferOptionById(option.modifierOptionId)

                if (modifierOption) {
                    modifersPrice += modifierOption.price
                }
            }

            total += basePrice + modifersPrice
        }

        return total
    }


    private calculateDeliveryPrice(distanceMeters: number): number {
        const distanceKm = distanceMeters / 1000;
        return this.BASE_DELIVERY_FEE + (distanceKm * this.DELIVERY_RATE_PER_KM);
    }
}
