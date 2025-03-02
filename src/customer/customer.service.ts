import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';

interface CreateCustomerParams {
    extAuthId: string
    username: string
    email: string
    phone: string | null
    avatar: string | null
    fcmToken: string | null
}

@Injectable()
export class CustomerService {
    private readonly logger = new Logger(CustomerService.name)

    constructor(
        private readonly drizzleService: DrizzleService,
    ) { }



}
