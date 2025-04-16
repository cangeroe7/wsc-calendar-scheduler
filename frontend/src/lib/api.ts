import { hc } from "hono/client";
import type { ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import type {
	CreateAppointment,
	SelectFacultyAppointments,
} from "@server/sharedTypes";
import { tryCatch } from "@server/utils/utils";
import { NotFoundError, ServerError } from "@/lib/errors";

const client = hc<ApiRoutes>("/");

export const api = client.api;

export async function getFacultyAppointments(
	facultyId: string,
	{
		value,
	}: {
		value: SelectFacultyAppointments;
	},
) {
	const res = await api.appointments.faculty[":id{[0-9]+}"].$get({
		param: { id: facultyId.toString() },
		query: {
			startTime: value.startTime
				? value.startTime.toISOString()
				: undefined,
			endTime: value.endTime ? value.endTime.toISOString() : undefined,
		},
	});

	if (!res.ok) {
		throw Error("Appointments failed to load");
	}

	const data = await res.json();

	const appointmentsWithDates = data.appointments.map((appointment) => ({
		...appointment,
		startTime: new Date(appointment.startTime),
		endTime: new Date(appointment.endTime),
		createdAt: appointment.createdAt
			? new Date(appointment.createdAt)
			: null,
	}));

	return {
		...data,
		appointments: appointmentsWithDates,
	};
}

export const getFacultyAppointmentsQueryOptions = (
	facultyId: string,
	{ value }: { value: SelectFacultyAppointments },
) =>
	queryOptions({
		queryKey: ["faculty-appointments", facultyId, value],
		queryFn: () => getFacultyAppointments(facultyId, { value }),
	});

async function getCurrentUser() {
	const res = await api.me.$get();
	if (!res.ok) {
		throw new Error("server error");
	}

	const data = await res.json();
	return data;
}

export const userQueryOptions = queryOptions({
	queryKey: ["get-current-user"],
	queryFn: getCurrentUser,
	staleTime: Infinity,
});

async function getFacultyMemberByIdentifier(identifier: string) {
	const facultyResult = await tryCatch(
		api.faculty.identifier[":identifier"].$get({
			param: { identifier: identifier },
		}),
	);

	if (!facultyResult.data) {
		throw new ServerError();
	}

	if (facultyResult.data.status === 404) {
		throw new NotFoundError("Faculty not found");
	}

	if (!facultyResult.data.ok) {
		throw new ServerError("Something went wrong");
	}

	const facultyMember = await facultyResult.data.json();

	return facultyMember;
}

export const facultyMemberByIdentiferQueryOptions = (identifier: string) =>
	queryOptions({
		queryKey: ["get-faculty-by-identifier", identifier],
		queryFn: () => getFacultyMemberByIdentifier(identifier),
		staleTime: Infinity,
	});

async function getEventByIdentifierAndFacultyId(
	identifier: string,
	facultyId: number,
) {
	const eventResult = await tryCatch(
		api.events.identifier[":identifier"][":facultyId{[0-9]+}"].$get({
			param: {
				identifier: identifier,
				facultyId: facultyId.toString(),
			},
		}),
	);

	if (!eventResult.data) {
		throw new ServerError();
	}

	if (eventResult.data.status === 404) {
		throw new NotFoundError("Event not found");
	}

	if (!eventResult.data.ok) {
		throw new ServerError("Something went wrong");
	}

	const rawEvent = await eventResult.data.json();

	const event = {
		...rawEvent,
		startDate: rawEvent.startDate
			? new Date(rawEvent.startDate)
			: new Date(-8640000000000000), // Earliest possible JS date
		endDate: rawEvent.endDate
			? new Date(rawEvent.endDate)
			: new Date(8640000000000000), // Latest possible JS date
	};
	return event;
}

export const eventByIdentifierAndFacultyIdQuery = (
	identifier: string,
	facultyId: number,
) =>
	queryOptions({
		queryKey: [
			"get-event-by-identifier-and-faculty-id",
			identifier,
			facultyId,
		],
		queryFn: () => getEventByIdentifierAndFacultyId(identifier, facultyId),
		staleTime: Infinity,
	});

async function getScheduleByEventId(eventId: string, month?: string) {
	const scheduleResult = await tryCatch(
		api.schedule.month[":eventId{[0-9]+}"].$get({
			param: { eventId: eventId },
			query: { month: month },
		}),
	);

	if (!scheduleResult.data) {
		throw new ServerError();
	}

	if (scheduleResult.data.status === 404) {
		throw new NotFoundError("Event schedule not found");
	}

	if (!scheduleResult.data.ok) {
		throw new ServerError("Something went wrong");
	}

	const schedule = await scheduleResult.data.json();

	return schedule;
}

export const scheduleByEventIdQuery = (eventId: string, month?: string) =>
	queryOptions({
		queryKey: ["get-schedule-by-event-id", eventId, month],
		queryFn: () => getScheduleByEventId(eventId, month),
		staleTime: 2 * 60 * 1000,
	});

async function getDayAvailability(eventId: string, date: string) {
	const availabilityResult = await tryCatch(
		api.schedule.day[":eventId{[0-9]+}"][
			":date{\\d{4}-\\d{2}-\\d{2}}"
		].$get({
			param: {
				eventId,
				date,
			},
		}),
	);

	if (!availabilityResult.data) {
		throw new ServerError();
	}

	if (availabilityResult.data.status === 404) {
		throw new NotFoundError("day availability not found");
	}

	if (!availabilityResult.data.ok) {
		throw new ServerError("Something went wrong");
	}

	const dayAvailability = await availabilityResult.data.json();

	return dayAvailability;
}

export const dayAvailabilityQuery = (eventId: string, date: string) =>
	queryOptions({
		queryKey: ["get-day-availability", eventId, date],
		queryFn: () => getDayAvailability(eventId, date),
		staleTime: 2 * 60 * 1000,
	});

async function getAllFaculty() {
	const res = await api.faculty.$get();
	if (!res.ok) {
		throw new Error("server error");
	}
	const data = await res.json();
	return data;
}

export const getAllFacultyQueryOptions = queryOptions({
	queryKey: ["get-all-faculty"],
	queryFn: getAllFaculty,
	staleTime: 1000 * 60 * 5,
});

async function getFacultyById(facultyId: string) {
	const res = await api.faculty.id[":id{[0-9]+}"].$get({
		param: {
			id: facultyId,
		},
	});

	if (!res.ok) {
		throw new Response("Faculty member not found", { status: 404 });
	}
	const data = await res.json();
	return data;
}

export const getFacultyByIdQueryOptions = (facultyId: string) =>
	queryOptions({
		queryKey: ["get-faculty-by-id", facultyId],
		queryFn: () => getFacultyById(facultyId),
	});

export async function createAppointment({
	value,
}: {
	value: CreateAppointment;
}) {
	const res = await api.appointments.$post({ json: value });
	if (!res.ok) {
		throw new Error("server error");
	}

	const newExpense = await res.json();
	return newExpense;
}
