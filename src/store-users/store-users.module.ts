import { Module } from '@nestjs/common';
import { StoreUsersService } from './store-users.service';

@Module({
  providers: [StoreUsersService]
})
export class StoreUsersModule {}
