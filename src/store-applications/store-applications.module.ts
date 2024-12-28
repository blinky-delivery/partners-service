import { Module } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';
import { StoreApplicationsController } from './store-applications.controller';
import { StoreModule } from 'src/store/store.module';

@Module({
  providers: [StoreApplicationsService],
  controllers: [StoreApplicationsController],
  imports: [StoreModule]
})
export class StoreApplicationsModule { }
