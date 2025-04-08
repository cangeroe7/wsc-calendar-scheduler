import * as t from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const departmentEnum = t.pgEnum("department", [
	"Art and Design",
	"Business and Economics",
	"Communication Arts",
	"Computer Technology and Information Systems",
	"Counseling",
	"Criminal Justice",
	"Educational Foundations and Leadership",
	"Health, Human Performance, and Sport",
	"History, Politics, and Geography",
	"Language and Literature",
	"Life Sciences",
	"Music",
	"Physical Sciences and Mathematics",
	"Psychology and Sociology",
	"Technology and Applied Science",
]);

// Faculty Table
export const faculty = t.pgTable("faculty", {
	id: t.serial("id").primaryKey(),
	name: t.varchar("name").notNull(),
	title: t.varchar("title", { length: 50 }),
	photoUrl: t.varchar("photo_url", { length: 200 }),
	position: t.varchar("position", { length: 50 }).notNull(),
	department: departmentEnum("department"),
	officeLocation: t.varchar("office_location", { length: 50 }),
	phone: t.varchar("phone", { length: 20 }),
	email: t.text("email").notNull().unique(),
	userId: t.varchar("user_id").unique(),
});

// Faculty Relations
export const facultyRelations = relations(faculty, ({ many }) => ({
	appointments: many(appointments),
	appointmentEvents: many(appointmentEvents),
}));

// Appointments Table
export const appointments = t.pgTable("appointments", {
	id: t.serial("id").primaryKey(),
	eventId: t
		.integer("event_id")
		.notNull()
		.references(() => appointmentEvents.id),
	facultyId: t
		.integer("faculty_id")
		.notNull()
		.references(() => faculty.id, { onDelete: "cascade" }),
	startTime: t.timestamp("start_time").notNull(),
	endTime: t.timestamp("end_time").notNull(),
	studentId: t.varchar("student_id").unique(),
	createdAt: t.timestamp("created_at").defaultNow(),
	updatedAt: t.timestamp("updated_at").defaultNow(),
});

// Appointment Relations
export const appointmentRelations = relations(appointments, ({ one }) => ({
	faculty: one(faculty, {
		fields: [appointments.facultyId],
		references: [faculty.id],
	}),
}));

// Appointment Events Table
export const appointmentEvents = t.pgTable("appointment_event", {
	id: t.serial("id").primaryKey(),
	scheduleId: t
		.integer("schedule_id")
		.notNull()
		.references(() => schedules.id),
	userId: t.varchar("user_id").notNull(),
	facultyId: t
		.integer("faculty_id")
		.notNull()
		.references(() => faculty.id),
	name: t.varchar("name"),
	durationMinutes: t.integer("duration_minutes").notNull().default(30),
	bookingInterval: t.integer("booking_interval").notNull().default(30),
	location: t.varchar("location"),
	description: t.varchar("description", { length: 1000 }),
	startDate: t.date("start_date"),
	endDate: t.date("end_date"),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t
		.timestamp("created_at")
		.notNull()
		.$onUpdate(() => sql`now()`),
});

// Appointment Events Relations
export const appointmentEventsRelations = relations(
	appointmentEvents,
	({ one, many }) => ({
		schedule: one(schedules, {
			fields: [appointmentEvents.scheduleId],
			references: [schedules.id],
		}),
		faculty: one(faculty, {
			fields: [appointmentEvents.facultyId],
			references: [faculty.id],
		}),
		appointments: many(appointments),
	}),
);

// Schedules Table
export const schedules = t.pgTable("schedule", {
	id: t.serial("id").primaryKey(),
	name: t.varchar("name"),
	userId: t.varchar("user_id").notNull(),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t
		.timestamp("created_at")
		.notNull()
		.$onUpdate(() => sql`now()`),
});

// Schedule Relations
export const scheduleRelations = relations(schedules, ({ many }) => ({
	appointmentEvents: many(appointmentEvents),
	dailySchedules: many(dailySchedules),
	scheduleOverrides: many(scheduleOverrides),
}));

// Daily Schedules Table
export const dailySchedules = t.pgTable(
	"daily_schedule",
	{
		id: t.serial("id").primaryKey(),
		scheduleId: t
			.integer("schedule_id")
			.notNull()
			.references(() => schedules.id),
		dayOfWeek: t.integer("day_of_week").notNull(),
		startTime: t.timestamp("start_time").notNull(),
		endTime: t.timestamp("end_time").notNull(),
		createdAt: t.timestamp("created_at").notNull().defaultNow(),
		updatedAt: t
			.timestamp("created_at")
			.notNull()
			.$onUpdate(() => sql`now()`),
	},
	(table) => [
		t.check("end_after_start", sql`${table.startTime} < ${table.endTime}`),
		t.check("day_of_week_numbers", sql`${table.dayOfWeek} BETWEEN 0 AND 6`),
	],
);

// Daily Schedule Relations
export const dailyScheduleRelations = relations(dailySchedules, ({ one }) => ({
	schedule: one(schedules, {
		fields: [dailySchedules.scheduleId],
		references: [schedules.id],
	}),
}));

// Schedule Overrides Table
export const scheduleOverrides = t.pgTable(
	"schedule_overrides",
	{
		id: t.serial("id").primaryKey(),
		scheduleId: t.integer("schedule_id").references(() => schedules.id),
		date: t.date("date").notNull(),
		blocked: t.boolean("blocked").notNull(),
		startTime: t.timestamp("start_time"),
		endTime: t.timestamp("end_time"),
		createdAt: t.timestamp("created_at").notNull().defaultNow(),
		updatedAt: t
			.timestamp("created_at")
			.notNull()
			.$onUpdate(() => sql`now()`),
	},
	(table) => [
		t.check("end_after_start", sql`${table.startTime} < ${table.endTime}`),
	],
);

// Schedule Overrides Relations
export const scheduleOverrideRelations = relations(
	scheduleOverrides,
	({ one }) => ({
		schedule: one(schedules, {
			fields: [scheduleOverrides.scheduleId],
			references: [schedules.id],
		}),
	}),
);
