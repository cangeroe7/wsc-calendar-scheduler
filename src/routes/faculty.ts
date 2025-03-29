import { Hono } from "hono";
import { getUser } from "../kinde";
import { eq, ilike } from "drizzle-orm";

import { db } from "../db";
import { departmentEnum, faculty } from "../db/schema/schema";

export const facultyRoute = new Hono()
  .get("/", getUser, async (c) => {
    try {
      const facultyList = await db.query.faculty.findMany();
      return c.json({ faculty: facultyList });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .get("/:department", getUser, async (c) => {
    const department = c.req.param("department");

    if (!Object.values(departmentEnum).includes(department)) {
      return c.json(
        { error: `Department '${department}' is not a valid department` },
        400,
      );
    }

    try {
      const typedDepartment =
        department as (typeof departmentEnum.enumValues)[number];
      const departmentFaculty = await db.query.faculty.findMany({
        where: eq(faculty.department, typedDepartment),
      });

      return c.json({
        facultyCount: departmentFaculty.length,
        faculty: departmentFaculty,
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .get("/:name", getUser, async (c) => {
    const name = c.req.param("name");

    try {
      const facultyList = await db.query.faculty.findMany({
        where: ilike(faculty.name, `%${name}%`),
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
  .get("/:id", getUser, async (c) => {
    const id = parseInt(c.req.param("id"));
    try {
      const facultyMember = await db.query.faculty.findFirst({
        where: eq(faculty.id, id),
      });

      return c.json({ facultyMember }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });
