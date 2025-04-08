import { hc } from "hono/client";
import type { ApiRoutes } from "@server/app";
import { queryOptions, QueryClient } from "@tanstack/react-query";
import type {
  CreateAppointment,
  SelectFacultyAppointments,
} from "@server/sharedTypes";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

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
      startTime: value.startTime ? value.startTime.toISOString() : undefined,
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
    createdAt: appointment.createdAt ? new Date(appointment.createdAt) : null,
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
