import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignupStoreDto } from './store.dto';
import { DrizzleService } from 'src/database/drizzle.service';
import { databaseSchema } from 'src/database/database-schema';

type NewStore = typeof databaseSchema.stores.$inferSelect;

@Injectable()
export class StoreService {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async create(dto: SignupStoreDto) {

    }
}