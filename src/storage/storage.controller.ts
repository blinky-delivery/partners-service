import { Controller, FileTypeValidator, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { DirectusFolder, FileType, StorageService } from "./storage.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('storeId') storeId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 100000 }),
                    new FileTypeValidator({ fileType: 'image/jpeg' })
                ]
            })
        ) file: Express.Multer.File
    ) {
        const filePath = await this.storageService.uploadFileToDirectus(file, DirectusFolder.store_applications);
        return { message: 'File uploaded successfully', path: filePath };
    }
}