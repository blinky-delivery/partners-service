import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { partnersSchema } from "./partners.database-schema"
import { reset, seed } from "drizzle-seed"
import { ConfigService } from "@nestjs/config"
import 'dotenv/config';

const extAuthId1 = 'user_2rAQMUtwOkHdOqRuqI7w3qcOXEG'
const storeUserId1 = '0c989fad-f50a-4344-ab3b-aea1a2b07fc6'
const storeId1 = '2d7757d6-90e0-45c3-a703-59970ce5499f'
const storeTypeId1 = 1
const cityId1 = 1
const cityId2 = 2
const storeSiteId1 = '6de5ea6f-72c4-4d45-8cb6-0967bfe724f2'
const storeSiteId2 = 'b7a87857-50c6-4f06-9bf2-13defdf19f51'

async function main() {
    const configService = new ConfigService();

    const db = drizzle(
        new Pool(
            {
                host: configService.get<string>('PARTNERS_DB_HOST')!,
                port: configService.get<number>('PARTNERS_DB_PORT')!,
                user: configService.get<string>('PARTNERS_DB_USER')!,
                password: configService.get<string>('PARTNERS_DB_PASSWORD')!,
                database: configService.get<string>('PARTNERS_DB_NAME')!,
            }
        ),
        { schema: partnersSchema }
    )
    await reset(db, partnersSchema);

    await seed(db,
        {
            storeTypes: partnersSchema.storeTypes,
            users: partnersSchema.storeUsers,
            stores: partnersSchema.stores,
            cities: partnersSchema.cities,
            storeSites: partnersSchema.storeSites,
        }
    ).refine((f) => ({
        storeTypes: {
            count: 1,
            columns: {
                id: f.valuesFromArray({ values: [storeTypeId1] }),
                enabled: f.valuesFromArray({ values: [true] }),
                name: f.valuesFromArray({ values: ["Restaurant"] }),
                sort: f.valuesFromArray({ values: [1] }),
            }
        },
        cities: {
            count: 2,
            columns: {
                id: f.valuesFromArray({ values: [cityId1, cityId2] }),
                enabled: f.valuesFromArray({ values: [true, true] }),
                name: f.valuesFromArray({ values: ["Fnideq", "Tetouan"] }),
                sort: f.valuesFromArray({ values: [1, 2] }),
            }
        },
        users: {
            count: 1,
            columns: {
                id: f.valuesFromArray({ values: [storeUserId1] }),
                extAuthId: f.valuesFromArray({ values: [extAuthId1] })
            }
        },
        stores: {
            count: 1,
            columns: {
                id: f.valuesFromArray({ values: [storeId1] }),
                ownerId: f.valuesFromArray({ values: [storeUserId1] }),
                name: f.companyName(),
                address: f.streetAddress(),
                contactPhone: f.phoneNumber(),
                description: f.loremIpsum(),
                storeTypeId: f.valuesFromArray({ values: [1] }),
                numberOfSites: f.valuesFromArray({ values: [1] }),
            }
        },
        storeSites: {
            count: 2,
            columns: {
                id: f.valuesFromArray({ values: [storeSiteId1, storeSiteId2] }),
                address: f.streetAddress(),
                approved: f.valuesFromArray({ values: [true] }),
                cityId: f.valuesFromArray({ values: [cityId1, cityId2] }),
                phone: f.phoneNumber(),
                siteName: f.companyName(),
                storeId: f.valuesFromArray({ values: [storeId1] }),
                postalCode: f.postcode(),
            }
        }
    }))
}

main()