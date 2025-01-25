import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { ImageStatus, ImageType } from './image.types';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

interface UploadImageParams {
    storeId: string
    storeSiteId: string | null
    file: Express.Multer.File,
    type: ImageType,
    productParams?: {
        productId: string
    },
}

interface GetImagesParams {
    storeId: string
    type: ImageType,
    status: ImageStatus,
}

type InsertImage = typeof partnersSchema.images.$inferInsert

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name)
    constructor(
        private readonly storageService: StorageService,
        private readonly drizzleService: DrizzleService,
    ) {
    }

    async uploadImage({
        file,
        type,
        storeId,
        storeSiteId,
        productParams,
    }: UploadImageParams) {

        const imageFile = await this.storageService.uploadFileToDirectus(file, storeId)

        let insertQuery: InsertImage = {
            fileId: imageFile.id,
            storeId: storeId,
            storeSiteId: storeSiteId,
            type: type,
            status: ImageStatus.REVIEW,
        }

        if (type == ImageType.ITEM_PHOTO && productParams) {
            insertQuery.productId = productParams.productId
        }

        // await this.drizzleService.partnersDb

        const [image] = await this.drizzleService.partnersDb
            .insert(partnersSchema.images)
            .values(insertQuery).returning()

        return image

    }

    async getStoreImages({
        storeId,
        type,
        status,
    }: GetImagesParams) {
        const images = await this.drizzleService.partnersDb
            .query.images.findMany({
                where: (fields, { eq, and }) => and(
                    eq(fields.storeId, storeId),
                    eq(fields.status, status),
                    eq(fields.type, type),
                )
            })

        return images

    }



}
