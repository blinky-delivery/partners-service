
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

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
      },
      ),
    }),
    AuthModule,
    UsersModule,
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }