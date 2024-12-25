ALTER TABLE "store_users" ALTER COLUMN "ext_auth_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "store_users" ALTER COLUMN "store_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "store_users" DROP COLUMN "last_name";