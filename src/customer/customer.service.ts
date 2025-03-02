import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { partnersSchema } from 'src/database/partners.database-schema';

interface CreateCustomerParams {
    extAuthId: string
    username: string
    email: string
    phoneNumber: string | null
    avatar: string | null
    fcmToken: string | null
}

@Injectable()
export class CustomerService {
    private readonly logger = new Logger(CustomerService.name)

    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }

    async getOrCreateCustomer(params: CreateCustomerParams) {
        const customer = this.drizzleService.partnersDb.query.customers.findFirst(
            {
                where: ((fields, { eq }) => eq(fields.extAuthId, params.extAuthId))
            }
        )

        if (!customer) return this.createCustomer(params)
    }

    async createCustomer(params: CreateCustomerParams) {
        try {
            const result = await this.drizzleService.partnersDb
                .insert(partnersSchema.customers)
                .values({
                    extAuthId: params.extAuthId,
                    username: params.username,
                    email: params.email,
                    phoneNumber: params.phoneNumber,
                    avatar: params.avatar,
                    fcmToken: params.fcmToken,
                }).returning()

            const customer = result.pop()

            if (customer) {
                return customer
            } else {
                throw new InternalServerErrorException()
            }

        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

}
