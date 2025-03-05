import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase.guard';
import { CurrentCustomer } from 'src/auth/current-customer.decorator';
import { RequestCustomer } from 'src/users/users.types';
import { ExcludeResponseInterceptor } from 'src/response/response.interceptor';

@Controller('customers')
@ExcludeResponseInterceptor()
export class CustomerController {
    constructor(
        private readonly customerService: CustomerService
    ) { }


    @Post()
    async getOrCreateCustomer(
        @Body() dto: CreateCustomerDto
    ) {
        return this.customerService.getOrCreateCustomer(dto)
    }

    @UseGuards(FirebaseAuthGuard)
    @Put()
    async updateCustomer(
        @Body() dto: UpdateCustomerDto,
        @CurrentCustomer() customer: RequestCustomer,
    ) {
        return this.customerService.updateCustomer({ ...dto, extAuthId: customer.uid })
    }
}
