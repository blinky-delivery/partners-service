import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [ClerkService],
    exports: [ClerkService],
})
export class ClerkModule { }
