import { Hono } from "hono";
import { db } from "../db";
import { getDayAvailability, getMonthAvailability } from "../utils/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const scheduleRoute = new Hono()
	.get(
		"/day/:eventId{[0-9]+}/:date{\\d{4}-\\d{2}-\\d{2}}",
		zValidator(
			"param",
			z.object({
				date: z.string().refine(
					(val) => {
						const date = new Date(val);
						return (
							!isNaN(date.getTime()) &&
							val === date.toISOString().slice(0, 10)
						);
					},
					{ message: "Invalid date" },
				),
				eventId: z.string().transform((val) => parseInt(val)),
			}),
		),
		async (c) => {
			const { eventId, date: dateStr } = c.req.valid("param");
			const targetDate = new Date(dateStr);

			try {
				const event = await db.query.appointmentEvents.findFirst({
					where: (ae, { eq }) => eq(ae.id, eventId),
				});

				if (!event) {
					return c.json("Event not found", 404);
				}

				const scheduleId = event.scheduleId;
				const dailySchedulesList =
					await db.query.dailySchedules.findMany({
						where: (ds, { eq, and }) =>
							and(
								eq(ds.scheduleId, scheduleId),
								eq(ds.dayOfWeek, targetDate.getUTCDay()),
							),
					});

				if (!dailySchedulesList) {
					return c.json("Daily schedules not found", 404);
				}

				// Get schedule overrides for this schedule
				const overridesList = await db.query.scheduleOverrides.findMany(
					{
						where: (so, { eq, and }) =>
							and(
								eq(so.scheduleId, scheduleId),
								eq(so.date, dateStr),
							),
					},
				);

				if (!overridesList) {
					return c.json("Override schedules not found", 404);
				}

				const appointments = await db.query.appointments.findMany({
					where: (ap, { eq, and, or, gte, lte }) =>
						and(
							eq(ap.eventId, eventId),
							or(
								gte(ap.endTime, targetDate),
								lte(ap.startTime, targetDate),
							),
						),
				});

				// Get the availability for the specific day
				const dayAvailability = getDayAvailability(
					targetDate,
					event,
					dailySchedulesList,
					overridesList,
					appointments,
				);

				return c.json(
					{ availability: dayAvailability, date: dateStr },
					200,
				);
			} catch (error) {
				console.error(error);
				return c.json("Internal server error", 500);
			}
		},
	)
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

				const appointments = await db.query.appointments.findMany({
					where: (ap, { eq }) => eq(ap.eventId, eventId),
				});

				// Calculate month availability
				const targetDate = new Date(year, month, 1);
				const { availability, month: correctMonth } =
					getMonthAvailability(
						targetDate,
						event,
						dailySchedulesList,
						overridesList,
						appointments,
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
