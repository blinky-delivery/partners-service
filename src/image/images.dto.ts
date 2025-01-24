import { ImageStatus, ImageType } from "./image.types"

export interface UploadImageDto {
    storeId: string
    storeSiteId: string | null
    file: Express.Multer.File
    type: ImageType
    productParams?: {
        productId: string
    }
}

export interface GetImagesParams {
    storeId: string
    type: ImageType,
    status: ImageStatus,
}