import { Test, TestingModule } from '@nestjs/testing';
import { StoreApplicationsService } from './store-applications.service';

describe('StoreApplicationsService', () => {
  let service: StoreApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreApplicationsService],
    }).compile();

    service = module.get<StoreApplicationsService>(StoreApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
