import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase/firebase.service';

@Module({
    imports: [ConfigModule],
    providers: [ClerkService, FirebaseService],
    exports: [ClerkService],
})
export class AuthModule { }
