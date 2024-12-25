import { Module } from '@nestjs/common';
import { StoreUsersService } from './store-users.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [StoreUsersService],
  exports: [StoreUsersService],
  imports: [AuthModule]
})
export class StoreUsersModule { }
