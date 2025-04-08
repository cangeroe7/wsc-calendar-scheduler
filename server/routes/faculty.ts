import { Hono } from "hono";
import { getUser } from "../kinde";
import { desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import {
	appointmentEvents,
	departmentEnum,
	faculty,
} from "../db/schema/schema";

// Get faculty by department
export const getDepartmentSchema = z.object({
	department: z.enum(departmentEnum.enumValues),
});

export const facultyRoute = new Hono()

	// Get all faculty
	.get("/", getUser, async (c) => {
		try {
			const facultyList = await db.query.faculty.findMany();
			return c.json({
				faculty: facultyList,
				facultyCount: facultyList.length,
			});
		} catch (error) {
			console.error(error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	// Get the events for a faculty member. Returns: list of events
	.get("/events/:id{[0-9]+}", async (c) => {
		const facultyId = parseInt(c.req.param("identifier")!);

		try {
			const events = await db.query.appointmentEvents.findMany({
				where: eq(appointmentEvents.facultyId, facultyId),
			});

			return c.json(events, 200);
		} catch (error) {
			return c.json("Internal server error", 500);
		}
	})

	// Get faculty based on their email identifier. Return: facultyMember
	.get("/identifier/:identifier", getUser, async (c) => {
		const identifier = c.req.param("identifier");

		try {
			const facultyMember = await db.query.faculty.findFirst({
				where: eq(faculty.email, `${identifier}@wsc.edu`),
			});

			if (!facultyMember) {
				return c.json("Faculty not found", 404);
			}

			return c.json(facultyMember, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	// Get faculty by department
	.get(
		"/department/:department",
		getUser,
		zValidator("param", getDepartmentSchema),
		async (c) => {
			const { department } = c.req.valid("param");

			try {
				const departmentFaculty = await db.query.faculty.findMany({
					where: eq(faculty.department, department),
				});

				return c.json({
					facultyCount: departmentFaculty.length,
					faculty: departmentFaculty,
				});
			} catch (error) {
				console.error(error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// Get faculty by name
	.get("/name/:name", getUser, async (c) => {
		const name = c.req.param("name");

		try {
			const facultyList = await db.query.faculty.findMany({
				where: ilike(faculty.name, `%${name}%`),
				orderBy: desc(faculty.name),
			});
			return c.json(
				{
					count: facultyList.length,
					faculty: facultyList,
				},
				200,
			);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.get("/appointments/:id{[0-9]+}", async (c) => {
		return c.json("very good", 200);
	})

	// Get faculty by id
	.get("/id/:id{[0-9]+}", getUser, async (c) => {
		const id = parseInt(c.req.param("id"));

		try {
			const facultyMember = await db.query.faculty.findFirst({
				where: eq(faculty.id, id),
			});

			if (!facultyMember) {
				return c.json({ error: "Faculty not found" }, 404);
			}

			return c.json({ facultyMember }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
