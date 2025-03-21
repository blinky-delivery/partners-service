
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
import { ProductModule } from './product/product.module';
import { ImageModule } from './image/image.module';
import { ModifierModule } from './modifier/modifier.module';
import { AvailabilityModule } from './availability/availability.module';
import { QueryService } from './query/query.service';
import { QueryController } from './query/query.controller';
import { CustomerModule } from './customer/customer.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OrderModule } from './order/order.module';
import { PrometheusService } from './prometheus/prometheus.service';
import { PrometheusController } from './prometheus/prometheus.controller';

@Module({
  imports: [
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => (
        {
          partnersDatabase: {
            host: configService.get('PARTNERS_DB_HOST')!,
            port: configService.get('PARTNERS_DB_PORT')!,
            user: configService.get('PARTNERS_DB_USER')!,
            password: configService.get('PARTNERS_DB_PASSWORD')!,
            database: configService.get('PARTNERS_DB_NAME')!,
          },
          customersDatabase: {
            host: configService.get('CUSTOMERS_DB_HOST')!,
            port: configService.get('CUSTOMERS_DB_PORT')!,
            user: configService.get('CUSTOMERS_DB_USER')!,
            password: configService.get('CUSTOMERS_DB_PASSWORD')!,
            database: configService.get('CUSTOMERS_DB_NAME')!,
          },

        }
      ),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        SERVER_PORT: Joi.number().required(),
        PARTNERS_DB_HOST: Joi.string().required(),
        PARTNERS_DB_PORT: Joi.number().required(),
        PARTNERS_DB_USER: Joi.string().required(),
        PARTNERS_DB_PASSWORD: Joi.string().required(),
        PARTNERS_DB_NAME: Joi.string().required(),
        CUSTOMERS_DB_HOST: Joi.string().required(),
        CUSTOMERS_DB_PORT: Joi.number().required(),
        CUSTOMERS_DB_USER: Joi.string().required(),
        CUSTOMERS_DB_PASSWORD: Joi.string().required(),
        CUSTOMERS_DB_NAME: Joi.string().required(),
        CLERK_SECRET_KEY: Joi.string().required(),
        CLERK_JWT_KEY: Joi.string().required(),
        BLINKY_AWS_BUCKET_NAME: Joi.string().required(),
        BLINKY_AWS_REGION: Joi.string().required(),
        BLINKY_AWS_ACCESS_KEY_ID: Joi.string().required(),
        BLINKY_AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        DIRECTUS_URL: Joi.string().required(),
        DIRECTUS_TOKEN: Joi.string().required(),
        DIRECTUS_STORE_APPLICATIONS_FILES_FOLDER_ID: Joi.string().required(),
        OPENROUTE_SERVICE_API_KEY: Joi.string().required(),
        MAPBOX_API_KEY: Joi.string().required(),
      },
      ),
    }),
    CacheModule.register({ isGlobal: true }),
    AuthModule,
    UsersModule,
    StoreModule,
    StorageModule,
    StoreApplicationsModule,
    ParametersModule,
    DirectusModule,
    MenuModule,
    ProductModule,
    ImageModule,
    ModifierModule,
    AvailabilityModule,
    CustomerModule,
    OrderModule,
  ],
  controllers: [QueryController, PrometheusController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
    QueryService,
    PrometheusService,
  ],
})
export class AppModule { }