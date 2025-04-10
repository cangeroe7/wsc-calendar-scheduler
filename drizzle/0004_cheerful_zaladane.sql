CREATE TABLE "appointment_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" varchar NOT NULL,
	"schedule_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"faculty_id" integer NOT NULL,
	"name" varchar,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"booking_interval" integer DEFAULT 30 NOT NULL,
	"location" varchar,
	"description" varchar(1000),
	"start_date" date,
	"end_date" date,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "end_after_start" CHECK ("daily_schedule"."start_time" < "daily_schedule"."end_time"),
	CONSTRAINT "day_of_week_numbers" CHECK ("daily_schedule"."day_of_week" BETWEEN 0 AND 6)
);
--> statement-breakpoint
CREATE TABLE "schedule_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer,
	"date" date NOT NULL,
	"blocked" boolean NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "end_after_start" CHECK ("schedule_overrides"."start_time" < "schedule_overrides"."end_time")
);
--> statement-breakpoint
CREATE TABLE "schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"user_id" varchar NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP INDEX "user_id_idx";--> statement-breakpoint
ALTER TABLE "faculty" ADD COLUMN "user_id" varchar;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "event_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "student_id" varchar;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "appointment_event" ADD CONSTRAINT "appointment_event_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_event" ADD CONSTRAINT "appointment_event_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_schedule" ADD CONSTRAINT "daily_schedule_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_overrides" ADD CONSTRAINT "schedule_overrides_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "identifier_faculty_unique" ON "appointment_event" USING btree ("identifier","faculty_id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_event_id_appointment_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."appointment_event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_student_id_unique" UNIQUE("student_id");--> statement-breakpoint
DROP TYPE "public"."appointment_status";