import * as t from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { appointments } from "./appointments";
import { faculty } from "./faculty";

export const daysOfWeekEnum = t.pgEnum("days_of_week", [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
]);

export const appointmentEvents = t.pgTable("appointment_event", {
    id: t.serial("id").primaryKey(),
    scheduleId: t
        .integer("schedule_id")
        .notNull()
        .references(() => schedules.id),
    userId: t.varchar("user_id").notNull(),
    name: t.varchar("name"),
    durationMinutes: t.integer("duration_minutes").notNull().default(30),
    bookingInterval: t.integer("booking_interval").notNull().default(30),
    location: t.varchar("location"),
    description: t.varchar("description", { length: 1000 }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
        .timestamp("created_at")
        .notNull()
        .$onUpdate(() => sql`now()`),
});

export const schedules = t.pgTable("schedule", {
    id: t.serial("id").primaryKey(),
    name: t.varchar("name"),
    startDate: t.date("start_date"),
    endDate: t.date("end_date"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
        .timestamp("created_at")
        .notNull()
        .$onUpdate(() => sql`now()`),
});

export const dailySchedules = t.pgTable(
    "daily_schedule",
    {
        id: t.serial("id").primaryKey(),
        scheduleId: t
            .integer("schedule_id")
            .notNull()
            .references(() => schedules.id),
        dayOfWeek: daysOfWeekEnum("day_of_week").notNull(),
        startTime: t.time("start_time").notNull(),
        endTime: t.time("end_time").notNull(),
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

export const scheduleOverrides = t.pgTable(
    "schedule_overrides",
    {
        id: t.serial("id").primaryKey(),
        scheduleId: t.integer("schedule_id").references(() => schedules.id),
        date: t.date("date").notNull(),
        blocked: t.boolean("blocked").notNull(),
        startTime: t.time("start_time"),
        endTime: t.time("end_time"),
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

export const scheduleRelations = relations(schedules, ({many}) => ({

}))
