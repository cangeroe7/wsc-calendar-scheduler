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
    timestamp,
} from "drizzle-orm/pg-core";
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
export const faculty = pgTable("faculty", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    title: varchar("title", { length: 50 }),
    photoUrl: varchar("photo_url", { length: 200 }),
    position: varchar("position", { length: 50 }).notNull(),
    department: departmentEnum("department"),
    officeLocation: varchar("office_location", { length: 50 }),
    phone: varchar("phone", { length: 20 }),
    email: text("email").notNull().unique(),
});

// Hours Available Table
export const AppointmentStatusEnum = pgEnum("appointment_status", [
    "available",
    "blocked",
    "booked",
]);

// Appointments Table
export const appointments = pgTable("appointments", {
    id: serial("id").primaryKey(),
    facultyId: integer("faculty_id")
        .notNull()
        .references(() => faculty.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    status: AppointmentStatusEnum("status").default("available"),
    userId: varchar("user_id"),
});

// Relations
export const facultyRelations = relations(faculty, ({ many }) => ({
    appointments: many(appointments),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
    faculty: one(faculty, {
        fields: [appointments.facultyId],
        references: [faculty.id],
    }),
}));
