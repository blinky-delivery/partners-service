import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { CreateStoreUserDto } from './store-users.dto';
import { StoreUsersService } from './store-users.service';

@Controller('store-users')
export class StoreUsersController {

    constructor(private readonly storeUsersService: StoreUsersService) { }

    private readonly logger = new Logger(StoreUsersController.name);

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        this.logger.debug(`GET /store-users/${id}`);
        return await this.storeUsersService.getById(id);
    }

    @Post()
    async createUser(@Body() createUserDto: CreateStoreUserDto) {
        this.logger.debug(`POST /store-users - Creating user with email: ${createUserDto.email}`);
        return await this.storeUsersService.createUser(createUserDto);
    }
}
