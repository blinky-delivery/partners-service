import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusService } from './prometheus.service';
import { ExcludeResponseInterceptor } from 'src/response/response.interceptor';

@Controller('metrics')
@ExcludeResponseInterceptor()
export class PrometheusController {
    constructor(private readonly prometheusService: PrometheusService) { }

    @Get()
    async getMetrics(@Res() res: Response) {
        const metrics = await this.prometheusService.getMetrics();
        res.setHeader('Content-Type', 'text/plain')
        res.send(metrics)
    }
}