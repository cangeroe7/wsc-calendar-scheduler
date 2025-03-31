CREATE TYPE "public"."appointment_status" AS ENUM('available', 'blocked', 'booked');--> statement-breakpoint
ALTER TABLE "hours_available" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "timeslots" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "hours_available" CASCADE;--> statement-breakpoint
DROP TABLE "timeslots" CASCADE;--> statement-breakpoint
ALTER TABLE "staff" RENAME TO "faculty";--> statement-breakpoint
ALTER TABLE "faculty" DROP CONSTRAINT "staff_email_unique";--> statement-breakpoint
ALTER TABLE "faculty" DROP CONSTRAINT "timeslots_check1";--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_faculty_id_staff_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_timeslot_id_timeslots_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" SET DATA TYPE appointment_status;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'available';--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "start_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "end_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "user_id" varchar;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "student_name";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "student_email";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "timeslot_id";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "appointment_date";--> statement-breakpoint
ALTER TABLE "faculty" DROP COLUMN "timeslots_per_hour";--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_email_unique" UNIQUE("email");