import { Controller, FileTypeValidator, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileType, StorageService } from "./storage.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post(':storeId/upload/:type')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('storeId') storeId: string,
        @Param('type') type: FileType,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10000 }),
                    new FileTypeValidator({ fileType: 'image/jpeg' })
                ]
            })
        ) file: Express.Multer.File
    ) {
        const filePath = await this.storageService.uploadFile(storeId, file, type);
        return { message: 'File uploaded successfully', path: filePath };
    }
}