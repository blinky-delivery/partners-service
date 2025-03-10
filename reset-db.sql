SET session_replication_role = 'replica'; -- Disable foreign key checks (PostgreSQL)

DROP TABLE IF EXISTS 
    store_users, 
    customers, 
    stores, 
    store_sites, 
    categories,
    store_types, 
    store_availability,
    store_special_hours,
    roles, 
    products, 
    modifiers_to_products, 
    modifiers, 
    modifier_options, 
    menus, 
    menu_categories, 
    images, 
    cities 
    CASCADE;

SET session_replication_role = 'origin'; -- Re-enable foreign key checks (PostgreSQL)
