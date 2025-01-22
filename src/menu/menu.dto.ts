export interface CreateDraftMenuDto {
    name: string
    description: string
    storeId: string
    siteId: string
}

export interface UpdateMenuDto {
    name: string
    description: string
    siteId: string
    enabled: boolean
}

export interface CreateMenuCategoryDto {
    menuId: string
    name: string
    description: string | null
}

export interface ResortMenuCategoriesDto {
    menuId: string
    newOrder: string[]
}