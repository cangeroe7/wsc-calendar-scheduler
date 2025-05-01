import {
	createAppointmentSchema,
	selectFacultyAppointments,
} from "./db/schema/appointmentSchema";
import { departmentEnum, faculty } from "./db/schema/schema";
import { appointments } from "./db/schema/schema";
import { z } from "zod";
import {
	appointmentEvents,
	dailySchedules,
	scheduleOverrides,
	schedules,
} from "./db/schema/schema";

type Override<T, R> = Omit<T, keyof R> & R;

export { createAppointmentSchema } from "./db/schema/appointmentSchema";

export type Appointment = typeof appointments.$inferSelect;
export type Faculty = typeof faculty.$inferSelect;
export type Department = (typeof departmentEnum.enumValues)[number];
export type AppointmentEvent = typeof appointmentEvents.$inferSelect;
export type AppointmentEventDated = Override<
	AppointmentEvent,
	{ createdAt: string; updatedAt: string; startDate: Date; endDate: Date }
>;
export type Schedule = typeof schedules.$inferSelect;
export type DailySchedule = typeof dailySchedules.$inferSelect;
export type ScheduleOverride = typeof scheduleOverrides.$inferSelect;

export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
export type SelectFacultyAppointments = z.infer<
	typeof selectFacultyAppointments
>;
