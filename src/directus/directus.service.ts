import { createDirectus, rest, RestClient, staticToken } from '@directus/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DirectusSchema } from './directus.schema';

@Injectable()
export class DirectusService {
    private readonly logger = new Logger(DirectusService.name)

    public client: RestClient<DirectusSchema>;

    constructor(private readonly configService: ConfigService) {
        const directusUrl = this.configService.get<string>('DIRECTUS_URL');
        const directusToken = this.configService.get<string>('DIRECTUS_TOKEN');
        console.log(directusUrl, directusToken);
        this.client = createDirectus(directusUrl!).with(staticToken(directusToken!)).with(rest())
    }

}
