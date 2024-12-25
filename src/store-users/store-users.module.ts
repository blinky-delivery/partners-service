import { Module } from '@nestjs/common';
import { StoreUsersService } from './store-users.service';
import { AuthModule } from 'src/auth/auth.module';
import { StoreUsersController } from './store-users.controller';

@Module({
  providers: [StoreUsersService],
  controllers: [StoreUsersController],
  exports: [StoreUsersService],
  imports: [AuthModule]
})
export class StoreUsersModule { }
