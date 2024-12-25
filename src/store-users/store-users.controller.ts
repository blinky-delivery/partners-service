import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateStoreUserDto } from './store-users.dto';
import { StoreUsersService } from './store-users.service';

@Controller('store-users')
export class StoreUsersController {

    constructor(private readonly storeUsersService: StoreUsersService) { }

    private readonly logger = new Logger(StoreUsersController.name);

    @Post()
    async createUser(@Body() createUserDto: CreateStoreUserDto) {
        this.logger.debug(`POST /store-users - Creating user with email: ${createUserDto.email}`);
        return await this.storeUsersService.createUser(createUserDto);
    }
}
