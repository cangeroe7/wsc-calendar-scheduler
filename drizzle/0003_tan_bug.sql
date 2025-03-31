ALTER TABLE "appointments" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_idx" ON "appointments" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "date";