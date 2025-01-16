
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DatabaseOptions } from './database-options';
import { Pool } from 'pg';

export const CONNECTION_POOLS = 'CONNECTION_POOLS';

export interface ConnectionPools {
    partnersDbPool: Pool,
    customersDbPool: Pool
}

export const {
    ConfigurableModuleClass: ConfigurableDatabaseModule,
    MODULE_OPTIONS_TOKEN: DATABASE_OPTIONS,
} = new ConfigurableModuleBuilder<DatabaseOptions>()
    .setClassMethodName('forRoot')
    .build();