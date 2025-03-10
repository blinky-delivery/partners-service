import { Module } from '@nestjs/common';
import { DeliveryCalculatorService } from './delivery-calculator/delivery-calculator.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [DeliveryCalculatorService],
  imports: [HttpModule]
})
export class OrderModule { }
