CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"student_name" text NOT NULL,
	"student_email" text NOT NULL,
	"timeslot_id" integer NOT NULL,
	"appointment_date" date NOT NULL,
	"status" varchar(20) DEFAULT 'Scheduled' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hours_available" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"day_of_week" varchar(10) NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar(50),
	"photo_url" varchar(200),
	"position" varchar(50) NOT NULL,
	"office_location" varchar(50),
	"phone" varchar(20),
	"email" text NOT NULL,
	"timeslots_per_hour" integer,
	CONSTRAINT "staff_email_unique" UNIQUE("email"),
	CONSTRAINT "timeslots_check1" CHECK ("staff"."timeslots_per_hour" BETWEEN 1 AND 4)
);
--> statement-breakpoint
CREATE TABLE "timeslots" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"day_of_week" varchar(10) NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"status" varchar(20) DEFAULT 'Available' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_faculty_id_staff_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_timeslot_id_timeslots_id_fk" FOREIGN KEY ("timeslot_id") REFERENCES "public"."timeslots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hours_available" ADD CONSTRAINT "hours_available_faculty_id_staff_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeslots" ADD CONSTRAINT "timeslots_faculty_id_staff_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;