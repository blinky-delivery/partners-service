import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private readonly logger = new Logger(ClerkAuthGuard.name);
    private readonly jwtKey: string;


    constructor(
        private readonly configService: ConfigService,
    ) {
        this.jwtKey = this.configService.get<string>('CLERK_JWT_KEY')!;
        if (!this.jwtKey) {
            throw new Error('CLERK_JWT_KEY is not set in environment variables');
        }
    }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            // Verify and decode the token
            const token = request.cookies['__session'];
            if (!token) {
                throw new UnauthorizedException('Authorization token is missing');
            }
            const verifiedToken = await verifyToken(token, {
                jwtKey: this.jwtKey
            })


            // Attach user ID to the request
            request.user = {
                clerkId: verifiedToken.sub, // The 'sub' usually contains the user ID in JWT
            };

            this.logger.log(`Authenticated user with ID: ${verifiedToken.sub}`);
            return true;
        } catch (err) {
            console.log(err)
            this.logger.error('Token verification failed', err);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
