import {
  pgTable,
  serial,
  integer,
  varchar,
  pgEnum,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { faculty } from "./faculty";

// Hours Available Table
export const AppointmentStatusEnum = pgEnum("appointment_status", [
  "available",
  "blocked",
  "booked",
]);

// Appointments Table
export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    facultyId: integer("faculty_id")
      .notNull()
      .references(() => faculty.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    status: AppointmentStatusEnum("status").default("available").notNull(),
    userId: varchar("user_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (appointments) => [uniqueIndex("user_id_idx").on(appointments.userId)],
);

export const appointmentRelations = relations(appointments, ({ one }) => ({
  faculty: one(faculty, {
    fields: [appointments.facultyId],
    references: [faculty.id],
  }),
}));



