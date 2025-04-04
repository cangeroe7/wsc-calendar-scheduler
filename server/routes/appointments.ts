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
        facultyExists,
        zValidator("query", selectFacultyAppointments),
        async (c) => {
            const facultyId = parseInt(c.req.param("id"));


            const { startTime, endTime, status } = c.req.valid("query");

            const conditions = [eq(appointments.facultyId, facultyId)];

            if (startTime) conditions.push(gte(appointments.startTime, startTime));
            if (endTime) conditions.push(lte(appointments.startTime, endTime));
            if (status) conditions.push(eq(appointments.status, status));

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
        "/user/:id",
        getUser,
        zValidator("json", getUserAppointmentsSchema),
        async (c) => {
            const userId = c.req.param("id");
            const { startDate, endDate } = c.req.valid("json");

            const conditions = [eq(appointments.userId, userId)];

            if (startDate) conditions.push(gte(appointments.startTime, startDate));
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

    // get
    .get("/available")

    // Create an appointment
    .post("/", zValidator("json", createAppointmentSchema), async (c) => {
        const appointment = c.req.valid("json");

        const validatedAppointment = await insertAppointmentSchema.parseAsync({
            ...appointment,
        });

        const result = await db
            .insert(appointments)
            .values(validatedAppointment)
            .returning()
            .then((res) => res[0]);

        return c.json(result, 201);
    })

    // Update appointment status to booked
    .patch("book/:id{[0-9]+}") // status = booked, userId = kinde user id

    // Update appointment status to available
    .patch("cancel/:id{[0-9]+}") // status = available, userId = null

    // Update appointment status to blocked
    .patch("block/:id{[0-9]+}") // status = blocked, userId = null

    // deletes an appointment
    .delete("/"); // deleting an appointment, can only be done by faculty should only be done if all of them in that time period should be deleted, not just blocked
