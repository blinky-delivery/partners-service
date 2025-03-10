import { Module } from '@nestjs/common';
import { DeliveryCalculatorService } from './delivery-calculator/delivery-calculator.service';

@Module({
  providers: [DeliveryCalculatorService]
})
export class OrderModule {}
