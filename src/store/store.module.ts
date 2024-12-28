import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
  imports: [UsersModule]
})
export class StoreModule { }
