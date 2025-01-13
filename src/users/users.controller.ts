import { Body, Controller, Get, Logger, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { SigupUserDto } from './users.dto';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from './users.types';

@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }


    @UseGuards(ClerkAuthGuard)
    @Get()
    async getUserById(@CurrentUser() user: RequestUser) {
        this.logger.debug(`GET /users/`);
        return await this.usersService.getUserByExtAuthId(user.clerkId);
    }

    @Post('signup')
    async createUser(@Body() createUserDto: SigupUserDto) {
        this.logger.debug(`POST /users - Creating user with email: ${createUserDto.email}`);
        return await this.usersService.signup(createUserDto);
    }
}
