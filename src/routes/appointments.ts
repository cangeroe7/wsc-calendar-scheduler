import { Hono } from "hono";

import { db } from "../db";

import { getUser } from "../kinde";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { appointments } from "../db/schema/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const getAppointmentsSchema = z.object({
  param: z.object({
    id: z.string().regex(/^\d+$/, {
      message: "Value must be a valid number",
    }),
  }),
  json: z.object({
    startDate: z.string().refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }),
    endDate: z.string().refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }),
  }),
});

export const appointmentRoute = new Hono().get(
  "/:faculty_id",
  getUser,
  zValidator("param", getAppointmentsSchema.shape.param),
  zValidator("json", getAppointmentsSchema.shape.json),
  async (c) => {
    const facultyId = parseInt(c.req.valid("param").id);
    const { startDate, endDate } = c.req.valid("json");

    if (!startDate || !endDate) {
      return c.json({ error: "Start date and end date are required" }, 400);
    }

    const appointmentList = await db.query.appointments.findMany({
      where: and(
        eq(appointments.facultyId, facultyId),
        gte(appointments.date, startDate),
        lte(appointments.date, endDate),
      ),
      orderBy: desc(appointments.date),
    });
  },
)
.get("/:id", getUser);
