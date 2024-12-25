import { Injectable } from '@nestjs/common';
import { StoreUsersService } from 'src/store-users/store-users.service';
import { SignupStoreDto } from './store.dto';
import { DrizzleService } from 'src/database/drizzle.service';
import { databaseSchema } from 'src/database/database-schema';

type NewStore = typeof databaseSchema.stores.$inferSelect;

@Injectable()
export class StoreService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly usersService: StoreUsersService,
    ) { }

    async create(dto: SignupStoreDto) {

    }
}