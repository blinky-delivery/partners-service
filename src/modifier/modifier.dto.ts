export interface CreateModiferDto {
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