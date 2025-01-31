-- Drop tables in reverse order of creation to avoid foreign key constraint errors

-- Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS "images" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "menu_categories" CASCADE;
DROP TABLE IF EXISTS "menus" CASCADE;
DROP TABLE IF EXISTS "store_sites" CASCADE;
DROP TABLE IF EXISTS "stores" CASCADE;
DROP TABLE IF EXISTS "store_users" CASCADE;
DROP TABLE IF EXISTS "store_customers" CASCADE;

-- Drop tables without foreign key dependencies
DROP TABLE IF EXISTS "cities" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "store_types" CASCADE;