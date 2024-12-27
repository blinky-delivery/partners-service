import { Test, TestingModule } from '@nestjs/testing';
import { StoreApplicationsController } from './store-applications.controller';

describe('StoreApplicationsController', () => {
  let controller: StoreApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreApplicationsController],
    }).compile();

    controller = module.get<StoreApplicationsController>(StoreApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
