
import { pgTable, uuid, varchar, timestamp, serial, boolean, integer, text, doublePrecision, jsonb, json, primaryKey, smallint, time, unique, date, geometry } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

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

export const customers = pgTable('customers', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    extAuthId: varchar('ext_auth_id', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 255 }).notNull(),
    fcmToken: varchar('fcm_token'),
    avatar: varchar('avatar'),
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

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    icon: varchar('icon',).notNull().default(''),
    name: varchar('name', { length: 255 }).notNull(),
    ar: varchar('ar', { length: 255 }).notNull().default(''),
    es: varchar('es', { length: 255 }).notNull().default(''),
    fr: varchar('fr', { length: 255 }).notNull().default(''),
    sort: integer('sort').default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
})

export const storeSites = pgTable('store_sites', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => stores.id, {
            onDelete: 'cascade',
        }),
    storeTypeId: integer('store_type_id')
        .notNull()
        .references(() => storeTypes.id),
    categoryIds: uuid('category_ids').array().notNull().default(sql`'{}'`),
    headerImage: varchar('header_image'),
    description: text('description').notNull().default(""),
    logoImage: varchar('logo_image'),
    approved: boolean('approved').default(false).notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }),
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
})

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
    sort: integer('sort').default(0),
    status: varchar('status', { length: 20 }).notNull(), //draft, review, approved, archived.
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const menuCategories = pgTable('menu_categories', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    menuId: uuid('menu_id').notNull().references(() => menus.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull(),
    changedFields: json("changed_fields"),
    enabled: boolean('enabled').notNull(),
    sort: integer("sort").notNull(),
})

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
    products: many(products),
}))

export const images = pgTable('images', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    fileId: uuid('file_id').notNull(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => stores.id, {
            onDelete: 'cascade',
        }),
    storeSiteId: uuid('store_site_id')
        .references(() => storeSites.id, {
            onDelete: 'set null',
        }),
    productId: uuid('product_id'),
    type: varchar('type', { length: 20 }).notNull(), // product, store_logo, header_carousel,
    status: varchar('status', { length: 20 }).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})


export const products = pgTable('products', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeId: uuid('store_id')
        .notNull()
        .references(() => stores.id, {
            onDelete: 'cascade',
        }),
    menuId: uuid('menu_id')
        .notNull()
        .references(() => menus.id, {
            onDelete: 'cascade',
        }),
    menuCategoryId: uuid('menu_category_id')
        .references(() => menuCategories.id)
        .notNull(),
    primaryImageId: uuid('primary_image_id')
        .references(() => images.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    price: doublePrecision('price').notNull(),
    taxRate: doublePrecision('tax_rate'),
    enabled: boolean('enabled').default(true).notNull(),
    sort: integer("sort").notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const modifiers = pgTable('modifiers', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeSiteId: uuid('store_site_id')
        .notNull()
        .references(() => storeSites.id, {
            onDelete: 'cascade',
        }),
    menuId: uuid('menu_id').references(() => menus.id),
    name: varchar('name', { length: 255 }).notNull(),
    required: boolean('required').notNull(),
    multipleAllowed: boolean('multiple_allowed').notNull(),
    minQuantity: integer("min_quantity").notNull(),
    maxQuantity: integer("max_quantity").notNull(),
    maxFreeQuantity: integer("max_free_quantity"),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const modifiersToProducts = pgTable('modifiers_to_products', {
    modifierId: uuid('modifier_id').notNull().references(() => modifiers.id),
    prdocutId: uuid('product_id').notNull().references(() => products.id),
},
    (t) => ({
        pk: primaryKey({ columns: [t.modifierId, t.prdocutId] })
    })
)

export const modifiersToProductsRelations = relations(modifiersToProducts, ({ one }) => ({
    product: one(products, {
        fields: [modifiersToProducts.prdocutId],
        references: [products.id],
    }),
    modifer: one(modifiers, {
        fields: [modifiersToProducts.modifierId],
        references: [modifiers.id],
    })
}))

export const productsRelations = relations(products, ({ many, one }) => ({
    primaryImage: one(images, { fields: [products.primaryImageId], references: [images.id] }),
    menuCategory: one(menuCategories, { fields: [products.menuCategoryId], references: [menuCategories.id] }),
    modifiersToProducts: many(modifiersToProducts),
}))

export const modifiersRelations = relations(modifiers, ({ many }) => ({
    modifiersToProducts: many(modifiersToProducts),
    options: many(modifierOptions),
}))

export const modifierOptions = pgTable('modifier_options', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    modiferId: uuid('modifier_id').notNull().references(() => modifiers.id),
    name: varchar('name', { length: 255 }).notNull(),
    sort: integer("sort").notNull(),
    price: doublePrecision('price').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
})

export const optoinsRelations = relations(modifierOptions, ({ one }) => ({
    modifier: one(modifiers, {
        fields: [modifierOptions.modiferId],
        references: [modifiers.id],
    })
}))

export const storeAvailability = pgTable('store_availability', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeSiteId: uuid('store_site_id')
        .notNull()
        .references(() => storeSites.id, {
            onDelete: 'cascade',
        }),
    dayOfWeek: smallint('day_of_week').notNull(),
    timeRangeIndex: smallint('time_range_index').notNull(),
    openTime: time('open_time').notNull(),
    closTime: time('close_time').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
}, (t) => ({
    unq: unique().on(t.storeSiteId, t.dayOfWeek, t.timeRangeIndex)
}))

export const storeSpecialHours = pgTable('store_special_hours', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    storeSiteId: uuid('store_site_id')
        .notNull()
        .references(() => storeSites.id, {
            onDelete: 'cascade',
        }),
    specialDate: date('special_date').notNull(),
    timeRangeIndex: smallint('time_range_index').notNull(),
    openTime: time('open_time'),
    closTime: time('close_time'),
    isClosed: boolean('is_closed').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
}, (t) => ({
    unq: unique().on(t.storeSiteId, t.specialDate, t.timeRangeIndex)
}))

export const orders = pgTable('orders', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    customerId: uuid('customer_id')
        .references(() => customers.id, { onDelete: 'set null' }),
    storeSiteId: uuid('store_site_id')
        .references(() => storeSites.id, { onDelete: 'set null' }),
    deliveryPrice: doublePrecision('delivery_price').notNull(),
    itemsAmount: doublePrecision('items_amount').notNull(),
    taxAmount: doublePrecision('tax_amount').notNull(),
    serviceFee: doublePrecision('service_fee').notNull(),
    totalAmount: doublePrecision('total_amount').notNull(),
    status: varchar('status', { length: 50 }).notNull(), // Order status (e.g., pending, completed, canceled)
    orderCode: varchar('order_code', { length: 255 }).notNull(),
    approximatedDistance: doublePrecision('approximated_distance').notNull(),
    deliveryAddress: varchar('delivery_address', { length: 255 }).notNull(),
    deliveryLatitude: doublePrecision('delivery_latitude').notNull(),
    deliveryLongitude: doublePrecision('delivery_longitude').notNull(),
    deliveryLocation: geometry('delivery_location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
})

export const orderItems = pgTable('order_items', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    orderId: uuid('order_id')
        .notNull()
        .references(() => orders.id, { onDelete: 'cascade' }), // Link to order
    productId: uuid('product_id'), // Optional, for reference (can be null if product is deleted)
    productName: varchar('product_name', { length: 255 }).notNull(), // Snapshot of product name
    basePrice: doublePrecision('base_price').notNull(), // Snapshot of product price
    productImage: varchar('product_image', { length: 255 }), // Snapshot of product image URL
    quantity: integer('quantity').notNull(), // Quantity of the product
})

export const orderItemOptions = pgTable('order_item_options', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    orderItemId: uuid('order_item_id')
        .notNull()
        .references(() => orderItems.id, { onDelete: 'cascade' }),
    modifierOptionId: uuid('modifier_option_id')
        .references(() => modifierOptions.id, { onDelete: 'set null' }),
    optionName: varchar('option_name', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull(),
    optionPrice: doublePrecision('option_price').notNull().default(0),
})

export const orderItemsRelations = relations(orderItems, ({ many }) => ({
    options: many(orderItemOptions),
}));

export const orderItemOptionsRelations = relations(orderItemOptions, ({ one }) => ({
    orderItem: one(orderItems, {
        fields: [orderItemOptions.orderItemId],
        references: [orderItems.id],
    }),
    modifierOption: one(modifierOptions, {
        fields: [orderItemOptions.modifierOptionId],
        references: [modifierOptions.id],
    }),
}))

export const storeSiteDailySequences = pgTable('store_site_daily_sequences', {
    storeSiteId: uuid('store_site_id')
        .notNull()
        .references(() => storeSites.id),
    date: date('date').notNull(),
    lastSequence: integer('last_sequence').notNull().default(0),
}, (t) => ({
    pk: primaryKey({ columns: [t.storeSiteId, t.date] })
}));


export const partnersSchema = {
    storeUsers,
    customers,
    roles,
    cities,
    storeTypes,
    stores,
    storeSites,
    categories,
    menus,
    menuCategories,
    images,
    products,
    productsRelations,
    modifiers,
    modifiersToProducts,
    modifiersToProductsRelations,
    modifiersRelations,
    modifierOptions,
    menuCategoriesRelations,
    optoinsRelations,
    storeAvailability,
    storeSpecialHours,
    orders,
    orderItems,
    orderItemsRelations,
    orderItemOptions,
    orderItemOptionsRelations,
    storeSiteDailySequences
};