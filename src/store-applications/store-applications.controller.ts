import { Body, Controller, Logger, UseGuards, Post, UseInterceptors, UploadedFiles, UploadedFile, BadRequestException, Get } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';
import { CreateApplicationDto } from './applications.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { RequestUser } from 'src/users/users.types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VerificationFileType } from 'src/storage/file-type.enum';

// ✅ File type validation using FileType enum
const fileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
    const allowedMimeTypes = Object.values(VerificationFileType);
    if (allowedMimeTypes.includes(file.mimetype as VerificationFileType)) {
        cb(null, true); // Accept the file
    } else {
        cb(
            new BadRequestException(
                `Invalid file type: ${file.originalname}. Allowed types: ${allowedMimeTypes.join(', ')}`
            ),
            false
        );
    }
};

@Controller('store-applications')
@UseGuards(ClerkAuthGuard)
export class StoreApplicationsController {
    private readonly logger = new Logger(StoreApplicationsController.name);

    constructor(private readonly applicationsService: StoreApplicationsService) { }

    @Post('apply')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'id_card_back', maxCount: 1 },
            { name: 'id_card_front', maxCount: 1 },
            { name: 'store_image', maxCount: 1 },
        ], { fileFilter })
    )
    async applyForStore(
        @CurrentUser() user: RequestUser,
        @UploadedFiles() files: { id_card_back: Express.Multer.File[], id_card_front: Express.Multer.File[], store_image: Express.Multer.File[] },
        @Body() dto: CreateApplicationDto,
    ) {

        this.logger.log(`Received store application for user ${user.clerkId}`);
        if (!files.id_card_back || !files.id_card_front || !files.store_image) {
            throw new BadRequestException('Please provide all required files');
        }
        return this.applicationsService.applyForStore(dto, user.clerkId, {
            id_card_back: files.id_card_back[0],
            id_card_front: files.id_card_front[0],
            store_image: files.store_image[0],
        });
    }

    @Get()
    async getApplications(@CurrentUser() user: RequestUser) {
        return this.applicationsService.getUserApplications(user.clerkId);
    }

}
