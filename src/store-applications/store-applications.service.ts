import { Injectable, Logger } from '@nestjs/common';
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

    async applyForStore(dto: CreateApplicationDto, userId: string) {
        this.logger.log('Checking for existing applications');

        const existing = await this.drizzleService.db.select().from(storeApplications)
            .where(and(eq(storeApplications.userId, userId), eq(storeApplications.isUnderReview, true)))
            .limit(1);
        if (existing.length > 0) {
            throw new Error('You already have an application under review or approved.');
        }

        this.logger.log('Submitting store application');

        const result = await this.drizzleService.db.insert(databaseSchema.storeApplications).values({
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

        }).returning();
        this.logger.log(`Store application submitted with ID: ${result[0]?.id}`);
        return result[0];
    }

    async approveApplication(applicationId: string) {
        this.logger.log('Approving store application');

        const applications = await this.drizzleService.db.select().from(databaseSchema.storeApplications).where(eq(storeApplications.id, applicationId)).limit(1);
        if (applications.length == 0) {
            throw new Error('Application not found');
        }
        const application = applications[0]

        const store = this.storeService.create({
            applicationId: application.id,
            address: application.address,
            city: application.city,
            contactPhone: application.contactPhone,
            name: application.name,
            numberOfSites: application.numberOfSites,
            storeType: application.storeType,
            userId: application.userId
        })
        //TODO: Update application data
    }
}
