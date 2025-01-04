import { Body, Controller, Logger, UseGuards, Post } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';
import { CreateApplicationDto } from './applications.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { RequestUser } from 'src/users/users.types';

@Controller('store-applications')
export class StoreApplicationsController {
    private readonly logger = new Logger(StoreApplicationsController.name);

    constructor(private readonly applicationsService: StoreApplicationsService) { }

    @UseGuards(ClerkAuthGuard)
    @Post('apply')
    async applyForStore(@CurrentUser() user: RequestUser, @Body() dto: CreateApplicationDto) {
        this.logger.log(`Received store application for user ${user.clerkId}`);
        return this.applicationsService.applyForStore(dto, user.clerkId)
    }
}
