import {
    pgTable,
    serial,
    integer,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { faculty } from "./faculty";
import { appointmentEvents } from "./schedule";

// Appointments Table
export const appointments = pgTable("appointments", {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
        .notNull()
        .references(() => appointmentEvents.id),
    facultyId: integer("faculty_id")
        .notNull()
        .references(() => faculty.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    studentId: varchar("student_id").unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointmentRelations = relations(appointments, ({ one }) => ({
    faculty: one(faculty, {
        fields: [appointments.facultyId],
        references: [faculty.id],
    }),
}));
