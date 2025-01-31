import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { ModifierService } from './modifier.service';
import { CreateModiferDto } from './modifier.dto';

@Controller('modifier')
@UseGuards(ClerkAuthGuard)

export class ModifierController {
    private readonly logger = new Logger(ModifierController.name)

    constructor(
        private readonly modifierService: ModifierService
    ) {

    }

    @Post()
    async createModifer(
        @Body() dto: CreateModiferDto,
    ) {
        return this.modifierService.createModifer(dto)
    }



}
