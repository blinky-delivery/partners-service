import { Module } from '@nestjs/common';
import { DeliveryCalculatorService } from './delivery-calculator/delivery-calculator.service';
import { HttpModule } from '@nestjs/axios';
import { OrderPricingService } from './order-pricing/order-pricing.service';
import { StoreModule } from 'src/store/store.module';
import { ProductModule } from 'src/product/product.module';
import { OrderService } from './order/order.service';

@Module({
  providers: [DeliveryCalculatorService, OrderPricingService, OrderService],
  exports: [DeliveryCalculatorService, OrderPricingService, OrderService],
  imports: [HttpModule, StoreModule, ProductModule]
})
export class OrderModule { }
