
import { pgTable, uuid, varchar, timestamp, serial, boolean, integer, text, doublePrecision } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

export const customers = pgTable('customers', {
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


// Roles table
export const roles = pgTable('roles', {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(), // e.g., 'admin', 'owner', 'manager', 'driver'
});

// Cities table
export const cities = pgTable('cities', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    sort: integer('sort').default(0),
});

// Store Types table
export const storeTypes = pgTable('store_types', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    enabled: boolean('enabled').notNull(),
    sort: integer('sort').default(0),
});

// Stores table
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

// Store Sites table
export const storeSites = pgTable('store_sites', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => storeUsers.id, {
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


// Store files table
export const storeFiles = pgTable('store_files', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeId: uuid('store_id').notNull().references(() => stores.id),
    type: varchar('type', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    path: text('path').notNull(),
    size: integer('size').notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});


export const databaseSchema = {
    storeUsers,
    customers,
    roles,
    cities,
    storeTypes,
    stores,
    storeSites,
    storeFiles,
};