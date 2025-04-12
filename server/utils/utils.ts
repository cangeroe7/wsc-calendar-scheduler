import {
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

export function getMonthAvailability(
	date: Date,
	event: AppointmentEvent,
	dailySchedulesList: DailySchedule[],
	overridesList: ScheduleOverride[],
	currentDate: Date = new Date(),
): { availability: Availability; month: Date } {
	console.log("Date", date);
	// Get first and last day of the specified month
	const firstDayOfMonth = new Date(
		date.getFullYear(),
		date.getMonth() - 1,
		1,
	);
	const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 0);

	// Check if event has start and end dates defined
	console.log(event.startDate);
	const eventStartDate = event.startDate
		? new Date(event.startDate)
		: new Date(0); // Earliest possible date if not defined
	const eventEndDate = event.endDate
		? new Date(event.endDate)
		: new Date(8640000000000000); // Latest possible date if not defined
	console.log("eventEndDate: ", eventEndDate);

	const firstDayOfLastMonth = new Date(
		eventEndDate.getFullYear(),
		eventEndDate.getMonth(),
		1,
	);

	// Determine effective start date (latest of event start, current date, first day of month)
	console.log("Event Start: " + eventStartDate);
	console.log("first Day Of Month: " + firstDayOfMonth);
	console.log("last Day Of Month: " + lastDayOfMonth);
	console.log("Current Date: " + currentDate);
	console.log("firstDayOfLastMonth: " + firstDayOfLastMonth);

	const effectiveStartDate = new Date(
		Math.max(
			eventStartDate.getTime(),
			currentDate.getTime(),
			Math.min(firstDayOfMonth.getTime(), firstDayOfLastMonth.getTime()),
		),
	);
	console.log("effectiveStartDate: ", effectiveStartDate);

	// Determine effective end date (earliest of event end, last day of month)
	const effectiveEndDate = new Date(
		Math.min(eventEndDate.getTime(), lastDayOfMonth.getTime()),
	);
	console.log("effective End Date: ", effectiveEndDate);

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
		const dayOfWeek = currentDay.getDay();

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
