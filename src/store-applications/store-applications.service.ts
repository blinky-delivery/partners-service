import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { databaseSchema, storeApplications } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { CreateApplicationDto } from './applications.dto';
import { StoreService } from 'src/store/store.service';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class StoreApplicationsService {
    private readonly logger = new Logger(StoreApplicationsService.name);

    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly storeService: StoreService
    ) { }


    private async getUserByExtAuthId(extAuthId: string) {
        const [user] = await this.drizzleService.db
            .select()
            .from(databaseSchema.storeUsers)
            .where(eq(databaseSchema.storeUsers.extAuthId, extAuthId))
            .limit(1);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async applyForStore(dto: CreateApplicationDto, extAuthId: string) {
        this.logger.log('Checking for existing applications');

        try {
            const user = await this.getUserByExtAuthId(extAuthId);
            const userId = user.id;
            const existing = await this.drizzleService.db
                .select()
                .from(storeApplications)
                .where(and(eq(storeApplications.userId, userId), eq(storeApplications.isUnderReview, true)))
                .limit(1);

            if (existing.length > 0) {
                throw new BadRequestException('You already have an application under review or approved.');
            }

            this.logger.log('Submitting store application');


            const [result] = await this.drizzleService.db
                .insert(databaseSchema.storeApplications)
                .values({
                    userId: userId,
                    name: dto.name,
                    contactPhone: dto.contactPhone,
                    numberOfSites: dto.numberOfSites,
                    storeType: dto.storeType,
                    city: dto.city,
                    address: dto.address,
                    idCardFront: dto.idCardFront,
                    idCardBack: dto.idCardBack,
                    storeImage: dto.storeImage,
                    isUnderReview: true,
                    isApproved: false,
                })
                .returning();

            if (!result) {
                throw new InternalServerErrorException('Failed to create store application.');
            }

            this.logger.log(`Store application submitted with ID: ${result.id}`);
            return result;
        } catch (error) {
            this.logger.error('Error while applying for store', error.stack);
            throw error instanceof BadRequestException ? error : new InternalServerErrorException('An unexpected error occurred while applying for a store.');
        }
    }

    async approveApplication(applicationId: string) {
        this.logger.log('Approving store application');

        try {
            const applications = await this.drizzleService.db
                .select()
                .from(databaseSchema.storeApplications)
                .where(eq(storeApplications.id, applicationId))
                .limit(1);

            if (applications.length === 0) {
                throw new NotFoundException('Application not found.');
            }

            const application = applications[0];

            const store = await this.storeService.create({
                applicationId: application.id,
                address: application.address,
                city: application.city,
                contactPhone: application.contactPhone,
                name: application.name,
                numberOfSites: application.numberOfSites,
                storeType: application.storeType,
                userId: application.userId,
            });

            if (!store) {
                throw new InternalServerErrorException('Failed to create store from application.');
            }

            await this.drizzleService.db
                .update(storeApplications)
                .set({ isUnderReview: false, isApproved: true })
                .where(eq(storeApplications.id, applicationId))
                .returning();

            this.logger.log(`Store application approved with ID: ${applicationId}`);
        } catch (error) {
            this.logger.error('Error while approving store application', error.stack);
            throw error instanceof NotFoundException || error instanceof InternalServerErrorException
                ? error
                : new InternalServerErrorException('An unexpected error occurred while approving the store application.');
        }
    }
}
