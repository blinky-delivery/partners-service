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
        await this.drizzleService.db.transaction(async (tx) => {
            const stores = await tx.insert(databaseSchema.stores).values(
                {
                    name: dto.name,
                    contactPhone: dto.contactPhone,
                    storeTypeId: dto.storeType,
                    numberOfSites: dto.numberOfSites,
                    address: dto.address,
                }
            ).returning()

            const store = stores.pop()

            const user = await tx.insert(databaseSchema.storeUsers).values(
                {
                    email: dto.user.email,
                    storeId: store.id,
                    role: 'OWNER',
                }
            )
        })
    }
}
