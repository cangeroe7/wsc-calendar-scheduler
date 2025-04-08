import { appointments } from "./appointments";
import { faculty } from "./faculty";
import { createSchemaFactory } from "drizzle-zod";
import { CustomErrorParams } from "zod";
import { db } from "..";
import { and, or, eq, gte, lte } from "drizzle-orm";

const { createInsertSchema, createSelectSchema } = createSchemaFactory({
    coerce: true,
});

const baseAppointmentInsertSchema = createInsertSchema(appointments);

const startTimeValidation = {
    check: ({ startTime }: { startTime: Date }) => startTime >= new Date(),
    error: {
        message: "Start time cannot be in the past",
        path: ["startTime"],
    } satisfies CustomErrorParams,
};

const endAfterStartValidation = {
    check: ({ startTime, endTime }: { startTime: Date; endTime: Date }) => {
        return endTime >= startTime;
    },
    error: {
        message: "End time must be later than start time",
        path: ["endTime"],
    } satisfies CustomErrorParams,
};

const facultyExistsValidation = {
    check: async ({ facultyId }: { facultyId: number }) => {
        const facultyMember = await db.query.faculty.findFirst({
            where: eq(faculty.id, facultyId),
        });

        return !!facultyMember;
    },
    error: {
        message: "The specified faculty member does not exist in the system.",
        path: ["facultyId"],
    },
};

const noOverlappingAppointmentsValidation = {
    check: async ({
        startTime,
        endTime,
        facultyId,
    }: {
        startTime: Date;
        endTime: Date;
        facultyId: number;
    }) => {
        const overlappingAppointments = await db.query.appointments.findMany({
            where: and(
                eq(appointments.facultyId, facultyId),
                or(
                    // New appointment starts during an existing one
                    and(
                        gte(appointments.startTime, startTime),
                        lte(appointments.endTime, startTime),
                    ),
                    // New appointment ends during an existing one
                    and(
                        gte(appointments.startTime, endTime),
                        lte(appointments.endTime, endTime),
                    ),
                    // New appointment completely encompasses an existing one
                    and(
                        lte(appointments.startTime, startTime),
                        gte(appointments.endTime, endTime),
                    ),
                ),
            ),
        });

        return overlappingAppointments.length === 0;
    },
    error: {
        message: "There is already an appointment scheduled during this time",
        path: ["startTime", "endTime"],
    } satisfies CustomErrorParams,
};

export const insertAppointmentSchema = baseAppointmentInsertSchema
    .refine(facultyExistsValidation.check, facultyExistsValidation.error)
    .refine(
        noOverlappingAppointmentsValidation.check,
        noOverlappingAppointmentsValidation.error,
    )
    .refine(startTimeValidation.check, startTimeValidation.error)
    .refine(endAfterStartValidation.check, endAfterStartValidation.error);

export const createAppointmentSchema = baseAppointmentInsertSchema
    .pick({
        facultyId: true,
        startTime: true,
        endTime: true,
    })
    .refine(facultyExistsValidation.check, facultyExistsValidation.error)
    .refine(
        noOverlappingAppointmentsValidation.check,
        noOverlappingAppointmentsValidation.error,
    )
    .refine(startTimeValidation.check, startTimeValidation.error)
    .refine(endAfterStartValidation.check, endAfterStartValidation.error);

export const selectAppointmentsSchema = createSelectSchema(appointments);

export const selectFacultyAppointments = createSelectSchema(appointments)
    .pick({
        startTime: true,
        endTime: true,
    })
    .partial({
        startTime: true,
        endTime: true,
    });
