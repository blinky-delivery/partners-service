import { Body, Controller, Post } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './customer.dto';

@Controller('customer')
export class CustomerController {
    constructor(
        private readonly customerService: CustomerService
    ) { }


    @Post()
    async getOrCreateCustomer(
        @Body() customerDto: CreateCustomerDto
    ) {
        return this.customerService.getOrCreateCustomer(customerDto)
    }
}
