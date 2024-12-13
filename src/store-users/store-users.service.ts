import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { databaseSchema } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';

@Injectable()
export class StoreUsersService {
    constructor(private readonly drizzleService: DrizzleService) { }

    async getById(id: string) {
        const users = await this.drizzleService.db
            .select()
            .from(databaseSchema.storeUsers)
            .where(eq(databaseSchema.storeUsers.id, id))
        const user = users.pop()

        if (!user) {
            throw new NotFoundException()
        }
        return user
    }
}
