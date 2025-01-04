import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { databaseSchema } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { CreateApplicationDto } from './applications.dto';
import { StoreService } from 'src/store/store.service';
import { eq, and } from 'drizzle-orm';
import { DirectusService } from 'src/directus/directus.service';

@Injectable()
export class StoreApplicationsService {
    private readonly logger = new Logger(StoreApplicationsService.name);

    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly directusService: DirectusService,
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

    }

    async approveApplication(applicationId: string) {
    }
}
