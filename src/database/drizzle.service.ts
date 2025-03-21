import { Inject, Injectable } from '@nestjs/common';
import { CONNECTION_POOLS, ConnectionPools } from './database.module-definition';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { partnersSchema } from './partners.database-schema';

let partnersDb: NodePgDatabase<typeof partnersSchema>
export type Transaction = Parameters<Parameters<typeof partnersDb["transaction"]>[0]>[0];

@Injectable()
export class DrizzleService {
    public partnersDb: NodePgDatabase<typeof partnersSchema>;
    constructor(@Inject(CONNECTION_POOLS) private readonly connectionPools: ConnectionPools) {
        this.partnersDb = drizzle(this.connectionPools.partnersDbPool, { schema: partnersSchema });

    }
}