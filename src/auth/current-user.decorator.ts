import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the authenticated Clerk user ID from the request.
 * Example usage: @CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
    (data: keyof any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new Error('User not found in request. Is ClerkAuthGuard applied?');
        }

        return data ? user[data] : user;
    },
);
