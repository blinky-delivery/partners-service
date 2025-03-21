CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"icon" varchar DEFAULT '' NOT NULL,
	"name" varchar(255) NOT NULL,
	"ar" varchar(255) DEFAULT '' NOT NULL,
	"es" varchar(255) DEFAULT '' NOT NULL,
	"fr" varchar(255) DEFAULT '' NOT NULL,
	"sort" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"sort" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ext_auth_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"fcm_token" varchar,
	"avatar" varchar,
	"phone_number" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"store_site_id" uuid,
	"product_id" uuid,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) NOT NULL,
	"changed_fields" json,
	"enabled" boolean NOT NULL,
	"sort" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"store_site_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"enabled" boolean NOT NULL,
	"sort" integer DEFAULT 0,
	"status" varchar(20) NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modifier_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"modifier_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sort" integer NOT NULL,
	"price" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_site_id" uuid NOT NULL,
	"menu_id" uuid,
	"name" varchar(255) NOT NULL,
	"required" boolean NOT NULL,
	"multiple_allowed" boolean NOT NULL,
	"min_quantity" integer NOT NULL,
	"max_quantity" integer NOT NULL,
	"max_free_quantity" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modifiers_to_products" (
	"modifier_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "modifiers_to_products_modifier_id_product_id_pk" PRIMARY KEY("modifier_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "order_item_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"modifier_option_id" uuid,
	"option_name" varchar(255) NOT NULL,
	"option_price" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"product_name" varchar(255) NOT NULL,
	"base_price" double precision NOT NULL,
	"product_image" varchar(255),
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"store_site_id" uuid,
	"delivery_price" double precision NOT NULL,
	"items_amount" double precision NOT NULL,
	"tax_amount" double precision NOT NULL,
	"service_fee" double precision NOT NULL,
	"total_amount" double precision NOT NULL,
	"status" varchar(50) NOT NULL,
	"order_code" varchar(255) NOT NULL,
	"approximated_distance" double precision NOT NULL,
	"delivery_address" varchar(255) NOT NULL,
	"delivery_latitude" double precision NOT NULL,
	"delivery_longitude" double precision NOT NULL,
	"delivery_location" geometry(point) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"menu_id" uuid NOT NULL,
	"menu_category_id" uuid NOT NULL,
	"primary_image_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" double precision NOT NULL,
	"tax_rate" double precision,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"name" varchar(50) PRIMARY KEY NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "store_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_site_id" uuid NOT NULL,
	"day_of_week" smallint NOT NULL,
	"time_range_index" smallint NOT NULL,
	"open_time" time NOT NULL,
	"close_time" time NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "store_availability_store_site_id_day_of_week_time_range_index_unique" UNIQUE("store_site_id","day_of_week","time_range_index")
);
--> statement-breakpoint
CREATE TABLE "store_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"store_type_id" integer NOT NULL,
	"category_ids" uuid[] DEFAULT '{}' NOT NULL,
	"header_image" varchar,
	"description" text DEFAULT '' NOT NULL,
	"logo_image" varchar,
	"approved" boolean DEFAULT false NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"location" geometry(point),
	"name" varchar(255),
	"city_id" integer NOT NULL,
	"address" varchar(255),
	"postal_code" varchar(20),
	"phone" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_special_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_site_id" uuid NOT NULL,
	"special_date" date NOT NULL,
	"time_range_index" smallint NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_closed" boolean NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "store_special_hours_store_site_id_special_date_time_range_index_unique" UNIQUE("store_site_id","special_date","time_range_index")
);
--> statement-breakpoint
CREATE TABLE "store_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"enabled" boolean NOT NULL,
	"sort" integer DEFAULT 0,
	CONSTRAINT "store_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "store_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ext_auth_id" varchar(255) NOT NULL,
	"store_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "store_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" varchar NOT NULL,
	"store_type_id" integer NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"contact_phone" varchar(20) NOT NULL,
	"address" varchar(255) NOT NULL,
	"number_of_sites" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_store_site_id_store_sites_id_fk" FOREIGN KEY ("store_site_id") REFERENCES "public"."store_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_store_site_id_store_sites_id_fk" FOREIGN KEY ("store_site_id") REFERENCES "public"."store_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifier_options" ADD CONSTRAINT "modifier_options_modifier_id_modifiers_id_fk" FOREIGN KEY ("modifier_id") REFERENCES "public"."modifiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifiers" ADD CONSTRAINT "modifiers_store_site_id_store_sites_id_fk" FOREIGN KEY ("store_site_id") REFERENCES "public"."store_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifiers" ADD CONSTRAINT "modifiers_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifiers_to_products" ADD CONSTRAINT "modifiers_to_products_modifier_id_modifiers_id_fk" FOREIGN KEY ("modifier_id") REFERENCES "public"."modifiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifiers_to_products" ADD CONSTRAINT "modifiers_to_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_modifier_option_id_modifier_options_id_fk" FOREIGN KEY ("modifier_option_id") REFERENCES "public"."modifier_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_site_id_store_sites_id_fk" FOREIGN KEY ("store_site_id") REFERENCES "public"."store_sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_menu_category_id_menu_categories_id_fk" FOREIGN KEY ("menu_category_id") REFERENCES "public"."menu_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_primary_image_id_images_id_fk" FOREIGN KEY ("primary_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_availability" ADD CONSTRAINT "store_availability_store_site_id_store_sites_id_fk" FOREIGN KEY ("store_site_id") REFERENCES "public"."store_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_sites" ADD CONSTRAINT "store_sites_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_sites" ADD CONSTRAINT "store_sites_store_type_id_store_types_id_fk" FOREIGN KEY ("store_type_id") REFERENCES "public"."store_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_sites" ADD CONSTRAINT "store_sites_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_special_hours" ADD CONSTRAINT "store_special_hours_store_site_id_store_sites_id_fk" FOREIGN KEY ("store_site_id") REFERENCES "public"."store_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_store_type_id_store_types_id_fk" FOREIGN KEY ("store_type_id") REFERENCES "public"."store_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_store_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."store_users"("id") ON DELETE set null ON UPDATE no action;