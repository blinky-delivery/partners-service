import { Module } from '@nestjs/common';
import { ModifierService } from './modifier.service';
import { ModifierController } from './modifier.controller';

@Module({
  providers: [ModifierService],
  controllers: [ModifierController]
})
export class ModifierModule {}
