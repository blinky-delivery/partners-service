import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";

export interface CartItemDto {
    productId: string;
    quantity: number;
    selectedOptions: {
        modifierOptionId: string;
        quantity: number;
    }[];
}

export interface PriceEstimationRequestDto {
    storeSiteId: string;
    deliveryLocation: {
        latitude: number;
        longitude: number;
    };
    items: CartItemDto[];
}

export interface PriceEstimationResponseDto {
    breakdown: {
        itemsTotal: number;
        deliveryPrice: number;
        taxAmount: number;
        serviceFee: number;
        total: number;
    };
    approximatedDistance: number;
    currency: string;
}

export class CreateOrderDto {
    @IsUUID()
    customerId!: string;

    @IsUUID()
    storeSiteId!: string;

    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];

    @ValidateNested()
    @Type(() => DeliveryDetailsDto)
    deliveryDetails!: DeliveryDetailsDto;
}

export class OrderItemDto {
    @IsUUID()
    productId!: string;

    @IsNumber()
    @Min(1)
    quantity!: number;

    @ValidateNested({ each: true })
    @Type(() => OrderItemOptionDto)
    selectedOptions!: OrderItemOptionDto[];
}

export class OrderItemOptionDto {
    @IsUUID()
    modifierOptionId!: string;

    @IsNumber()
    @Min(1)
    quantity!: number;
}

export class DeliveryDetailsDto {
    @IsNumber()
    latitude!: number;

    @IsNumber()
    longitude!: number;

    @IsString()
    address!: string;

    @IsOptional()
    @IsString()
    specialInstructions?: string;
}