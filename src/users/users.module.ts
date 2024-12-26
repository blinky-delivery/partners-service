import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [AuthModule]
})
export class UsersModule { }
