import { Hono } from "hono";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { facultyExists, getUser } from "../kinde";
import { appointments } from "../db/schema/appointments";
import {
	createAppointmentSchema,
	insertAppointmentSchema,
	selectFacultyAppointments,
} from "../db/schema/appointmentSchema";
import { db } from "../db";

const getUserAppointmentsSchema = z.object({
	startDate: z
		.date()
		.refine((date) => {
			const d = new Date(date);
			return !isNaN(d.getTime());
		})
		.optional(),
	endDate: z
		.date()
		.refine((date) => {
			const d = new Date(date);
			return !isNaN(d.getTime());
		})
		.optional(),
});

// Get available times for days
export const appointmentRoute = new Hono()

	// Get appointment by appointment id
	.get("/:id{[0-9]+}", async (c) => {
		const appointmentId = parseInt(c.req.param("id"));
		console.log(appointmentId);

		try {
			const appointment = db.query.appointments.findFirst({
				where: eq(appointments.id, appointmentId),
			});

			return c.json({ appointment }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	// Get appointments for faculty member
	.get(
		"/faculty/:id{[0-9]+}",
		getUser,
		facultyExists,
		zValidator("query", selectFacultyAppointments),
		async (c) => {
			const facultyId = parseInt(c.req.param("id"));

			const { startTime, endTime } = c.req.valid("query");

			const conditions = [eq(appointments.facultyId, facultyId)];

			if (startTime)
				conditions.push(gte(appointments.startTime, startTime));
			if (endTime) conditions.push(lte(appointments.startTime, endTime));

			try {
				const appointmentList = await db.query.appointments.findMany({
					where: and(...conditions),
					orderBy: desc(appointments.startTime),
				});

				return c.json(
					{
						appointmentsCount: appointmentList.length,
						appointments: appointmentList,
					},
					200,
				);
			} catch (error) {
				console.error(error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// Get users appointments
	.get(
		"/userAppointments",
		getUser,
		zValidator("json", getUserAppointmentsSchema),
		async (c) => {
			const userId = c.var.user.id;
			const { startDate, endDate } = c.req.valid("json");

			const conditions = [eq(appointments.studentId, userId)];

			if (startDate)
				conditions.push(gte(appointments.startTime, startDate));
			if (endDate) conditions.push(lte(appointments.startTime, endDate));

			try {
				const appointmentList = await db.query.appointments.findMany({
					where: and(...conditions),
					orderBy: desc(appointments.startTime),
				});

				return c.json({
					appointmentsCount: appointmentList.length,
					appointments: appointmentList,
				});
			} catch (error) {
				console.error(error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// Create an appointment
	.post(
		"/",
		zValidator("json", createAppointmentSchema),
		getUser,
		async (c) => {
			const appointment = c.req.valid("json");

			const validatedAppointment =
				await insertAppointmentSchema.parseAsync({
					...appointment,
				});

			const result = await db
				.insert(appointments)
				.values(validatedAppointment)
				.returning()
				.then((res) => res[0]);

			return c.json(result, 201);
		},
	)

	// Delete an appointment by id. Returns deleted Appointment
	.delete("/:id{[0-9]+}", getUser, async (c) => {
		// TODO: Add check for appointment existence
		const appointmentId = parseInt(c.req.param("id"));
		const userId = c.var.user.id;

		try {
			const deletedAppointment = await db
				.delete(appointments)
				.where(
					and(
						eq(appointments.id, appointmentId),
						eq(appointments.studentId, userId),
					),
				)
				.returning()
				.then((res) => res[0]);

			if (!deletedAppointment) {
				return c.json(
					{
						success: false,
						message: "Appointment not found or already deleted",
					},
					404,
				);
			}

			return c.json({ success: true, deletedAppointment }, 200);
		} catch (error) {
			console.error(error);
			return c.json("Internal server error", 500);
		}
	});
