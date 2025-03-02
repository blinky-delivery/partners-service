import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [CustomerService],
  controllers: [CustomerController],
  imports: [AuthModule]
})
export class CustomerModule { }
