ALTER TABLE "schedule" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "title" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "description" varchar(1000);