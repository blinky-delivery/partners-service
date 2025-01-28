import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { partnersSchema } from 'src/database/partners.database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { SigupUserDto } from './users.dto';
import { ClerkService } from 'src/auth/clerk.service';
import { User } from '@clerk/backend';
import { UserRole } from './users.types';

interface CreateUserProps {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: UserRole;
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly clerkService: ClerkService,
    ) { }

    /**
    * Check if a user with the given email already exists in the database
    */
    private async userExistsInDatabase(email: string): Promise<boolean> {
        const existingUser = await this.drizzleService.partnersDb
            .select()
            .from(partnersSchema.storeUsers)
            .where(eq(partnersSchema.storeUsers.email, email))
            .limit(1);

        return existingUser.length > 0;
    }

    /**
     * Fetch user by ExternalAuthID from the database
     * @param id - User ID
     * @returns User record
     */
    async getUserByExtAuthId(id: string) {
        this.logger.debug(`Fetching user by ExtAuthID: ${id}`);

        try {
            const users = await this.drizzleService.partnersDb
                .select()
                .from(partnersSchema.storeUsers)
                .where(eq(partnersSchema.storeUsers.extAuthId, id));

            const user = users.pop();

            if (!user) {
                this.logger.warn(`User with ExternalAuth ID ${id} not found.`);
                throw new NotFoundException(`User with ExternalAuth ID ${id} not found.`);
            }

            this.logger.debug(`User with ID ${id} retrieved successfully.`);
            return user;
        } catch (error) {
            this.logger.error(`Failed to fetch user with ExternalAuth ID: ${id}`);
            throw new InternalServerErrorException('Failed to fetch user.');
        }
    }

    /**
     * Create a new user in Clerk and database
     * @param props - User data transfer object
     * @returns Created user
     */
    async createUser(props: CreateUserProps) {
        this.logger.debug(`Creating new user with email: ${props.email}`);
        let clerkUser: User;

        // 🛡️ Check if user exists in the database
        if (await this.userExistsInDatabase(props.email)) {
            this.logger.warn(`User with email "${props.email}" already exists in the database.`);
            throw new ConflictException(`User with email "${props.email}" already exists.`);
        }

        // Create user in Clerk
        try {
            clerkUser = await this.clerkService.getClient().users.createUser({
                emailAddress: [props.email],
                password: props.password,
                firstName: props.fullName,
                skipPasswordChecks: true,
            });

            this.logger.log(`User created in Clerk with ID: ${clerkUser.id}`);
        } catch (error: any) {
            this.logger.error(
                `Failed to create user in Clerk for email: ${props.email}`,
            );
            if (error?.errors?.[0]?.code === 'form_identifier_exists') {
                this.logger.warn(`User with email "${props.email}" already exists.`);
                throw new ConflictException(`User with email "${props.email}" already exists.`);
            }
            throw new BadRequestException('Failed to create user in Clerk. Please check the provided details.');
        }

        // Insert user into database
        try {
            const [createdUser] = await this.drizzleService.partnersDb
                .insert(partnersSchema.storeUsers)
                .values({
                    extAuthId: clerkUser.id,
                    email: props.email,
                    role: UserRole.OWNER,
                    fullName: props.fullName,
                    phoneNumber: props.phoneNumber,
                })
                .returning();

            this.logger.log(`User with email ${props.email} successfully added to the database.`);
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

            throw new InternalServerErrorException('Failed to create user in the database.');
        }
    }


    /**
     * Signup: Create user with default OWNER role
     */
    async signup(dto: SigupUserDto) {
        return this.createUser({
            email: dto.email,
            password: dto.password,
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
            role: UserRole.OWNER,
        });
    }
}
