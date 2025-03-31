import { Hono } from "hono";
import { getUser } from "../kinde";
import { desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import { departmentEnum, faculty } from "../db/schema/schema";

export const facultyRoute = new Hono();

// Get all faculty
facultyRoute.get("/", getUser, async (c) => {
    try {
        const facultyList = await db.query.faculty.findMany();
        return c.json({ faculty: facultyList });
    } catch (error) {
        console.error(error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Get faculty by department
const getDepartmentSchema = z.object({
    department: z.enum(departmentEnum.enumValues),
});

facultyRoute.get(
    "/department/:department",
    getUser,
    zValidator("param", getDepartmentSchema),
    async (c) => {
        const { department } = c.req.valid("param");
        console.log(department);

        try {
            //   const typedDepartment =
            // department as (typeof departmentEnum.enumValues)[number];
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
);

// Get faculty by name
facultyRoute.get("/name/:name", getUser, async (c) => {
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
});

// Get faculty by id
facultyRoute.get("/id/:id{[0-9]+}", getUser, async (c) => {
    const id = parseInt(c.req.param("id"));

    try {
        const facultyMember = await db.query.faculty.findFirst({
            where: eq(faculty.id, id),
        });

        if (!facultyMember) {
            return c.notFound();
        }

        return c.json({ facultyMember }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Internal server error" }, 500);
    }
});
