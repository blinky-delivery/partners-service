import { createDirectus, DirectusClient, rest, staticToken } from '@directus/sdk';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DirectusService {

    public client: DirectusClient<any>;

    constructor(private readonly configService: ConfigService) {
        const directusUrl = this.configService.get<string>('DIRECTUS_URL');
        const directusToken = this.configService.get<string>('DIRECTUS_TOKEN');
        this.client = createDirectus(directusUrl).with(rest()).with(staticToken(directusToken))
    }

}
