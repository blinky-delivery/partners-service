import { BadRequestException, Body, Controller, Logger, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/users/users.types';
import { UploadImageDto } from './images.dto';
import { ImageFileType } from 'src/storage/file-type.enum';


const ImageFileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
    const allowedMimeTypes = Object.values(ImageFileType);
    if (allowedMimeTypes.includes(file.mimetype as ImageFileType)) {
        cb(null, true); // Accept the file
    } else {
        cb(
            new BadRequestException(
                `Invalid image file type: ${file.originalname}. Allowed types: ${allowedMimeTypes.join(', ')}`
            ),
            false
        );
    }
};

@Controller('image')
@UseGuards(ClerkAuthGuard)
export class ImageController {
    private readonly logger = new Logger(ImageController.name)
    constructor(
        private readonly imageService: ImageService,
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { fileFilter: ImageFileFilter }))
    async uploadImage(
        @CurrentUser() user: RequestUser,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5000 })
                ]
            })
        ) imageFile: Express.Multer.File,
        @Body() dto: UploadImageDto,

    ) {
        return this.imageService.uploadImage({
            file: imageFile,
            storeId: dto.storeId,
            storeSiteId: dto.storeSiteId,
            type: dto.type,
            productParams: dto.productParams,
        })
    }

}
