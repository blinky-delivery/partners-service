
import { pgTable, uuid, varchar, timestamp, serial, boolean, integer, text, doublePrecision } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/pg-core';

// Roles table
export const roles = pgTable('roles', {
    name: varchar('name', { length: 50 }).primaryKey().notNull().unique(), // Using name as the primary key
});

export const storeUsers = pgTable('store_users', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    extAuthId: varchar('ext_auth_id', { length: 255 }).notNull(),
    storeId: varchar('store_id', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    role: varchar('role', { length: 50 }).notNull(), // e.g., owner, manager, employee, driver
    fullName: varchar('first_name', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const store_customers = pgTable('store_customers', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    extAuthId: varchar('ext_auth_id', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});


export const cities = pgTable('cities', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    sort: integer('sort').default(0),
});

export const storeTypes = pgTable('store_types', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    enabled: boolean('enabled').notNull(),
    sort: integer('sort').default(0),
});


export const stores = pgTable('stores', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    applicationId: varchar('application_id').notNull(),
    storeTypeId: integer('store_type_id')
        .notNull()
        .references(() => storeTypes.id),
    ownerId: uuid('owner_id').references(() => storeUsers.id, {
        onDelete: 'set null',
    }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull().default(""),
    contactPhone: varchar('contact_phone', { length: 20 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    numberOfSites: integer('number_of_sites').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});


export const storeSites = pgTable('store_sites', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => stores.id, {
            onDelete: 'cascade',
        }),
    approved: boolean('approved').default(false).notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    siteName: varchar('site_name', { length: 255 }),
    cityId: integer('city_id')
        .notNull()
        .references(() => cities.id),
    address: varchar('address', { length: 255 }),
    postalCode: varchar('postal_code', { length: 20 }),
    phone: varchar('phone', { length: 20 }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const storeSitesToMenus = pgTable(
    'store_sites_to_menus',
    {
        store_site_id: uuid('store_site_id').notNull().references(() => storeSites.id),
        menu_id: uuid('menu_id').notNull().references(() => menus.id)
    },
    (t) => ({
        pk: primaryKey({ columns: [t.store_site_id, t.menu_id] })
    })
)

export const storeSitesRelations = relations(storeSites, ({ many }) => ({
    storeSitesToMenus: many(storeSitesToMenus)
}))

export const menus = pgTable('menus', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => stores.id, {
            onDelete: 'cascade',
        }),
    inProgressMenuVersionId: uuid("in_progress_menu_version_id"),
    publishedVersionId: uuid('published_menu_version_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const menusRelations = relations(menus, ({ many, one }) => ({
    storeSitesToMenus: many(storeSitesToMenus),
    publishedMenuVersion: one(menuVersions, {
        fields: [menus.publishedVersionId],
        references: [menuVersions.id]
    }),
    inProgressMenuVersion: one(menuVersions, {
        fields: [menus.inProgressMenuVersionId],
        references: [menuVersions.id]
    }),
}))

export const menuVersions = pgTable('menu_versions', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    menu_id: uuid('menu_id').notNull().references(() => menus.id, { onDelete: 'cascade' }),
    status: varchar('version_status', { length: 20 }).notNull(), //draft, review, approved, archived.
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    publishedAt: timestamp('created_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const menuCategories = pgTable('menu_categories', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    menu_version_id: uuid('menu_version_id').notNull().references(() => menuVersions.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('name').notNull().default(""),
    sort: integer("sort").notNull(),
})

export const databaseSchema = {
    storeUsers,
    customers: store_customers,
    roles,
    cities,
    storeTypes,
    stores,
    storeSites,
    storeSitesRelations,
    storeSitesToMenus,
    menus,
    menusRelations,
    menuVersions,
    menuCategories,
};