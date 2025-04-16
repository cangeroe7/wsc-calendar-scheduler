import {
	Appointment,
	AppointmentEvent,
	DailySchedule,
	ScheduleOverride,
} from "../sharedTypes";

interface TimeSlot {
	start: string;
	end: string;
}

type Availability = {
	[dateKey: string]: TimeSlot[];
};

export function getDayAvailability(
	targetDate: Date,
	event: AppointmentEvent,
	dailySchedulesList: DailySchedule[],
	overridesList: ScheduleOverride[],
	appointments: Appointment[],
) {
	// Prepare the result array for available time slots
	const availableSlots: { start: string; end: string }[] = [];

	// First, determine which schedules to use (overrides or daily)
	const applicableOverrides = overridesList.filter(
		(override) =>
			// Only consider overrides that are not null and match the target date
			override.startTime !== null &&
			override.endTime !== null &&
			!override.blocked &&
			override.date === targetDate.toISOString().slice(0, 10),
	);

	// Handle case where the day is entirely blocked by an override
	const blockedOverride = overridesList.find(
		(override) =>
			override.blocked &&
			override.date === targetDate.toISOString().slice(0, 10),
	);

	if (blockedOverride) {
		// Day is blocked, return empty availability
		return availableSlots;
	}

	// Initialize available time ranges
	let availableRanges: { start: number; end: number }[] = [];

	// Use overrides if available, otherwise use daily schedules
	if (applicableOverrides.length > 0) {
		// Use overrides for this specific date
		availableRanges = applicableOverrides
			.filter(
				(override) =>
					override.startTime !== null && override.endTime !== null,
			)
			.map((override) => ({
				start: timeToMinutes(override.startTime!),
				end: timeToMinutes(override.endTime!),
			}));
	} else {
		// Use daily schedules for this day of the week
		availableRanges = dailySchedulesList.map((schedule) => ({
			start: timeToMinutes(schedule.startTime),
			end: timeToMinutes(schedule.endTime),
		}));
	}

	// Convert appointments to time ranges (in minutes)
	const bookedRanges = appointments
		.filter((appt) => {
			// Only consider appointments on the target date
			const apptDate = new Date(appt.startTime);
			return (
				apptDate.toISOString().slice(0, 10) ===
				targetDate.toISOString().slice(0, 10)
			);
		})
		.map((appt) => ({
			start: timeToMinutes(appt.startTime),
			end: timeToMinutes(appt.endTime),
		}));

	// For each available range, subtract booked appointments
	for (const range of availableRanges) {
		let currentRanges = [range];

		// Remove each booked appointment from the available ranges
		for (const booked of bookedRanges) {
			const newRanges: { start: number; end: number }[] = [];

			for (const current of currentRanges) {
				// If booked time doesn't overlap with this range, keep the range as is
				if (
					booked.end <= current.start ||
					booked.start >= current.end
				) {
					newRanges.push(current);
					continue;
				}

				// If booked time starts after the current range start, keep the beginning portion
				if (booked.start > current.start) {
					newRanges.push({
						start: current.start,
						end: booked.start,
					});
				}

				// If booked time ends before the current range end, keep the end portion
				if (booked.end < current.end) {
					newRanges.push({
						start: booked.end,
						end: current.end,
					});
				}
			}

			currentRanges = newRanges;
		}

		// Break the available ranges into appointment slots based on duration and booking interval
		for (const availRange of currentRanges) {
			// Only consider ranges that can fit at least one appointment
			if (availRange.end - availRange.start >= event.durationMinutes) {
				// Create bookable slots at each interval
				let slotStart = availRange.start;

				while (slotStart + event.durationMinutes <= availRange.end) {
					availableSlots.push({
						start: minutesToTime(slotStart),
						end: minutesToTime(slotStart + event.durationMinutes),
					});

					// Move to next slot based on booking interval
					slotStart += event.bookingInterval;
				}
			}
		}
	}

	return availableSlots;
}

// Helper functions
function timeToMinutes(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

function minutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function getMonthAvailability(
	date: Date,
	event: AppointmentEvent,
	dailySchedulesList: DailySchedule[],
	overridesList: ScheduleOverride[],
	appointments: Appointment[],
	currentDate: Date = new Date(),
): { availability: Availability; month: Date } {
	// Get first and last day of the specified month
	const firstDayOfMonth = new Date(
		date.getFullYear(),
		date.getMonth() - 1,
		1,
	);
	const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 0);

	// Check if event has start and end dates defined
	const eventStartDate = event.startDate
		? new Date(event.startDate)
		: new Date(0); // Earliest possible date if not defined
	const eventEndDate = event.endDate
		? new Date(event.endDate)
		: new Date(8640000000000000); // Latest possible date if not defined

    console.log({eventStartDate})

	const firstDayOfLastMonth = new Date(
		eventEndDate.getFullYear(),
		eventEndDate.getMonth(),
		1,
	);

	// Determine effective start date (latest of event start, current date, first day of month)
	const effectiveStartDate = new Date(
		Math.max(
			eventStartDate.getTime(),
			currentDate.getTime(),
			Math.min(firstDayOfMonth.getTime(), firstDayOfLastMonth.getTime()),
		),
	);

	// Determine effective end date (earliest of event end, last day of month)
	const effectiveEndDate = new Date(
		Math.min(eventEndDate.getTime(), lastDayOfMonth.getTime()),
	);

	// Initialize result object
	const availability: Availability = {};

	// Function to format time in HH:MM format
	const formatTime = (date: Date): string => {
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	// Group daily schedules by day of week (0-6, where 0 is Sunday)
	const schedulesByDay: Record<number, TimeSlot[]> = {};
	dailySchedulesList.forEach((schedule) => {
		const dayOfWeek = schedule.dayOfWeek;

		if (!schedulesByDay[dayOfWeek]) {
			schedulesByDay[dayOfWeek] = [];
		}

		const startDate = new Date(schedule.startTime);
		const endDate = new Date(schedule.endTime);

		schedulesByDay[dayOfWeek].push({
			start: formatTime(startDate),
			end: formatTime(endDate),
		});
	});

	// Create a map of override dates
	const overrideMap: Record<string, TimeSlot[] | null> = {};
	overridesList.forEach((override) => {
		const dateObj = new Date(override.date);
		const dateKey = dateObj.toISOString().split("T")[0];

		// If the date is blocked, set an empty array
		if (override.blocked) {
			overrideMap[dateKey] = [];
			return;
		}

		// If startTime or endTime is missing, skip this override
		if (!override.startTime || !override.endTime) {
			return;
		}

		if (!overrideMap[dateKey]) {
			overrideMap[dateKey] = [];
		}

		const startDate = new Date(override.startTime);
		const endDate = new Date(override.endTime);

		(overrideMap[dateKey] as TimeSlot[]).push({
			start: formatTime(startDate),
			end: formatTime(endDate),
		});
	});

	// Iterate through each day in the effective date range
	let currentDay = new Date(effectiveStartDate);
	while (currentDay <= effectiveEndDate) {
		const dateKey = currentDay.toISOString().split("T")[0];
		const dayOfWeek = currentDay.getUTCDay();
        console.log({dayOfWeek, dateKey})

		// Check if this date has an override
		if (dateKey in overrideMap) {
			availability[dateKey] = overrideMap[dateKey] || [];
		}
		// Otherwise use the default schedule for this day of week
		else if (schedulesByDay[dayOfWeek]) {
			availability[dateKey] = [...schedulesByDay[dayOfWeek]];
		}
		// If no schedule exists for this day, mark it as empty
		else {
			availability[dateKey] = [];
		}

		// Move to the next day
		currentDay.setDate(currentDay.getDate() + 1);
	}

    console.log({availability})
	const month = effectiveStartDate;
	return { availability, month };
}

// Types for the result object with discriminated union
type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
	promise: Promise<T>,
): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		return { data: null, error: error as E };
	}
}
