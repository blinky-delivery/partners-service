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
	"name" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "store_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_phone" varchar(20) NOT NULL,
	"number_of_sites" integer NOT NULL,
	"store_type" integer NOT NULL,
	"city" integer NOT NULL,
	"address" text NOT NULL,
	"id_card_front" varchar(255) NOT NULL,
	"id_card_back" varchar(255) NOT NULL,
	"store_image" varchar(255) NOT NULL,
	"is_approved" boolean NOT NULL,
	"is_under_review" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"path" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"site_name" varchar(255),
	"city_id" integer NOT NULL,
	"address" varchar(255),
	"postal_code" varchar(20),
	"phone" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
	"application_id" uuid NOT NULL,
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
ALTER TABLE "store_applications" ADD CONSTRAINT "store_applications_user_id_store_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."store_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_files" ADD CONSTRAINT "store_files_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_sites" ADD CONSTRAINT "store_sites_store_id_store_users_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_sites" ADD CONSTRAINT "store_sites_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_application_id_store_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."store_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_store_type_id_store_types_id_fk" FOREIGN KEY ("store_type_id") REFERENCES "public"."store_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_store_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."store_users"("id") ON DELETE set null ON UPDATE no action;