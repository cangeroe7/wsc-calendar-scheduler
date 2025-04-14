import { Hono } from "hono";
import { db } from "../db";
import { getMonthAvailability } from "../utils/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const scheduleRoute = new Hono()
	.get(
		"/month/:eventId{[0-9]+}",
		zValidator("query", z.object({ month: z.string().optional() })),
		async (c) => {
			const eventId = parseInt(c.req.param("eventId")!);
			const monthQuery = c.req.query("month");

			const { year, month } = (() => {
				if (monthQuery && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthQuery)) {
					const [y, m] = monthQuery.split("-");
					return { year: parseInt(y), month: parseInt(m) };
				} else {
					const d = new Date();
					return { year: d.getFullYear(), month: d.getMonth() };
				}
			})();

			try {
				const event = await db.query.appointmentEvents.findFirst({
					where: (ae, { eq }) => eq(ae.id, eventId),
				});

				// Make obsolete with check for existence in middleware with zValidator
				if (!event) {
					return c.json("Event not found", 404);
				}

				// Get the schedule for this event
				const scheduleId = event.scheduleId;

				// Get daily schedules for this schedule
				const dailySchedulesList =
					await db.query.dailySchedules.findMany({
						where: (ds, { eq }) => eq(ds.scheduleId, scheduleId),
					});
				if (!dailySchedulesList) {
					return c.json("daily schedules not found", 404);
				}

				// Get schedule overrides for this schedule
				const overridesList = await db.query.scheduleOverrides.findMany(
					{
						where: (so, { eq }) => eq(so.scheduleId, scheduleId),
					},
				);

				if (!overridesList) {
					return c.json("override schedules not found", 404);
				}

				// Calculate month availability
				const targetDate = new Date(year, month, 1);
				const { availability, month: correctMonth } =
					getMonthAvailability(
						targetDate,
						event,
						dailySchedulesList,
						overridesList,
					);

				return c.json({ availability, month: correctMonth }, 200);
			} catch (error) {
				return c.json("Internal server error", 500);
			}
		},
	)
	.get("/day/:eventId{[0-9]+}", async (c) => {
		return c.json("TEMPORARY");
	})
	.get("/overrides/scheduleId{[0-9]+}", async (c) => {
		return c.json("TEMPORARY");
	})
	.post("/override/:scheduleId{[0-9]+}")
	.post("/dailySchedule/:scheduleId{[0-9]+}")
	.delete("/override/:scheduleId{[0-9]+}")
	.delete("/dailySchedule/:scheduleId{[0-9]+}");
