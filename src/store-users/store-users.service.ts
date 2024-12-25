import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { databaseSchema } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { CreateStoreUserDto } from './store-users.dto';
import { ClerkService } from 'src/auth/clerk.service';
import { User } from '@clerk/backend';

@Injectable()
export class StoreUsersService {
    private readonly logger = new Logger(StoreUsersService.name);

    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly clerkService: ClerkService,
    ) { }

    /**
     * Fetch user by ID from the database
     * @param id - User ID
     * @returns User record
     */
    async getById(id: string) {
        this.logger.debug(`Fetching user by ID: ${id}`);

        try {
            const users = await this.drizzleService.db
                .select()
                .from(databaseSchema.storeUsers)
                .where(eq(databaseSchema.storeUsers.id, id));

            const user = users.pop();

            if (!user) {
                this.logger.warn(`User with ID ${id} not found.`);
                throw new NotFoundException(`User with ID ${id} not found.`);
            }

            this.logger.debug(`User with ID ${id} retrieved successfully.`);
            return user;
        } catch (error) {
            this.logger.error(`Failed to fetch user with ID: ${id}`);
            throw new InternalServerErrorException('Failed to fetch user. Please try again later.');
        }
    }

    /**
     * Create a new user in Clerk and database
     * @param dto - User data transfer object
     * @returns Created user
     */
    async createUser(dto: CreateStoreUserDto) {
        this.logger.debug(`Creating new user with email: ${dto.email}`);

        let clerkUser: User;

        // Create user in Clerk
        try {
            clerkUser = await this.clerkService.getClient().users.createUser({
                emailAddress: [dto.email],
                password: dto.password,
                firstName: dto.fullName,
                skipPasswordChecks: true,
            });

            this.logger.log(`User created in Clerk with ID: ${clerkUser.id}`);
        } catch (error) {
            this.logger.error(
                `Failed to create user in Clerk for email: ${dto.email}`,
            );
            throw new BadRequestException('Failed to create user in Clerk. Please check the provided details.');
        }

        // Insert user into database
        try {
            const [createdUser] = await this.drizzleService.db
                .insert(databaseSchema.storeUsers)
                .values({
                    extAuthId: clerkUser.id,
                    email: dto.email,
                    role: 'OWNER',
                    fullName: dto.fullName,
                    phoneNumber: dto.phoneNumber,
                })
                .returning();

            this.logger.log(`User with email ${dto.email} successfully added to the database.`);
            return createdUser;
        } catch (error) {
            this.logger.error(
                `Failed to insert user into database for Clerk ID: ${clerkUser.id}`,
            );
            // Cleanup: Delete the user from Clerk if DB insertion fails
            try {
                await this.clerkService.getClient().users.deleteUser(clerkUser.id);
                this.logger.warn(`Rolled back Clerk user creation with ID: ${clerkUser.id}`);
            } catch (rollbackError) {
                this.logger.error(
                    `Failed to rollback Clerk user creation for ID: ${clerkUser.id}`,
                );
            }

            throw new InternalServerErrorException('Failed to create user in the database. Please try again later.');
        }
    }
}
