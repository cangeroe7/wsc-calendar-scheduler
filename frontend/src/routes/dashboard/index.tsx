import { useState, useEffect } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import {
    Calendar,
    Clock,
    LogOut,
    User,
    ChevronDown,
    Check,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    CalendarRange,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/dashboard/')({
    component: Dashboard
})

// Mock data for teachers
const teachers = [
    {
        id: 1,
        name: "Dr. Smith",
        subject: "Mathematics",
        availability: {
            monday: [
                { startTime: "09:00 AM", endTime: "10:00 AM", available: true },
                { startTime: "11:00 AM", endTime: "12:00 PM", available: true },
                { startTime: "02:00 PM", endTime: "03:00 PM", available: true },
            ],
            tuesday: [
                { startTime: "10:00 AM", endTime: "11:00 AM", available: true },
                { startTime: "01:00 PM", endTime: "02:00 PM", available: true },
            ],
            wednesday: [
                { startTime: "09:00 AM", endTime: "10:00 AM", available: true },
                { startTime: "02:00 PM", endTime: "03:00 PM", available: true },
                { startTime: "03:00 PM", endTime: "04:00 PM", available: true },
            ],
            thursday: [
                { startTime: "11:00 AM", endTime: "12:00 PM", available: true },
                { startTime: "01:00 PM", endTime: "02:00 PM", available: true },
            ],
            friday: [
                { startTime: "09:00 AM", endTime: "10:00 AM", available: true },
                { startTime: "10:00 AM", endTime: "11:00 AM", available: true },
            ],
            saturday: [],
            sunday: [],
        },
    },
    {
        id: 2,
        name: "Prof. Johnson",
        subject: "Science",
        availability: {
            monday: [
                { startTime: "10:00 AM", endTime: "11:00 AM", available: true },
                { startTime: "01:00 PM", endTime: "02:00 PM", available: true },
            ],
            tuesday: [
                { startTime: "09:00 AM", endTime: "10:00 AM", available: true },
                { startTime: "11:00 AM", endTime: "12:00 PM", available: true },
            ],
            wednesday: [],
            thursday: [
                { startTime: "09:00 AM", endTime: "10:00 AM", available: true },
                { startTime: "02:00 PM", endTime: "03:00 PM", available: true },
            ],
            friday: [
                { startTime: "11:00 AM", endTime: "12:00 PM", available: true },
                { startTime: "03:00 PM", endTime: "04:00 PM", available: true },
            ],
            saturday: [],
            sunday: [],
        },
    },
    {
        id: 3,
        name: "Ms. Williams",
        subject: "English",
        availability: {
            monday: [{ startTime: "09:00 AM", endTime: "10:00 AM", available: true }],
            tuesday: [{ startTime: "10:00 AM", endTime: "11:00 AM", available: true }],
            wednesday: [{ startTime: "11:00 AM", endTime: "12:00 PM", available: true }],
            thursday: [{ startTime: "01:00 PM", endTime: "02:00 PM", available: true }],
            friday: [{ startTime: "02:00 PM", endTime: "03:00 PM", available: true }],
            saturday: [],
            sunday: [],
        },
    },
    {
        id: 4,
        name: "Mr. Brown",
        subject: "History",
        availability: {
            monday: [],
            tuesday: [
                { startTime: "09:00 AM", endTime: "10:00 AM", available: true },
                { startTime: "10:00 AM", endTime: "11:00 AM", available: true },
                { startTime: "11:00 AM", endTime: "12:00 PM", available: true },
            ],
            wednesday: [
                { startTime: "01:00 PM", endTime: "02:00 PM", available: true },
                { startTime: "02:00 PM", endTime: "03:00 PM", available: true },
            ],
            thursday: [],
            friday: [
                { startTime: "09:00 AM", endTime: "10:00 AM", available: true },
                { startTime: "03:00 PM", endTime: "04:00 PM", available: true },
            ],
            saturday: [],
            sunday: [],
        },
    },
]

function Dashboard() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedTeacher, setSelectedTeacher] = useState<(typeof teachers)[0] | null>(null)
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
    const [showBookingDialog, setShowBookingDialog] = useState(false)
    const [bookingConfirmed, setBookingConfirmed] = useState(false)
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
    const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())

    // Set the week start date to the Sunday of the current week
    useEffect(() => {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() - date.getDay()) // Set to Sunday
        setWeekStartDate(date)
    }, [selectedDate])

    // Update available dates when teacher changes
    useEffect(() => {
        if (selectedTeacher) {
            const dates: Date[] = []
            const today = new Date()

            // Generate dates for the next 30 days
            for (let i = 0; i < 30; i++) {
                const date = new Date()
                date.setDate(today.getDate() + i)

                // Check if this day of week has any available slots
                const dayOfWeek = date.getDay()
                const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayOfWeek]

                if (selectedTeacher.availability[dayName as keyof typeof selectedTeacher.availability].length > 0) {
                    dates.push(new Date(date))
                }
            }
        }
    }, [selectedTeacher])

    // Generate dates for the next 7 days
    const generateWeekDates = (startDate: Date) => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)
            return date
        })
    }

    const weekDates = generateWeekDates(weekStartDate)

    // Navigate to previous week
    const goToPreviousWeek = () => {
        const newStartDate = new Date(weekStartDate)
        newStartDate.setDate(weekStartDate.getDate() - 7)
        setWeekStartDate(newStartDate)
    }

    // Navigate to next week
    const goToNextWeek = () => {
        const newStartDate = new Date(weekStartDate)
        newStartDate.setDate(weekStartDate.getDate() + 7)
        setWeekStartDate(newStartDate)
    }

    // Format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    // Check if a date is available (has time slots)
    const isDateAvailable = (date: Date) => {
        if (!selectedTeacher) return false

        const dayOfWeek = date.getDay()
        const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayOfWeek]

        return selectedTeacher.availability[dayName as keyof typeof selectedTeacher.availability].length > 0
    }

    // Get time slots for the selected date
    const getTimeSlots = (date: Date) => {
        if (!selectedTeacher) return []

        const dayOfWeek = date.getDay()
        const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayOfWeek]

        return selectedTeacher.availability[dayName as keyof typeof selectedTeacher.availability]
    }

    const timeSlots = getTimeSlots(selectedDate)

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setSelectedTimeSlot(null)
    }

    const handleTimeSlotSelect = (timeSlot: string) => {
        setSelectedTimeSlot(timeSlot)
    }

    const handleBookAppointment = () => {
        if (selectedTeacher && selectedTimeSlot) {
            setShowBookingDialog(true)
        }
    }

    const confirmBooking = () => {
        setBookingConfirmed(true)
        setTimeout(() => {
            setShowBookingDialog(false)
            setBookingConfirmed(false)
            setSelectedTimeSlot(null)
        }, 2000)
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

    return (
        <div className="min-h-screen bg-[#D8E6E4]">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-[#FFC629]" />
                            <h1 className="text-2xl font-bold">Calendar App</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC629]">
                                    <User className="h-5 w-5 text-black" />
                                </div>
                                <span>John Doe</span>
                            </div>
                            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200" asChild>
                                <Link to="/">
                                    <LogOut className="h-5 w-5 text-gray-600" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto p-4">
                <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    {/* Sidebar */}
                    <Card className="p-6">
                        <h2 className="mb-4 text-xl font-bold">Select Teacher</h2>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between border-2 py-6 text-lg">
                                    {selectedTeacher ? selectedTeacher.name : "Choose a teacher"}
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[240px]">
                                {teachers.map((teacher) => (
                                    <DropdownMenuItem
                                        key={teacher.id}
                                        className="py-3 text-base"
                                        onClick={() => setSelectedTeacher(teacher)}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div>
                                                <div>{teacher.name}</div>
                                                <div className="text-sm text-gray-500">{teacher.subject}</div>
                                            </div>
                                            {selectedTeacher?.id === teacher.id && <Check className="h-4 w-4" />}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {selectedTeacher && (
                            <div className="mt-6">
                                <h3 className="mb-2 text-lg font-medium">Selected Teacher:</h3>
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFC629]">
                                            <User className="h-6 w-6 text-black" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{selectedTeacher.name}</div>
                                            <div className="text-sm text-gray-500">{selectedTeacher.subject}</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </Card>

                    {/* Calendar and time slots */}
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
                                    <div className="grid grid-cols-7 gap-2">
                                        {weekDates.map((date, index) => {
                                            const isAvailable = selectedTeacher ? isDateAvailable(date) : false
                                            return (
                                                <Button
                                                    key={index}
                                                    variant={date.toDateString() === selectedDate.toDateString() ? "default" : "outline"}
                                                    className={`h-auto flex-col p-3 ${date.toDateString() === selectedDate.toDateString()
                                                        ? "bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                                        : isAvailable
                                                            ? "border-2"
                                                            : "border-2 opacity-40"
                                                        }`}
                                                    onClick={() => isAvailable && handleDateSelect(date)}
                                                    disabled={!isAvailable}
                                                >
                                                    <span className="text-sm">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                                                    <span className="text-2xl font-bold">{date.getDate()}</span>
                                                    <span className="text-xs">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h2 className="mb-4 text-xl font-bold">Available Time Slots for {formatDate(selectedDate)}</h2>
                                    {selectedTeacher ? (
                                        timeSlots.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-3">
                                                {timeSlots.map((slot, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={selectedTimeSlot === `${slot.startTime} - ${slot.endTime}` ? "default" : "outline"}
                                                        className={`h-16 ${!slot.available
                                                            ? "cursor-not-allowed opacity-50"
                                                            : selectedTimeSlot === `${slot.startTime} - ${slot.endTime}`
                                                                ? "bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                                                : "border-2"
                                                            }`}
                                                        disabled={!slot.available}
                                                        onClick={() => handleTimeSlotSelect(`${slot.startTime} - ${slot.endTime}`)}
                                                    >
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Clock className="h-5 w-5 mb-1" />
                                                            <span className="text-sm font-medium">
                                                                {slot.startTime} - {slot.endTime}
                                                            </span>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">No available time slots for this date</div>
                                        )
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">Please select a teacher first</div>
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

                                {selectedTeacher ? (
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

                                        {/* Generate all possible time slots across all days */}
                                        {(() => {
                                            // Get all unique time slots from all days
                                            const allTimeSlots = new Set<string>()
                                            for (const day in selectedTeacher.availability) {
                                                selectedTeacher.availability[day as keyof typeof selectedTeacher.availability].forEach(
                                                    (slot) => {
                                                        allTimeSlots.add(`${slot.startTime} - ${slot.endTime}`)
                                                    },
                                                )
                                            }

                                            // Sort time slots
                                            const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
                                                const timeA = new Date(`01/01/2023 ${a.split(" - ")[0]}`).getTime()
                                                const timeB = new Date(`01/01/2023 ${b.split(" - ")[0]}`).getTime()
                                                return timeA - timeB
                                            })

                                            return sortedTimeSlots.map((timeSlot, index) => (
                                                <div key={index} className="grid grid-cols-[100px_1fr] divide-x border-t">
                                                    <div className="p-2 text-sm text-center">{timeSlot}</div>
                                                    <div className="grid grid-cols-7 divide-x">
                                                        {weekDates.map((date, i) => {
                                                            const dayOfWeek = date.getDay()
                                                            const dayName = [
                                                                "sunday",
                                                                "monday",
                                                                "tuesday",
                                                                "wednesday",
                                                                "thursday",
                                                                "friday",
                                                                "saturday",
                                                            ][dayOfWeek]
                                                            const daySlots =
                                                                selectedTeacher.availability[dayName as keyof typeof selectedTeacher.availability]

                                                            const hasTimeSlot = daySlots.some(
                                                                (slot) => `${slot.startTime} - ${slot.endTime}` === timeSlot && slot.available,
                                                            )

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`p-2 min-h-[60px] ${hasTimeSlot ? "cursor-pointer hover:bg-[#FFC629]/10" : ""
                                                                        } ${hasTimeSlot &&
                                                                            selectedDate.toDateString() === date.toDateString() &&
                                                                            selectedTimeSlot === timeSlot
                                                                            ? "bg-[#FFC629]/20 border border-[#FFC629]"
                                                                            : ""
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (hasTimeSlot) {
                                                                            handleDateSelect(date)
                                                                            handleTimeSlotSelect(timeSlot)
                                                                        }
                                                                    }}
                                                                >
                                                                    {hasTimeSlot && (
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
                                ) : (
                                    <div className="text-center py-12 text-gray-500">Please select a teacher first</div>
                                )}
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

                                        const isAvailable = selectedTeacher ? isDateAvailable(date) : false

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
                            disabled={!selectedTeacher || !selectedTimeSlot}
                            onClick={handleBookAppointment}
                        >
                            Book Appointment
                        </Button>
                    </div>
                </div>
            </main>

            {/* Booking confirmation dialog */}
            <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Appointment</DialogTitle>
                        <DialogDescription>Please review your appointment details before confirming.</DialogDescription>
                    </DialogHeader>

                    {!bookingConfirmed ? (
                        <>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Teacher:</span>
                                    <span>{selectedTeacher?.name}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Subject:</span>
                                    <span>{selectedTeacher?.subject}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Date:</span>
                                    <span>{formatDate(selectedDate)}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Time:</span>
                                    <span>{selectedTimeSlot}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                                    Cancel
                                </Button>
                                <Button className="bg-[#FFC629] text-black hover:bg-[#FFC629]/90" onClick={confirmBooking}>
                                    Confirm Booking
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-medium">Booking Confirmed!</h3>
                            <p className="text-center text-gray-500">Your appointment has been successfully booked.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

