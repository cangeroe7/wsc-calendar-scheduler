import { Hono } from "hono";

import { db } from "../db";

import { getUser } from "../kinde";
import { eq } from "drizzle-orm";
import { appointments } from "../db/schema/schema";

export const appointmentRoute = new Hono().get(
  "/:faculty-id",
  getUser,
  async (c) => {
    const facultyId = parseInt(c.req.param("faculty-id"));
    const body = await c.req.json();

    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return c.json({ error: "Start date and end date are required" }, 400);
    }

    const appointmentList = await db.query.appointments.findMany({
      where: and(
          eq(appointments.facultyId, facultyId),
          gte(appointments.)
      ),
    });
  },
);
