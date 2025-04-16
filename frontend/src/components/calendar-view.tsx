import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isToday,
    isAfter,
    isBefore,
} from "date-fns"
import { Button } from "@/components/ui/button"

interface CalendarViewProps {
    currentMonth: Date
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
    startDate?: Date
    endDate?: Date
    availability?: Record<string, Array<{ start: string; end: string }>>
}

export default function CalendarView({
    currentMonth,
    selectedDate,
    onSelectDate,
    startDate,
    endDate,
    availability = {},
}: CalendarViewProps) {
    const renderHeader = () => {
        const dateFormat = "EEEEEE"
        const days = []
        const startDate = startOfWeek(startOfMonth(currentMonth))

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-xs font-medium text-gray-500 uppercase">
                    {format(addDays(startDate, i), dateFormat)}
                </div>,
            )
        }

        return <div className="grid grid-cols-7 mb-2">{days}</div>
    }

    const renderDays = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDateOfCalendar = startOfWeek(monthStart)
        const endDateOfCalendar = endOfWeek(monthEnd)

        const rows = []
        let days = []
        let day = startDateOfCalendar
        let formattedDate = ""

        while (day <= endDateOfCalendar) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d")
                const cloneDay = day
                const isCurrentMonth = isSameMonth(day, monthStart)
                const dateString = format(day, "yyyy-MM-dd")
                const hasAvailability = availability[dateString] && availability[dateString].length > 0

                // Check if date is within allowed range
                const isBeforeStartDate = startDate ? isBefore(day, startDate) : false
                const isAfterEndDate = endDate ? isAfter(day, endDate) : false

                // Always disable dates that are not in the current month
                const isDisabled = !isCurrentMonth || isBeforeStartDate || isAfterEndDate || !hasAvailability

                days.push(
                    <div key={day.toString()} className={`relative p-1 text-center`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-10 w-10 p-0 rounded-full 
                ${isDisabled ? "opacity-50 cursor-not-allowed" : "bg-primary/40"}
                ${selectedDate && day.toISOString().slice(0,10) === selectedDate.toISOString().slice(0,10) ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "cursor-pointer"} 
                ${!isCurrentMonth ? "opacity-0 pointer-events-none" : ""}`}
                            onClick={() => !isDisabled && onSelectDate(cloneDay)}
                            disabled={isDisabled}
                        >
                            {isCurrentMonth ? formattedDate : ""}
                            </Button>
                        {/* Only show dot for today */}
                        {isCurrentMonth && isToday(day) && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 ">
                                <div className="w-1 h-1  bg-black rounded-full" />
                            </div>
                        )}
                    </div>,
                )
                day = addDays(day, 1)
            }

            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-1">
                    {days}
                </div>,
            )
            days = []
        }

        return <div className="space-y-1">{rows}</div>
    }

    return (
        <div>
            {renderHeader()}
            {renderDays()}
        </div>
    )
}
