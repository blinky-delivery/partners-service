
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { StoreApplicationsModule } from './store-applications/store-applications.module';
import { ParametersModule } from './parameters/parameters.module';
import { DirectusModule } from './directus/directus.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseFormatInterceptor } from './response/response.interceptor';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        user: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        SERVER_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        CLERK_SECRET_KEY: Joi.string().required(),
        CLERK_JWT_KEY: Joi.string().required(),
        BLINKY_AWS_BUCKET_NAME: Joi.string().required(),
        BLINKY_AWS_REGION: Joi.string().required(),
        BLINKY_AWS_ACCESS_KEY_ID: Joi.string().required(),
        BLINKY_AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        DIRECTUS_URL: Joi.string().required(),
        DIRECTUS_TOKEN: Joi.string().required(),
        DIRECTUS_STORE_APPLICATIONS_FILES_FOLDER_ID: Joi.string().required(),
      },
      ),
    }),
    AuthModule,
    UsersModule,
    StoreModule,
    StorageModule,
    StoreApplicationsModule,
    ParametersModule,
    DirectusModule,
    MenuModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    }
  ],
})
export class AppModule { }