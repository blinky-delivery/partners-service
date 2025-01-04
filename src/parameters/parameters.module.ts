import { Module } from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { ParametersController } from './parameters.controller';

@Module({
  providers: [ParametersService],
  controllers: [ParametersController]
})
export class ParametersModule {}
