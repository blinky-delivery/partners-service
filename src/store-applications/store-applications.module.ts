import { Module } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';
import { StoreApplicationsController } from './store-applications.controller';
import { StoreModule } from 'src/store/store.module';
import { DirectusModule } from 'src/directus/directus.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [StoreApplicationsService],
  controllers: [StoreApplicationsController],
  imports: [StoreModule, DirectusModule, UsersModule]
})
export class StoreApplicationsModule { }
