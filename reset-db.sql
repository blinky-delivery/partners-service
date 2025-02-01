SET session_replication_role = 'replica'; -- Disable foreign key checks (PostgreSQL)

DROP TABLE IF EXISTS 
    store_users, 
    store_customers, 
    stores, 
    store_sites, 
    store_types, 
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
