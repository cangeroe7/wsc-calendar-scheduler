import { Hono } from "hono";
import { db } from "../db";

export const eventsRoute = new Hono()
    
    // Get event by its unique identifier
	.get("/identifier/:identifier/:facultyId{[0-9]+}", async (c) => {
		const identifier = c.req.param("identifier");
		const facultyId = parseInt(c.req.param("facultyId"));

		try {
			const eventAppointment = await db.query.appointmentEvents.findFirst(
				{
					where: (ea, { eq, and }) =>
						and(
							eq(ea.identifier, identifier),
							eq(ea.facultyId, facultyId),
						),
				},
			);

			if (!eventAppointment) {
				return c.json("Event not found", 404);
			}

			return c.json(eventAppointment, 200);
		} catch (error) {
			console.error(error);
			return c.json("Internal server error", 500);
		}
	})

    // Get event by its eventId
	.get("/:id{[0-9]+}", async (c) => {
		const eventId = parseInt(c.req.param("id"));

		try {
			const event = await db.query.appointmentEvents.findFirst({
				where: (ea, { eq }) => eq(ea.id, eventId),
			});

			if (!event) {
				return c.json("Event not found", 404);
			}

			return c.json(event, 200);
		} catch (error) {
			console.error(error);
			return c.json("Internal server error", 500);
		}
	})

    // Get events by facultyId
	.get("/faculty/:facultyId{[0-9]+}", async (c) => {
		const facultyId = parseInt(c.req.param("facultyId"));

		try {
			const events = await db.query.appointmentEvents.findMany({
				where: (ea, { eq }) => eq(ea.facultyId, facultyId),
			});

			return c.json(events, 200);
		} catch (error) {
			console.error(error);
			return c.json("Internal server error", 500);
		}
	});
