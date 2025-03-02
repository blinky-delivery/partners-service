import { Body, Controller, Post, Put } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@Controller('customers')
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

    @Put()
    async updateCustomer(
        @Body() dto: UpdateCustomerDto
    ) {
        return this.customerService.updateCustomer({ ...dto, extAuthId: '' })
    }
}
