
import { defineConfig } from 'drizzle-kit';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

const configService = new ConfigService();

export default defineConfig({
    schema: './src/database/partners.database-schema.ts',
    out: './drizzle/partners_db',
    dialect: 'postgresql',
    dbCredentials: {
        host: configService.get<string>('PARTNERS_DB_HOST')!,
        port: configService.get<number>('PARTNERS_DB_PORT')!,
        user: configService.get<string>('PARTNERS_DB_USER')!,
        password: configService.get<string>('PARTNERS_DB_PASSWORD')!,
        database: configService.get<string>('PARTNERS_DB_NAME')!,
        ssl: false,
    },
})