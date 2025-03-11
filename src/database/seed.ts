import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { partnersSchema } from "./partners.database-schema"
import { reset, seed } from "drizzle-seed"
import { ConfigService } from "@nestjs/config"
import 'dotenv/config';
import { eq, sql } from "drizzle-orm"

const extAuthId1 = 'user_2rAQMUtwOkHdOqRuqI7w3qcOXEG'
const storeUserId1 = '0c989fad-f50a-4344-ab3b-aea1a2b07fc6'
const storeId1 = '2d7757d6-90e0-45c3-a703-59970ce5499f'
const storeTypeId1 = 1
const cityId1 = 1
const cityId2 = 2
const storeSiteId1 = '6de5ea6f-72c4-4d45-8cb6-0967bfe724f2'
const storeSiteId2 = 'b7a87857-50c6-4f06-9bf2-13defdf19f51'

const headerImages = [
    '3e594633-3b35-40d5-be61-321016d685f0',
    '893ed8d6-e960-4ebe-b61d-d8386f89ebcb'
]

const storeSitesData = [
    {
        id: storeSiteId1,
        name: "Cafe Canada",
        lat: 33.59443438648149,
        lng: -7.499216914616757,
        // Use ST_MakePoint SQL function with explicit SRID
        cityId: cityId1
    },
    {
        id: storeSiteId2,
        name: "Décathlon",
        lat: 33.59263697989851,
        lng: -7.531085015154607,
        cityId: cityId2
    }
];

const menuId1 = storeSiteId1

const categoryIds = [
    'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
    'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a'
]

const productIds = [
    '3451e93c-f804-4fb8-91cf-36e60330145d',
    '7682aa6d-14d9-4b26-a858-fad9a1ac1943',
    '86e045be-a578-470d-955a-1e5f5573c113',
]


const modifierIds = [
    '6d3285e9-5ea4-452b-8ac9-635c709826df',
    '6adc2263-7341-403f-b70e-05912e9ca884'
]

const modifierOptionIds = [
    '3451e93c-f804-4fb8-91cf-36e60330145d',
    '7682aa6d-14d9-4b26-a858-fad9a1ac1943',
    '86e045be-a578-470d-955a-1e5f5573c113',
    'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a'
]

// Add modifier data
const modifiersData = [
    {
        id: modifierIds[0],
        name: "Sauce",
        storeSiteId: storeSiteId1,
        menuId: menuId1,
        required: false,
        multipleAllowed: true,
        minQuantity: 0,
        maxQuantity: 3,
        maxFreeQuantity: 1
    },
    {
        id: modifierIds[1],
        name: "Spice Level",
        storeSiteId: storeSiteId1,
        menuId: menuId1,
        required: true,
        multipleAllowed: false,
        minQuantity: 1,
        maxQuantity: 1,
        maxFreeQuantity: 0
    }
];

const modifierOptionsData = [
    // Sauce options
    {
        id: modifierOptionIds[0],
        modifierId: modifierIds[0],
        name: "Ketchup",
        price: 0.00,
        sort: 1
    },
    {
        id: modifierOptionIds[1],
        modifierId: modifierIds[0],
        name: "Mayonnaise",
        price: 5.00,
        sort: 2
    },
    // Spice level options
    {
        id: modifierOptionIds[2],
        modifierId: modifierIds[1],
        name: "Mild",
        price: 0.00,
        sort: 1
    },
    {
        id: modifierOptionIds[3],
        modifierId: modifierIds[1],
        name: "Hot",
        price: 10.00,
        sort: 2
    }
];


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
            menus: partnersSchema.menus,
            menuCategories: partnersSchema.menuCategories,
            products: partnersSchema.products,
            modifiers: partnersSchema.modifiers,
            modifierOptions: partnersSchema.modifierOptions,

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
                extAuthId: f.valuesFromArray({ values: [extAuthId1] }),
                storeId: f.valuesFromArray({ values: [storeId1] })
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
            count: storeSitesData.length,
            columns: {
                id: f.valuesFromArray({ values: storeSitesData.map(s => s.id) }),
                latitude: f.valuesFromArray({ values: storeSitesData.map(s => s.lat) }),
                longitude: f.valuesFromArray({ values: storeSitesData.map(s => s.lng) }),
                cityId: f.valuesFromArray({ values: storeSitesData.map(s => s.cityId) }),
                name: f.valuesFromArray({ values: storeSitesData.map(s => s.name) }),
                address: f.streetAddress(),
                approved: f.valuesFromArray({ values: [true] }),
                phone: f.phoneNumber(),
                siteName: f.companyName(),
                storeId: f.valuesFromArray({ values: [storeId1] }),
                postalCode: f.postcode(),
                headerImage: f.valuesFromArray({ values: headerImages }),
            }
        },
        menus: {
            count: 1,
            columns: {
                id: f.valuesFromArray({ values: [menuId1] }),
                storeId: f.valuesFromArray({ values: [storeId1] }),
                storeSiteId: f.valuesFromArray({ values: [storeSiteId1] }),
                name: f.valuesFromArray({ values: ["Main Menu"] }),
                description: f.loremIpsum(),
                enabled: f.valuesFromArray({ values: [true] }),
                sort: f.valuesFromArray({ values: [1] }),
                status: f.valuesFromArray({ values: ["approved"] }),
            }
        },
        menuCategories: {
            count: 2,
            columns: {
                id: f.valuesFromArray({ values: categoryIds, isUnique: true },), // Ensure unique IDs
                menuId: f.valuesFromArray({ values: [menuId1, menuId1] }),
                name: f.valuesFromArray({ values: ["Appetizers", "Main Courses"] }),
                description: f.loremIpsum(),
                status: f.valuesFromArray({ values: ["approved", "approved"] }),
                enabled: f.valuesFromArray({ values: [true, true] }),
                sort: f.valuesFromArray({ values: [1, 2] }),
            }
        },
        products: {
            count: 3,
            columns: {
                id: f.valuesFromArray({ values: productIds, isUnique: true }), // Ensure unique IDs
                storeId: f.valuesFromArray({ values: [storeId1, storeId1, storeId1] }),
                menuId: f.valuesFromArray({ values: [menuId1, menuId1, menuId1] }),
                menuCategoryId: f.valuesFromArray({
                    values: [categoryIds[0], categoryIds[1], categoryIds[1]]
                }),
                name: f.valuesFromArray({
                    values: [
                        "Garlic Bread",
                        "Grilled Salmon",
                        "Beef Tenderloin"
                    ]
                }),
                description: f.loremIpsum(),
                price: f.valuesFromArray({ values: [25.99, 149.99, 189.99] }),
                taxRate: f.valuesFromArray({ values: [0.1, 0.1, 0.1] }),
                enabled: f.valuesFromArray({ values: [true, true, true] }),
                sort: f.valuesFromArray({ values: [1, 1, 2] }),
            }
        },

        modifiers: {
            count: modifiersData.length,
            columns: {
                id: f.valuesFromArray({ values: modifiersData.map(m => m.id), isUnique: true }),
                name: f.valuesFromArray({ values: modifiersData.map(m => m.name) }),
                storeSiteId: f.valuesFromArray({ values: modifiersData.map(m => m.storeSiteId) }),
                menuId: f.valuesFromArray({ values: modifiersData.map(m => m.menuId) }),
                required: f.valuesFromArray({ values: modifiersData.map(m => m.required) }),
                multipleAllowed: f.valuesFromArray({ values: modifiersData.map(m => m.multipleAllowed) }),
                minQuantity: f.valuesFromArray({ values: modifiersData.map(m => m.minQuantity) }),
                maxQuantity: f.valuesFromArray({ values: modifiersData.map(m => m.maxQuantity) }),
                maxFreeQuantity: f.valuesFromArray({ values: modifiersData.map(m => m.maxFreeQuantity) }),
            }
        },
    }))

    for (const siteData in storeSitesData) {
        await db.update(partnersSchema.storeSites)
            .set({
                location: sql`ST_SetSRID(ST_MakePoint(${storeSitesData[siteData].lng}, ${storeSitesData[siteData].lat}), 4326)`,
            })
            .where(eq(partnersSchema.storeSites.id, storeSitesData[siteData].id))
    }


    const modifiersToProductsPairs: { modifierId: string; productId: string }[] = [];
    const pairSet = new Set<string>();

    for (const modifierId of modifierIds) {
        for (const productId of productIds) {
            const pairKey = `${modifierId}|${productId}`;
            if (!pairSet.has(pairKey)) {
                pairSet.add(pairKey);
                modifiersToProductsPairs.push({ modifierId, productId });
            }
        }
    }

    for (const pair of modifiersToProductsPairs) {
        await db.insert(partnersSchema.modifiersToProducts)
            .values({
                modifierId: pair.modifierId,
                prdocutId: pair.productId
            })
            .execute()
    }


}

main()
