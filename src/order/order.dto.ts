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