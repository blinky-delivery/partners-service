import { ImageStatus, ImageType } from "./image.types"

export interface UploadImageDto {
    storeId: string
    storeSiteId: string | null
    type: ImageType
    file: Express.Multer.File
    productId: string | null
}
