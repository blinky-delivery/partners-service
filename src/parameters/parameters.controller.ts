import { Controller, Get } from '@nestjs/common';
import { ParametersService } from './parameters.service';

@Controller('parameters')
export class ParametersController {
    constructor(private readonly parametersService: ParametersService) { }

    @Get('store-types')
    async getStoreTypes() {
        return this.parametersService.getStoreTypes();
    }

    @Get('cities')
    async getCities() {
        return this.parametersService.getCities();
    }
}
