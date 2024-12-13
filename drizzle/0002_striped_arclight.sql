ALTER TABLE "stores" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "contact_phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "address" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "number_of_sites" SET NOT NULL;