import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { SigupUserDto } from './users.dto';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from './users.types';

@Controller('users')
export class UsersController {

    constructor(private readonly storeUsersService: UsersService) { }

    private readonly logger = new Logger(UsersController.name);

    @UseGuards(ClerkAuthGuard)
    @Get()
    async getUserById(@CurrentUser() user: RequestUser) {
        this.logger.debug(`GET /users/`);
        return await this.storeUsersService.getByExtAuthId(user.clerkId);
    }

    @Post('signup')
    async createUser(@Body() createUserDto: SigupUserDto) {
        this.logger.debug(`POST /users - Creating user with email: ${createUserDto.email}`);
        return await this.storeUsersService.signup(createUserDto);
    }
}
