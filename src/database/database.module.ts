import { Global, Module } from '@nestjs/common';
import {
    ConfigurableDatabaseModule,
    CONNECTION_POOLS,
    ConnectionPools,
    DATABASE_OPTIONS,
} from './database.module-definition';
import { Pool } from 'pg';
import { DrizzleService } from './drizzle.service';
import { DatabaseOptions } from './database-options';

@Global()
@Module({
    exports: [DrizzleService],
    providers: [
        DrizzleService,
        {
            provide: CONNECTION_POOLS,
            inject: [DATABASE_OPTIONS],
            useFactory: (databaseOptions: DatabaseOptions) => {
                const connectionPools: ConnectionPools = {
                    partnersDbPool: new Pool({
                        host: databaseOptions.partnersDatabase.host,
                        port: databaseOptions.partnersDatabase.port,
                        user: databaseOptions.partnersDatabase.user,
                        password: databaseOptions.partnersDatabase.password,
                        database: databaseOptions.partnersDatabase.database,
                    }),
                    customersDbPool: new Pool({
                        host: databaseOptions.customersDatabase.host,
                        port: databaseOptions.customersDatabase.port,
                        user: databaseOptions.customersDatabase.user,
                        password: databaseOptions.customersDatabase.password,
                        database: databaseOptions.customersDatabase.database,
                    })
                }

                return connectionPools
            },
        },
    ],
})
export class DatabaseModule extends ConfigurableDatabaseModule { }