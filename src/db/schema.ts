import {
  pgTable,
  check,
  serial,
  text,
  time,
  integer,
  varchar,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

export const departmentEnum = pgEnum("department", [
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

// Faculty Info Table
export const staff = pgTable(
  "staff",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    title: varchar("title", { length: 50 }),
    photoUrl: varchar("photo_url", { length: 200 }),
    position: varchar("position", { length: 50 }).notNull(),
    department: departmentEnum("department"),
    officeLocation: varchar("office_location", { length: 50 }),
    phone: varchar("phone", { length: 20 }),
    email: text("email").notNull().unique(),
    timeslotsPerHour: integer("timeslots_per_hour"),
  },
  (table) => [
    check("timeslots_check1", sql`${table.timeslotsPerHour} BETWEEN 1 AND 4`),
  ],
);

// Hours Available Table
export const hoursAvailable = pgTable("hours_available", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => staff.id, { onDelete: "cascade" }),
  dayOfWeek: varchar("day_of_week", { length: 10 }).notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

// Timeslots Table
export const timeslots = pgTable("timeslots", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => staff.id, { onDelete: "cascade" }),
  dayOfWeek: varchar("day_of_week", { length: 10 }).notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Available"),
});

// Appointments Table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => staff.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email").notNull(),
  timeslotId: integer("timeslot_id")
    .notNull()
    .references(() => timeslots.id, { onDelete: "cascade" }),
  appointmentDate: date("appointment_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Scheduled"),
});

// Relations
export const facultyRelations = relations(staff, ({ many }) => ({
  hoursAvailable: many(hoursAvailable),
  timeslots: many(timeslots),
  appointments: many(appointments),
}));

export const hoursRelations = relations(hoursAvailable, ({ one }) => ({
  faculty: one(staff, {
    fields: [hoursAvailable.facultyId],
    references: [staff.id],
  }),
}));

export const timeslotRelations = relations(timeslots, ({ one }) => ({
  faculty: one(staff, {
    fields: [timeslots.facultyId],
    references: [staff.id],
  }),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  faculty: one(staff, {
    fields: [appointments.facultyId],
    references: [staff.id],
  }),
  timeslot: one(timeslots, {
    fields: [appointments.timeslotId],
    references: [timeslots.id],
  }),
}));
