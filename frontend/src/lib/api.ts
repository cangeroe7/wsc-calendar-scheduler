import { hc } from "hono/client";
import type { ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import type { CreateAppointment } from "@server/sharedTypes";

const client = hc<ApiRoutes>("/");

export const api = client.api;

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

export async function appointmentsForFaculty(
    facultyId: number,
    startDate?: Date,
    endDate?: Date,
) {
    const res = await api.appointments.faculty[":id{[0-9]+}"].$get({
        param: {
            id: facultyId.toString(),
        },
        json: {
            startDate: startDate,
            endDate: endDate,
        },
    });

    if (!res.ok) {
        throw new Error("server error");
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

export const appointmentsForFacultyQueryOptions = (facultyId: number) =>
    queryOptions({
        queryKey: ["appointments-for-faculty", facultyId],
        queryFn: () => appointmentsForFaculty(facultyId),
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
