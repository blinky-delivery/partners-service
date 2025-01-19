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