import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { ImageStatus, ImageType } from './image.types';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';
import { eq } from 'drizzle-orm';

interface UploadImageParams {
    storeId: string
    storeSiteId: string | null
    file: Express.Multer.File,
    type: ImageType,
    productId: string | null
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
        productId,
    }: UploadImageParams) {
        try {
            const imageFile = await this.storageService.uploadFileToDirectus(file, storeId);

            const insertQuery: InsertImage = {
                fileId: imageFile.id,
                storeId,
                storeSiteId,
                type,
                status: ImageStatus.REVIEW,
            };

            if (type === ImageType.ITEM_PHOTO && productId) {
                insertQuery.productId = productId;
            }

            const image = await this.drizzleService.partnersDb.transaction(async (tx) => {
                const [insertedImage] = await tx.insert(partnersSchema.images)
                    .values(insertQuery)
                    .returning();

                if (insertedImage && type === ImageType.ITEM_PHOTO && productId) {
                    await tx.update(partnersSchema.products)
                        .set({ primaryImageId: insertedImage.id })
                        .where(eq(partnersSchema.products.id, productId));
                }

                return insertedImage;
            });

            return image;
        } catch (error) {
            this.logger.error('Failed to upload image', error);
            throw error;
        }
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
