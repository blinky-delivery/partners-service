import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { AvailabilityService } from './availability.service';

@Controller('availability')
@UseGuards(ClerkAuthGuard)
export class AvailabilityController {
    private readonly logger = new Logger(AvailabilityController.name)

    constructor(
        private readonly availabilityService: AvailabilityService
    ) {

    }

    @Get('site')
    async getSiteAvailability(@Query('site_id') siteId: string) {
        return this.availabilityService.getStoreSiteAvailability(siteId)
    }
}
