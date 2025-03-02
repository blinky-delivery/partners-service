import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

interface CreateCustomerParams {
    extAuthId: string;
    username: string;
    email: string;
    phoneNumber: string | null;
    avatar: string | null;
    fcmToken: string | null;
}

interface UpdateCustomerParams {
    extAuthId: string;
    username: string;
    phoneNumber: string | null;
    avatar: string | null;
    fcmToken: string | null;
}

@Injectable()
export class CustomerService {
    private readonly logger = new Logger(CustomerService.name);

    constructor(private readonly drizzleService: DrizzleService) { }

    async getOrCreateCustomer(params: CreateCustomerParams) {
        try {
            const customer = await this.drizzleService.partnersDb.query.customers.findFirst({
                where: (fields, { eq }) => eq(fields.extAuthId, params.extAuthId),
            });

            return customer ?? (await this.createCustomer(params));
        } catch (error) {
            this.logger.error(`Failed to get or create customer: ${error}`);
            throw new InternalServerErrorException('Could not retrieve or create customer');
        }
    }

    async createCustomer(params: CreateCustomerParams) {
        try {
            const result = await this.drizzleService.partnersDb
                .insert(partnersSchema.customers)
                .values(params)
                .returning();

            const customer = result.pop()

            if (!customer) throw new Error('Customer creation returned empty result');

            this.logger.log(`Customer created successfully: ${params.extAuthId}`);
            return customer;
        } catch (error) {
            this.logger.error(`Failed to create customer: ${error}`);
            throw new InternalServerErrorException('Customer creation failed');
        }
    }

    async updateCustomer(params: UpdateCustomerParams) {
        try {
            const [updatedCustomer] = await this.drizzleService.partnersDb
                .update(partnersSchema.customers)
                .set(params)
                .where(eq(partnersSchema.customers.extAuthId, params.extAuthId))
                .returning();

            if (!updatedCustomer) throw new Error('No customer found for update');

            this.logger.log(`Customer updated successfully: ${params.extAuthId}`);
            return updatedCustomer;
        } catch (error) {
            this.logger.error(`Failed to update customer: ${error}`);
            throw new InternalServerErrorException('Customer update failed');
        }
    }
}
