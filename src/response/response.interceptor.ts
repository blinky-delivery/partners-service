import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SetMetadata } from '@nestjs/common';

const EXCLUDE_RESPONSE_INTERCEPTOR_METADATA = 'excludeResponseInterceptor'

export const ExcludeResponseInterceptor = () =>
  SetMetadata(EXCLUDE_RESPONSE_INTERCEPTOR_METADATA, true);

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const controller = context.getClass();

    // Check if @ExcludeResponseInterceptor() is present on method OR controller
    const isExcluded =
      this.reflector.get<boolean>(EXCLUDE_RESPONSE_INTERCEPTOR_METADATA, handler) ||
      this.reflector.get<boolean>(EXCLUDE_RESPONSE_INTERCEPTOR_METADATA, controller);

    if (isExcluded) {
      return next.handle(); // Skip interception
    }



    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        return {
          data,
          message: 'Request successful',
          status: statusCode,
        };
      }),
    );
  }
}
