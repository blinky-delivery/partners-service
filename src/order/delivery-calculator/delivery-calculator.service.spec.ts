import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryCalculatorService } from './delivery-calculator.service';

describe('DeliveryCalculatorService', () => {
  let service: DeliveryCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryCalculatorService],
    }).compile();

    service = module.get<DeliveryCalculatorService>(DeliveryCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
