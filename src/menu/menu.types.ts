export enum MenuVersionStatus {
    DRAFT = 'DRAFT',
    REVIEW = 'REVIEW',
    APPROVED = 'APPROVED',
    ARCHIVED = 'ARCHIVED'
}

export interface MenuWithVersionResponse {
    menu: any
    menuVersion: any
}