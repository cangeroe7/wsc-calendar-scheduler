import { Hono } from "hono";
import { getUser } from "../kinde";
import { db } from "../db";

export const eventsRoute = new Hono()
	.get("/identifier/:identifier/:facultyId{[0-9]+}", getUser, async (c) => {
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
	.get("/:id{[0-9]+}", getUser, async (c) => {
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
	.get("/faculty/:facultyId{[0-9]+}", getUser, async (c) => {
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
