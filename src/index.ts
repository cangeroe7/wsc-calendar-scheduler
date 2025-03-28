import { Hono } from "hono";
import { db } from "./db";
import { departmentEnum } from "./db/schema";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/faculty", async (c) => {
  const allStaff = await db.query.staff.findMany();
  return c.json(allStaff);
});

app.get("/faculty/:department", async (c) => {
  try {
    const department = c.req.param(
      "department",
    );
    if (!departmentEnum.enumValues.includes(department as any)) {
        return c.json({ error: "Invalid department"}, 400)
    }

    const faculty = await db.query.staff.findMany({
      where: (staff, { eq }) => eq(staff.department, department as typeof departmentEnum.enumValues[number]),
    });

    if (faculty.length === 0) {
      return c.json({ message: "No faculty found in this department" }, 404);
    }

    return c.json(faculty);
  } catch (error) {
    console.error("Error fetching faculty by department:", error);
    return c.json({ error: "Failed to fetch faculty data" }, 500);
  }
});

export default app;
