export interface CreateProdcutDto {
    menuCategoryId: string
    name: string
    description: string | null
    price: number
    taxRate: number | null
}

export interface UpdateProductDto {
    productId: string
    menuCategoryId: string
    name: string
    description: string | null,
    price: number
    taxRate: number | null
    primaryImageId: string | null
}


export interface ResortProductsDto {
    menuCategoryId: string
    newOrder: string[]
}