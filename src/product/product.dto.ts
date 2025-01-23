interface CreateProdcutDto {
    menuCategoryId: string
    name: string
    description: string | null
    price: number
    taxRate: number | null
}