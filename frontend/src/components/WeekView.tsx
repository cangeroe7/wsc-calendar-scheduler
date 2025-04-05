import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatTime } from '@/lib/utils'
import type { Appointment } from '@server/sharedTypes'

interface WeekViewProps {
    facultyId: number; // Needed for filtering
    weekStartDate: Date;
    weekDates: Date[]; // Pass generated dates
    selectedDate: Date;
    appointments: Appointment[] | undefined; // All available appointments for the faculty
    selectedAppointment: Appointment | null;
    onDateSelect: (date: Date) => void;
    onAppointmentSelect: (appointment: Appointment) => void;
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;
    isDateAvailable: (date: Date) => boolean;
}

export function WeekView({
    facultyId,
    weekStartDate,
    weekDates,
    selectedDate,
    appointments,
    selectedAppointment,
    onDateSelect,
    onAppointmentSelect,
    goToPreviousWeek,
    goToNextWeek,
    isDateAvailable,
}: WeekViewProps) {

    // Calculate week appointments and time slots within this component
    const weekAppointments = appointments?.filter(
        (appointment) =>
            appointment.facultyId === facultyId && // Ensure correct faculty
            appointment.status === "available" &&
            weekDates.some((date) => new Date(appointment.startTime).toDateString() === date.toDateString())
    );

    const timeSlots = new Set<string>();
    weekAppointments?.forEach((appointment) => {
        const startTime = formatTime(new Date(appointment.startTime)); // Ensure Date object
        const endTime = formatTime(new Date(appointment.endTime));     // Ensure Date object
        timeSlots.add(`${startTime} - ${endTime}`);
    });

    const sortedTimeSlots = Array.from(timeSlots).sort((a, b) => {
        const timeA = new Date(`01/01/2023 ${a.split(" - ")[0]}`).getTime();
        const timeB = new Date(`01/01/2023 ${b.split(" - ")[0]}`).getTime();
        return timeA - timeB;
    });

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="icon" className="rounded-full" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium">
                    Week of{" "}
                    {weekStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h3>
                <Button variant="outline" size="icon" className="rounded-full" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto"> {/* Add overflow for smaller screens */}
                <div className="grid grid-cols-[100px_repeat(7,minmax(80px,_1fr))] divide-x"> {/* Min width for day cols */}
                    {/* Header Row */}
                    <div className="p-2 font-medium text-center sticky left-0 bg-white z-10">Time</div> {/* Sticky Time column */}
                    {weekDates.map((date, i) => (
                        <div
                            key={i}
                            className={`p-2 text-center text-sm font-medium ${date.toDateString() === selectedDate.toDateString() ? "bg-[#FFC629]/20" : ""
                                } ${isDateAvailable(date) ? "cursor-pointer hover:bg-gray-100" : "text-gray-400"}`}
                            onClick={() => {
                                // Allow clicking date header to select date *if* available
                                // Optional: Could also switch to Day view here if desired
                                if (isDateAvailable(date)) {
                                    onDateSelect(date);
                                }
                            }}
                        >
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                            <div className="text-lg font-bold">{date.getDate()}</div>
                        </div>
                    ))}
                </div>

                {/* Time Slot Rows */}
                {sortedTimeSlots.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border-t col-span-8">No available appointments this week.</div>
                )}
                {sortedTimeSlots.map((timeSlot, index) => (
                    <div key={index} className="grid grid-cols-[100px_repeat(7,minmax(80px,_1fr))] divide-x border-t">
                        <div className="p-2 text-sm text-center sticky left-0 bg-white z-10">{timeSlot}</div> {/* Sticky Time column */}
                        {weekDates.map((date, i) => {
                            const appointment = weekAppointments?.find((apt) => {
                                const aptStartDate = new Date(apt.startTime); // Ensure Date
                                const aptEndDate = new Date(apt.endTime); // Ensure Date
                                const aptTimeSlot = `${formatTime(aptStartDate)} - ${formatTime(aptEndDate)}`;
                                return aptTimeSlot === timeSlot && aptStartDate.toDateString() === date.toDateString();
                            });

                            return (
                                <div
                                    key={i}
                                    className={`p-2 min-h-[60px] flex items-center justify-center ${appointment ? "cursor-pointer hover:bg-[#FFC629]/10" : ""
                                        } ${appointment &&
                                            selectedDate.toDateString() === date.toDateString() &&
                                            selectedAppointment?.id === appointment.id
                                            ? "bg-[#FFC629]/20 border-2 border-[#FFC629]" // More prominent border
                                            : ""
                                        }`}
                                    onClick={() => {
                                        if (appointment) {
                                            onDateSelect(date); // Ensure date is selected too
                                            onAppointmentSelect(appointment);
                                        }
                                    }}
                                >
                                    {appointment && (
                                        <div className="text-xs p-1 bg-blue-100 rounded border border-blue-200 text-center w-full">
                                            Available
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </Card>
    )
}
