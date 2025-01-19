import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { UsersModule } from 'src/users/users.module';
import { DirectusModule } from 'src/directus/directus.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
  imports: [UsersModule, DirectusModule, StorageModule]
})
export class StoreModule { }
