import { createAppointmentSchema } from "./db/schema/appointmentSchema";
import { z } from "zod";

export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
