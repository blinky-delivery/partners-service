
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoreUsersModule } from './store-users/store-users.module';
import { StoreModule } from './store/store.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        CLERK_SECRET_KEY: Joi.string().required(),
      }),
    }),
    StoreUsersModule,
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }