import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { ImageStatus, ImageType } from './image.types';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';



interface UploadImageParams {
    storeId: string
    file: Express.Multer.File,
    type: ImageType,
    entityId: string,
}

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
        entityId,
        storeId,
    }: UploadImageParams) {
        const imageFile = await this.storageService.uploadFileToDirectus(file, storeId)

        const [image] = await this.drizzleService.partnersDb
            .insert(partnersSchema.images)
            .values({
                file_id: imageFile.id,
                storeId: storeId,
                type: type,
                status: ImageStatus.REVIEW,

            }).returning()
    }
}
