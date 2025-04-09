import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { authRoute } from "./routes/auth";
import { facultyRoute } from "./routes/faculty";
import { appointmentRoute } from "./routes/appointments";
import { scheduleRoute } from "./routes/schedule";
import { eventsRoute } from "./routes/events";

const app = new Hono();

app.use("*", logger());

const apiRoutes = app
	.basePath("/api")
	.route("/schedule", scheduleRoute)
	.route("/events", eventsRoute)
	.route("/faculty", facultyRoute)
	.route("/appointments", appointmentRoute)
	.route("/", authRoute);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;
