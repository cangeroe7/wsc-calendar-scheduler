import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Appointment } from '@server/sharedTypes'; // Import Appointment if needed for availability logic
import { formatDate } from "@/lib/utils";

interface MonthViewProps {
    selectedDate: Date;
    appointments: Appointment[] | undefined; // Pass all available appointments
    facultyId: number; // Needed if filtering within
    onDateSelect: (date: Date) => void;
    setSelectedDate: (date: Date) => void; // For month navigation
    // Removed isDateAvailable prop, calculate internally
}

export function MonthView({
    selectedDate,
    appointments,
    facultyId,
    onDateSelect,
    setSelectedDate,
}: MonthViewProps) {

    // --- Logic moved from SchedulePage ---
    const generateMonthDates = () => {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        const startOffset = firstDay.getDay() // 0 for Sunday, 1 for Monday, etc.
        const daysInMonth = lastDay.getDate()

        const calendarDays: (Date | null)[] = []

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < startOffset; i++) {
            calendarDays.push(null)
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(new Date(year, month, i))
        }

        // Add empty slots to complete the grid (up to 6 rows, 42 slots)
        // const totalSlots = Math.ceil(calendarDays.length / 7) * 7; // Original: might not fill 6 rows
        const totalSlots = 42; // Ensure 6 rows for consistent height
        for (let i = calendarDays.length; i < totalSlots; i++) {
            calendarDays.push(null)
        }

        return calendarDays
    }

    const monthDates = generateMonthDates();

    // Calculate available dates for the current month view
    const availableDatesInMonth = new Set<string>();
    appointments?.forEach(app => {
        if (app.facultyId === facultyId && app.status === 'available') {
            const appDate = new Date(app.startTime);
            // Check if the appointment is within the currently viewed month
            if (appDate.getFullYear() === selectedDate.getFullYear() &&
                appDate.getMonth() === selectedDate.getMonth()) {
                availableDatesInMonth.add(appDate.toDateString());
            }
        }
    });

    const isDateAvailable = (date: Date): boolean => {
        return availableDatesInMonth.has(date.toDateString());
    }
    // --- End of moved logic ---


    const goToPreviousMonth = () => {
        const newDate = new Date(selectedDate)
        newDate.setMonth(newDate.getMonth() - 1)
        setSelectedDate(newDate)
    }

    const goToNextMonth = () => {
        const newDate = new Date(selectedDate)
        newDate.setMonth(newDate.getMonth() + 1)
        setSelectedDate(newDate)
    }


    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={goToPreviousMonth}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium">
                    {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={goToNextMonth}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4"> {/* Reduced gap slightly */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                    <div key={i} className="text-center font-medium text-sm text-gray-600"> {/* Smaller text */}
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2"> {/* Reduced gap slightly */}
                {monthDates.map((date, i) => {
                    if (!date) {
                        // Render an empty div with border for grid structure
                        return <div key={i} className="h-16 sm:h-20 border border-transparent"></div>
                    }

                    const isAvailable = isDateAvailable(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();


                    return (
                        <Button
                            key={i}
                            variant="outline"
                            className={`h-16 sm:h-20 w-full p-1 sm:p-2 flex flex-col items-center sm:items-start justify-start text-left relative transition-colors duration-150
                                ${!isAvailable ? "text-gray-400 bg-gray-50 cursor-not-allowed" : "hover:bg-gray-100"}
                                ${isSelected ? "bg-[#FFC629]/20 border-2 border-[#FFC629]" : "border-gray-200"}
                                ${isToday && !isSelected ? "border-blue-300" : ""}
                             `}
                            disabled={!isAvailable}
                            onClick={() => {
                                if (isAvailable) {
                                    onDateSelect(date);
                                    // Optional: Switch to day view automatically?
                                    // onViewModeChange('day');
                                }
                            }}
                            title={isAvailable ? `View appointments for ${formatDate(date)}` : ""} // Tooltip
                        >
                            <span
                                className={`text-xs sm:text-sm font-medium mb-1
                                   ${isToday ? "h-5 w-5 sm:h-6 sm:w-6 bg-[#FFC629] text-black rounded-full flex items-center justify-center" : ""}
                                   ${isSelected && isToday ? "bg-transparent text-black" : ""} /* Adjust if selected and today */
                                `}
                            >
                                {date.getDate()}
                            </span>
                            {isAvailable && (
                                <div className="mt-auto w-full self-center pb-1"> {/* Center availability text */}
                                    <div className="text-[10px] sm:text-xs p-0.5 sm:p-1 bg-blue-100 rounded border border-blue-200 truncate text-center text-blue-800">
                                        Available
                                    </div>
                                </div>
                            )}
                        </Button>
                    )
                })}
            </div>
        </Card>
    )
}
