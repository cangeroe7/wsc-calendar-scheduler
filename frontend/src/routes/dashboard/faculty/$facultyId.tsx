import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { DashboardHeader } from '@/components/DashboardHeader'
import { FacultyDetail } from '@/components/FacultyDetails'
import { AppointmentDetails } from '@/components/AppointmentDetails'
import { DateSelector } from '@/components/DateSelector'
import { BookingDialog } from '@/components/BookingDialog'

import { formatDate, formatTime } from '@/lib/utils'

import { appointmentsForFaculty, getFacultyByIdQueryOptions, getFacultyAppointmentsQueryOptions } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import type { Appointment, SelectFacultyAppointments } from '@server/sharedTypes'

import { useState, useEffect } from "react"
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    CalendarRange,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AppointmentSlots } from '@/components/AppointmentSlots'

import { queryClient } from '@/lib/api';
import NotFound from '@/components/NotFound'

const facultyLoader = async ({
    params,
}: {
    params: { facultyId: string };
}) => {
    const { facultyId } = params;
    try {
        const data = await queryClient.fetchQuery(getFacultyByIdQueryOptions(facultyId));
        if (!data || !data.facultyMember) {
            // Also throw a Response with status 404 here
            throw notFound()
        }
        return data.facultyMember;
    } catch (error) {
        // Re-throw if it's already a Response
        throw notFound()
    }
};


export const Route = createFileRoute('/dashboard/faculty/$facultyId')({
    loader: facultyLoader,
    component: SchedulePage,
    notFoundComponent: () => <NotFound />,
})

// Main Schedule Component
function SchedulePage() {

    const facultyMember = Route.useLoaderData();
    const navigate = useNavigate();

    const value: SelectFacultyAppointments = {startTime: undefined, endTime: undefined, status: undefined}
    const { data: appointments } = useQuery(getFacultyAppointmentsQueryOptions(facultyMember.id.toString(), {value}));

    // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [showBookingDialog, setShowBookingDialog] = useState(false)
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
    const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())
    const [availableDates, setAvailableDates] = useState<Date[]>([])

    

    // Set the week start date to the Sunday of the current week
    useEffect(() => {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() - date.getDay()) // Set to Sunday
        setWeekStartDate(date)
    }, [selectedDate])

    // Generate dates for the week view
    const generateWeekDates = (startDate: Date) => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)
            return date
        })
    }

    const weekDates = generateWeekDates(weekStartDate)

    // Navigate between weeks
    const goToPreviousWeek = () => {
        const newStartDate = new Date(weekStartDate)
        newStartDate.setDate(weekStartDate.getDate() - 7)
        setWeekStartDate(newStartDate)
    }

    const goToNextWeek = () => {
        const newStartDate = new Date(weekStartDate)
        newStartDate.setDate(weekStartDate.getDate() + 7)
        setWeekStartDate(newStartDate)
    }

    // Check if a date has available appointments
    const isDateAvailable = (date: Date): boolean => {
        return availableDates.some((availableDate) => availableDate.toDateString() === date.toDateString())
    }

    // Get appointments for the selected date and faculty
    //    const getAppointmentsForDate = (date: Date): Appointment[] => {
    //        if (facultyData) return []
    //
    //        return appointments?.appointments
    //            .filter(
    //                (appointment) =>
    //                    appointment.facultyId === fac.id &&
    //                    appointment.status === "available" &&
    //                    appointment.startTime.toDateString() === date.toDateString(),
    //            )
    //            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    //    }
    //
    //    const dateAppointments = getAppointmentsForDate(selectedDate)

    // Event handlers
    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setSelectedAppointment(null)
    }

    const handleAppointmentSelect = (appointment: Appointment) => {
        setSelectedAppointment(appointment)
    }

    const handleBookAppointment = () => {
        if (selectedAppointment) {
            setShowBookingDialog(true)
        }
    }

    const confirmBooking = () => {
        // Booking logic here (in a real app, this would make an API call)
        setShowBookingDialog(false)
    }

    // Generate month calendar dates
    const generateMonthDates = () => {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        const startOffset = firstDay.getDay()
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

        // Add empty slots to complete the grid (if needed)
        const totalSlots = Math.ceil(calendarDays.length / 7) * 7
        for (let i = calendarDays.length; i < totalSlots; i++) {
            calendarDays.push(null)
        }

        return calendarDays
    }

    const monthDates = generateMonthDates()

    // If faculty not loaded yet, show loading
    //    if (!selectedFaculty) {
    //        return (
    //            <div className="min-h-screen bg-[#D8E6E4] flex items-center justify-center">
    //                <div className="text-center">
    //                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC629] mx-auto"></div>
    //                    <p className="mt-4 text-lg">Loading faculty information...</p>
    //                </div>
    //            </div>
    //        )
    //    }

    // Component structure
    return (
        <div className="min-h-screen bg-[#D8E6E4]">
            {/* Header */}
            <DashboardHeader name={"John Doe"} />

            {/* Main content */}
            <main className="container mx-auto p-4">
                {/* Scheduling Interface */}
                <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    {/* Sidebar with faculty details and appointment info */}
                    <div>
                        <FacultyDetail faculty={facultyMember} onChangeFaculty={() => navigate({ to: "/dashboard" })} />
                        <AppointmentDetails selectedAppointment={selectedAppointment} />
                    </div>

                    {/* Calendar and appointment slots */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Schedule</h2>
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-md ${viewMode === "day" ? "bg-white shadow-sm" : ""}`}
                                    onClick={() => setViewMode("day")}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Day
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-md ${viewMode === "week" ? "bg-white shadow-sm" : ""}`}
                                    onClick={() => setViewMode("week")}
                                >
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    Week
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-md ${viewMode === "month" ? "bg-white shadow-sm" : ""}`}
                                    onClick={() => setViewMode("month")}
                                >
                                    <CalendarRange className="h-4 w-4 mr-2" />
                                    Month
                                </Button>
                            </div>
                        </div>

                        {viewMode === "day" && (
                            <>
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <Button variant="outline" size="icon" className="rounded-full" onClick={goToPreviousWeek}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <h3 className="text-lg font-medium">Select Date</h3>
                                        <Button variant="outline" size="icon" className="rounded-full" onClick={goToNextWeek}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <DateSelector
                                        weekDates={weekDates}
                                        selectedDate={selectedDate}
                                        onDateSelect={handleDateSelect}
                                        isDateAvailable={isDateAvailable}
                                    />
                                </Card>

                                <Card className="p-6">
                                    <h2 className="mb-4 text-xl font-bold">Available Appointments for {formatDate(selectedDate)}</h2>
                                    {appointments ? appointments.appointments.length > 0 && (
                                        <AppointmentSlots
                                            appointments={appointments!.appointments}
                                            selectedAppointment={selectedAppointment}
                                            onAppointmentSelect={handleAppointmentSelect}
                                        />
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">No available appointments for this date</div>
                                    )}
                                </Card>
                            </>
                        )}

                        {viewMode === "week" && (
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

                                <div className="border rounded-lg">
                                    <div className="grid grid-cols-[100px_1fr] divide-x">
                                        <div className="p-2 font-medium text-center">Time</div>
                                        <div className="grid grid-cols-7 divide-x">
                                            {weekDates.map((date, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-2 text-center text-sm font-medium ${date.toDateString() === selectedDate.toDateString() ? "bg-[#FFC629]/20" : ""
                                                        } ${isDateAvailable(date) ? "cursor-pointer" : "text-gray-400"}`}
                                                    onClick={() => isDateAvailable(date) && handleDateSelect(date)}
                                                >
                                                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                                                    <div className="text-lg font-bold">{date.getDate()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generate time slots for the week view */}
                                    {(() => {
                                        // Get all appointments for the selected faculty for this week
                                        const weekAppointments = appointments?.appointments.filter(
                                            (appointment) =>
                                                appointment.facultyId === facultyMember.id &&
                                                appointment.status === "available" &&
                                                weekDates.some((date) => appointment.startTime.toDateString() === date.toDateString()),
                                        )

                                        // Get all unique time slots from the week's appointments
                                        const timeSlots = new Set<string>()
                                        weekAppointments?.forEach((appointment) => {
                                            const startTime = formatTime(appointment.startTime)
                                            const endTime = formatTime(appointment.endTime)
                                            timeSlots.add(`${startTime} - ${endTime}`)
                                        })

                                        // Sort time slots
                                        const sortedTimeSlots = Array.from(timeSlots).sort((a, b) => {
                                            const timeA = new Date(`01/01/2023 ${a.split(" - ")[0]}`).getTime()
                                            const timeB = new Date(`01/01/2023 ${b.split(" - ")[0]}`).getTime()
                                            return timeA - timeB
                                        })

                                        return sortedTimeSlots.map((timeSlot, index) => (
                                            <div key={index} className="grid grid-cols-[100px_1fr] divide-x border-t">
                                                <div className="p-2 text-sm text-center">{timeSlot}</div>
                                                <div className="grid grid-cols-7 divide-x">
                                                    {weekDates.map((date, i) => {
                                                        // Find appointment for this date and time slot
                                                        const appointment = weekAppointments?.find((apt) => {
                                                            const aptTimeSlot = `${formatTime(apt.startTime)} - ${formatTime(apt.endTime)}`
                                                            return aptTimeSlot === timeSlot && apt.startTime.toDateString() === date.toDateString()
                                                        })

                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`p-2 min-h-[60px] ${appointment ? "cursor-pointer hover:bg-[#FFC629]/10" : ""
                                                                    } ${appointment &&
                                                                        selectedDate.toDateString() === date.toDateString() &&
                                                                        selectedAppointment?.id === appointment.id
                                                                        ? "bg-[#FFC629]/20 border border-[#FFC629]"
                                                                        : ""
                                                                    }`}
                                                                onClick={() => {
                                                                    if (appointment) {
                                                                        handleDateSelect(date)
                                                                        handleAppointmentSelect(appointment)
                                                                    }
                                                                }}
                                                            >
                                                                {appointment && (
                                                                    <div className="text-xs p-1 bg-blue-100 rounded border border-blue-200 text-center">
                                                                        Available
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    })()}
                                </div>
                            </Card>
                        )}

                        {viewMode === "month" && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={() => {
                                            const newDate = new Date(selectedDate)
                                            newDate.setMonth(newDate.getMonth() - 1)
                                            setSelectedDate(newDate)
                                        }}
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
                                        onClick={() => {
                                            const newDate = new Date(selectedDate)
                                            newDate.setMonth(newDate.getMonth() + 1)
                                            setSelectedDate(newDate)
                                        }}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                                        <div key={i} className="text-center font-medium">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {monthDates.map((date, i) => {
                                        if (!date) {
                                            return <div key={i} className="h-16"></div>
                                        }

                                        const isAvailable = isDateAvailable(date)

                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                className={`h-16 w-full p-2 flex flex-col items-start justify-start ${!isAvailable ? "opacity-40" : ""
                                                    } ${date.toDateString() === selectedDate.toDateString() ? "bg-[#FFC629]/20 border-[#FFC629]" : ""
                                                    }`}
                                                disabled={!isAvailable}
                                                onClick={() => {
                                                    if (isAvailable) handleDateSelect(date)
                                                }}
                                            >
                                                <span
                                                    className={`text-sm font-medium ${date.toDateString() === new Date().toDateString()
                                                        ? "h-6 w-6 bg-[#FFC629] text-black rounded-full flex items-center justify-center"
                                                        : ""
                                                        }`}
                                                >
                                                    {date.getDate()}
                                                </span>
                                                {isAvailable && (
                                                    <div className="mt-1 w-full">
                                                        <div className="text-xs p-1 bg-blue-100 rounded border border-blue-200 truncate text-center">
                                                            Available
                                                        </div>
                                                    </div>
                                                )}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </Card>
                        )}

                        <Button
                            className="h-14 w-full bg-[#FFC629] text-lg font-semibold text-black hover:bg-[#FFC629]/90 disabled:bg-gray-200"
                            disabled={!selectedAppointment}
                            onClick={handleBookAppointment}
                        >
                            Book Appointment
                        </Button>
                    </div>
                </div>
            </main>

            {/* Booking confirmation dialog */}
            <BookingDialog
                isOpen={showBookingDialog}
                onClose={() => setShowBookingDialog(false)}
                faculty={facultyMember}
                appointment={selectedAppointment}
                onConfirm={confirmBooking}
            />
        </div>
    )
}


