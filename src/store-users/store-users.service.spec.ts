import { Test, TestingModule } from '@nestjs/testing';
import { StoreUsersService } from './store-users.service';

describe('StoreUsersService', () => {
  let service: StoreUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreUsersService],
    }).compile();

    service = module.get<StoreUsersService>(StoreUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
