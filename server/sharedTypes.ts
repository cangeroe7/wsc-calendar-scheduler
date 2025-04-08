import {
  createAppointmentSchema,
  selectFacultyAppointments,
} from "./db/schema/appointmentSchema";
import { departmentEnum, faculty } from "./db/schema/faculty";
import { appointments } from "./db/schema/appointments";
import { z } from "zod";
import { appointmentEvents, dailySchedules, scheduleOverrides, schedules } from "./db/schema/schema";

export { createAppointmentSchema } from "./db/schema/appointmentSchema";

export type Appointment = typeof appointments.$inferSelect;
export type Faculty = typeof faculty.$inferSelect;
export type Department = (typeof departmentEnum.enumValues)[number];
export type AppointmentEvent = typeof appointmentEvents.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type DailySchedule = typeof dailySchedules.$inferSelect;
export type ScheduleOverride = typeof scheduleOverrides.$inferSelect;

export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
export type SelectFacultyAppointments = z.infer<typeof selectFacultyAppointments>;
