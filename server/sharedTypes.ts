import { createAppointmentSchema } from "./db/schema/appointmentSchema";
import { departmentEnum, faculty } from "./db/schema/faculty";
import { appointments } from "./db/schema/appointments";
import { z } from "zod";

export { createAppointmentSchema } from "./db/schema/appointmentSchema";

export type Appointment = typeof appointments.$inferSelect;
export type Faculty = typeof faculty.$inferSelect;
export type Department = (typeof departmentEnum.enumValues)[number];
export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
