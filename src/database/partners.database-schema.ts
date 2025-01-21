
import { pgTable, uuid, varchar, timestamp, serial, boolean, integer, text, doublePrecision, jsonb, json } from 'drizzle-orm/pg-core';
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
    name: varchar('name', { length: 255 }),
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


export const menus = pgTable('menus', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => stores.id, {
            onDelete: 'cascade',
        }),
    storeSiteId: uuid('store_site_id')
        .references(() => storeSites.id, {
            onDelete: 'cascade',
        }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    enabled: boolean('enabled').notNull(),
    coverImage: varchar('site_name', { length: 255 }),
    status: varchar('status', { length: 20 }).notNull(), //draft, review, approved, archived.
    changedFields: json("changed_fields"),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});



export const menuCategories = pgTable('menu_categories', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    menu_id: uuid('menu_id').notNull().references(() => menus.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('name').notNull().default(""),
    status: varchar('status', { length: 20 }).notNull(),
    changedFields: json("changed_fields"),
    enabled: boolean('enabled').notNull(),
    sort: integer("sort").notNull(),
})

export const images = pgTable('images', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    file_id: uuid('file_id').notNull(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => stores.id, {
            onDelete: 'cascade',
        }),
    storeSiteId: uuid('store_site_id')
        .references(() => storeSites.id, {
            onDelete: 'cascade',
        }),
    type: varchar('type', { length: 20 }).notNull(), // product, store_logo, header_carousel,
    status: varchar('status', { length: 20 }).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})

export const partnersSchema = {
    storeUsers,
    customers: store_customers,
    roles,
    cities,
    storeTypes,
    stores,
    storeSites,
    menus,
    menuCategories,
};