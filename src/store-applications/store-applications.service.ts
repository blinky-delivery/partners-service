import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { databaseSchema } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { CreateApplicationDto } from './applications.dto';
import { StoreService } from 'src/store/store.service';
import { eq, and } from 'drizzle-orm';
import { DirectusService } from 'src/directus/directus.service';
import { createItem, readItem, readItems } from '@directus/sdk';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StoreApplicationsService {
    private readonly logger = new Logger(StoreApplicationsService.name);

    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly directusService: DirectusService,
        private readonly userService: UsersService,
        private readonly storeService: StoreService
    ) { }




    async applyForStore(dto: CreateApplicationDto, extAuthId: string) {
        const user = await this.userService.getUserByExtAuthId(extAuthId);

        this.logger.log('Checking for existing applications');

        try {
            const existing = await this.directusService.client.request(readItems('store_applications', {
                filter: {
                    user_id: {
                        _eq: user.id
                    }
                }
            }))

            if (existing.length > 0) {
                throw new BadRequestException('You already have an application');
            }

            this.logger.log(`Submitting store application for user ${user.id}`);

            const application = await this.directusService.client.request(createItem('store_applications', {
                user_id: user.id,
                store_type_id: dto.storeType,
                city_id: dto.city,
                name: dto.name,
                address: dto.address,
                contact_phone: dto.contactPhone,
                number_of_sites: dto.numberOfSites,
                id_card_front: dto.idCardFront,
                id_card_back: dto.idCardBack,
                store_image: dto.storeImage,

            }))

            this.logger.log(`Store application submitted with ID: ${application.id}`);

            return application;

        } catch (error) {
            this.logger.error('Failed to submit store application');
            console.error(error);
            throw new InternalServerErrorException('Failed to submit store application');
        }
    }

    async approveApplication(applicationId: string) {
    }
}
