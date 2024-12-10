CREATE TABLE "store_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ext_auth_id" varchar(255),
	"store_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"phone_number" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "store_users_email_unique" UNIQUE("email")
);
