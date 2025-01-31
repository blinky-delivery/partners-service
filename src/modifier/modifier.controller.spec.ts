import { Test, TestingModule } from '@nestjs/testing';
import { ModifierController } from './modifier.controller';

describe('ModifierController', () => {
  let controller: ModifierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModifierController],
    }).compile();

    controller = module.get<ModifierController>(ModifierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
