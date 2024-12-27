import { Module } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';
import { StoreApplicationsController } from './store-applications.controller';

@Module({
  providers: [StoreApplicationsService],
  controllers: [StoreApplicationsController],
})
export class StoreApplicationsModule { }
