import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './applications.dto';
import { DirectusService } from 'src/directus/directus.service';
import { UsersService } from 'src/users/users.service';
import { DirectusFolder, StorageService } from 'src/storage/storage.service';
import { createItem, readItems } from '@directus/sdk';
import { VerificationFileType } from 'src/storage/file-type.enum'
import { StoreService } from 'src/store/store.service';


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
}
@Injectable()
export class StoreApplicationsService {
    private readonly logger = new Logger(StoreApplicationsService.name);

    constructor(
        private readonly directusService: DirectusService,
        private readonly storageService: StorageService,
        private readonly userService: UsersService,
        private readonly storeService: StoreService,
    ) { }

    async applyForStore(dto: CreateApplicationDto, extAuthId: string, verificationFiles: { id_card_back: Express.Multer.File, id_card_front: Express.Multer.File, store_image: Express.Multer.File }) {

        const { id_card_back_file_id, id_card_front_file_id, store_image_file_id } = await this.uploadVerificationFiles(
            verificationFiles.id_card_back,
            verificationFiles.id_card_front,
            verificationFiles.store_image
        );

        const user = await this.userService.getUserByExtAuthId(extAuthId);

        this.logger.log('Checking for existing applications');
        await this.checkExistingApplication(user.id);

        this.logger.log('Submitting store application');
        return this.submitApplication(dto, user.id, id_card_back_file_id, id_card_front_file_id, store_image_file_id);
    }


    private async uploadVerificationFiles(id_card_back_file: Express.Multer.File, id_card_front_file: Express.Multer.File, store_image_file: Express.Multer.File) {
        try {
            const id_card_back_file_id = (await this.storageService.uploadFileToDirectus(id_card_back_file, DirectusFolder.store_applications)).id;
            const id_card_front_file_id = (await this.storageService.uploadFileToDirectus(id_card_front_file, DirectusFolder.store_applications)).id;
            const store_image_file_id = (await this.storageService.uploadFileToDirectus(store_image_file, DirectusFolder.store_applications)).id;

            return { id_card_back_file_id, id_card_front_file_id, store_image_file_id };
        } catch (error) {
            this.logger.error('Failed to upload verification files');
            console.error(error);
            throw new InternalServerErrorException('Failed to upload verification files');
        }
    }

    private async checkExistingApplication(userId: string) {
        const existingApplications = await this.directusService.client.request(readItems('store_applications', {
            filter: {
                user_id: { _eq: userId },
                under_review: { _eq: true }
            }
        }));

        if (existingApplications.length > 0) {
            throw new BadRequestException('You already have an application under review or approved.');
        }
    }

    private async submitApplication(dto: CreateApplicationDto, userId: string, id_card_back_file_id: string, id_card_front_file_id: string, store_image_file_id: string) {
        try {
            const application = await this.directusService.client.request(createItem('store_applications', {
                user_id: userId,
                store_type_id: dto.storeType,
                city_id: dto.city,
                name: dto.name,
                contact_phone: dto.contactPhone,
                number_of_sites: dto.numberOfSites,
                address: dto.address,
                id_card_front: id_card_front_file_id,
                id_card_back: id_card_back_file_id,
                store_image: store_image_file_id
            }))

            const store = await this.storeService.setUpStore(
                {
                    name: dto.name,
                    address: dto.address,
                    city: dto.city,
                    applicationId: application.id,
                    contactPhone: dto.contactPhone,
                    numberOfSites: dto.numberOfSites,
                    storeType: dto.storeType,
                    userId: userId,
                }
            )

        } catch (error) {
            this.logger.error('Failed to submit application');
            throw new InternalServerErrorException('Failed to submit application');
        }
    }

    async getUserApplications(extAuthId: string) {
        const user = await this.userService.getUserByExtAuthId(extAuthId);
        this.logger.log(`Fetching applications for user with ID: ${user.id}`);
        try {
            const applications = await this.directusService.client.request(readItems('store_applications', {
                filter: {
                    user_id: { _eq: user.id }
                }
            }));
            this.logger.log(`Found ${applications.length} applications for user with ID: ${extAuthId}`);
            return applications;
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to fetch applications for user with ID: ${extAuthId}`, error.stack);
            }
            throw new InternalServerErrorException('Failed to fetch user applications');
        }
    }
}