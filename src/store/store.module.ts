import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreUsersModule } from 'src/store-users/store-users.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  imports: [StoreUsersModule]
})
export class StoreModule { }
