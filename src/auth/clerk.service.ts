import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClerkClient, ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkService implements OnModuleInit {
    private clerkClient!: ClerkClient;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

        if (!secretKey) {
            throw new Error('CLERK_SECRET_KEY is not defined in the environment variables');
        }

        this.clerkClient = createClerkClient({
            secretKey: secretKey,
        });
    }

    getClient(): ClerkClient {
        if (!this.clerkClient) {
            throw new Error('Clerk client is not initialized');
        }
        return this.clerkClient;
    }
}
