
import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
    Calendar,
    Clock,
    LogOut,
    User,
    X,
    Plus,
    CalendarIcon,
    CalendarDays,
    CalendarRange,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute('/admin/')({
    component: AdminDashboard
})

// Mock data for the current teacher
const currentTeacher = {
    id: 1,
    name: "Dr. Smith",
    subject: "Mathematics",
    email: "smith@example.edu",
}

// Mock data for appointments
const initialAppointments = [
    {
        id: 1,
        studentName: "Alice Johnson",
        date: new Date(2025, 2, 31),
        time: "10:00 AM - 11:00 AM",
        status: "confirmed",
    },
    {
        id: 2,
        studentName: "Bob Williams",
        date: new Date(2025, 2, 31),
        time: "02:00 PM - 03:00 PM",
        status: "confirmed",
    },
    {
        id: 3,
        studentName: "Charlie Brown",
        date: new Date(2025, 3, 1),
        time: "11:00 AM - 12:00 PM",
        status: "confirmed",
    },
    {
        id: 4,
        studentName: "Diana Miller",
        date: new Date(2025, 3, 2),
        time: "09:00 AM - 10:00 AM",
        status: "confirmed",
    },
]

// Mock data for available time slots template
const defaultTimeSlots = [
    { id: 1, startTime: "09:00 AM", endTime: "10:00 AM", available: true },
    { id: 2, startTime: "10:00 AM", endTime: "11:00 AM", available: true },
    { id: 3, startTime: "11:00 AM", endTime: "12:00 PM", available: true },
    { id: 4, startTime: "01:00 PM", endTime: "02:00 PM", available: true },
    { id: 5, startTime: "02:00 PM", endTime: "03:00 PM", available: true },
    { id: 6, startTime: "03:00 PM", endTime: "04:00 PM", available: true },
]

function AdminDashboard() {
    // Initialize all state variables here to avoid conditional hook calls
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [appointments, setAppointments] = useState(initialAppointments)
    const [timeSlots, setTimeSlots] = useState(defaultTimeSlots)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [appointmentToCancel, setAppointmentToCancel] = useState<(typeof initialAppointments)[0] | null>(null)
    const [showAddSlotDialog, setShowAddSlotDialog] = useState(false)
    const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)
    const [weekdayAvailability, setWeekdayAvailability] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    })
    const [newStartTime, setNewStartTime] = useState("")
    const [newEndTime, setNewEndTime] = useState("")
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")

    // Generate dates for the next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return date
    })

    // Format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
    }

    const toggleTimeSlotAvailability = (slotId: number) => {
        setTimeSlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, available: !slot.available } : slot)))
    }

    const handleCancelAppointment = (appointment: (typeof initialAppointments)[0]) => {
        setAppointmentToCancel(appointment)
        setShowCancelDialog(true)
    }

    const confirmCancelAppointment = () => {
        if (appointmentToCancel) {
            setAppointments((prev) => prev.filter((app) => app.id !== appointmentToCancel.id))
            setShowCancelDialog(false)
            setAppointmentToCancel(null)
        }
    }

    const addNewTimeSlot = () => {
        if (newStartTime && newEndTime) {
            const newId = Math.max(...timeSlots.map((slot) => slot.id)) + 1
            setTimeSlots((prev) =>
                [...prev, { id: newId, startTime: newStartTime, endTime: newEndTime, available: true }].sort((a, b) => {
                    // Sort by time (convert to 24h format for comparison)
                    const timeA = new Date(`01/01/2023 ${a.startTime}`).getTime()
                    const timeB = new Date(`01/01/2023 ${b.startTime}`).getTime()
                    return timeA - timeB
                }),
            )
            setShowAddSlotDialog(false)
            setNewStartTime("")
            setNewEndTime("")
        }
    }

    const removeTimeSlot = (slotId: number) => {
        setTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId))
    }

    const toggleWeekdayAvailability = (day: keyof typeof weekdayAvailability) => {
        setWeekdayAvailability((prev) => ({
            ...prev,
            [day]: !prev[day],
        }))
    }

    // Filter appointments for the selected date
    const filteredAppointments = appointments.filter((app) => app.date.toDateString() === selectedDate.toDateString())

    return (
        <div className="min-h-screen bg-[#D8E6E4]">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-[#FFC629]" />
                            <h1 className="text-2xl font-bold">Teacher Admin</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC629]">
                                    <User className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <div className="font-medium">{currentTeacher.name}</div>
                                    <div className="text-sm text-gray-500">{currentTeacher.subject}</div>
                                </div>
                            </div>
                            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200">
                                <LogOut className="h-5 w-5 text-gray-600" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto p-4">
                <Tabs defaultValue="schedule" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="schedule" className="text-lg py-3">
                            Schedule
                        </TabsTrigger>
                        <TabsTrigger value="appointments" className="text-lg py-3">
                            Appointments
                        </TabsTrigger>
                        <TabsTrigger value="availability" className="text-lg py-3">
                            Availability
                        </TabsTrigger>
                    </TabsList>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">Schedule</h2>
                                <span className="text-sm text-gray-500">{formatDate(selectedDate)}</span>
                            </div>
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
                            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                                {/* Calendar */}
                                <Card className="p-6">
                                    <h2 className="mb-4 text-xl font-bold">Select Date</h2>
                                    <div className="grid grid-cols-7 gap-2">
                                        {dates.map((date, index) => (
                                            <Button
                                                key={index}
                                                variant={date.toDateString() === selectedDate.toDateString() ? "default" : "outline"}
                                                className={`h-auto flex-col p-3 ${date.toDateString() === selectedDate.toDateString()
                                                        ? "bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                                        : "border-2"
                                                    }`}
                                                onClick={() => handleDateSelect(date)}
                                            >
                                                <span className="text-sm">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                                                <span className="text-2xl font-bold">{date.getDate()}</span>
                                                <span className="text-xs">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium">Appointments</h3>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {filteredAppointments.length > 0 ? (
                                                filteredAppointments.map((appointment) => (
                                                    <Card key={appointment.id} className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium">{appointment.studentName}</div>
                                                                <div className="text-sm text-gray-500">{appointment.time}</div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-500 border-red-200 hover:bg-red-50"
                                                                onClick={() => handleCancelAppointment(appointment)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 text-gray-500">No appointments for this date</div>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                {/* Time Slots Management */}
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">Manage Time Slots</h2>
                                        <Button
                                            onClick={() => setShowAddSlotDialog(true)}
                                            className="bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Slot
                                        </Button>
                                    </div>

                                    <p className="mb-4 text-gray-500">
                                        Toggle availability for {formatDate(selectedDate)}. Green slots are available for booking.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {timeSlots.map((slot) => (
                                            <div key={slot.id} className="relative">
                                                <Button
                                                    variant="outline"
                                                    className={`h-16 w-full ${slot.available
                                                            ? "bg-green-100 border-green-300 hover:bg-green-200"
                                                            : "bg-red-100 border-red-300 hover:bg-red-200"
                                                        }`}
                                                    onClick={() => toggleTimeSlotAvailability(slot.id)}
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Clock className="h-5 w-5 mb-1" />
                                                        <span className="text-sm font-medium">
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                    </div>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-gray-200 p-1 hover:bg-gray-300"
                                                    onClick={() => removeTimeSlot(slot.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="mb-2 text-lg font-medium">Legend</h3>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded bg-green-100 border border-green-300"></div>
                                                <span className="text-sm">Available</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded bg-red-100 border border-red-300"></div>
                                                <span className="text-sm">Unavailable</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {viewMode === "week" && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <Button variant="outline" size="icon" className="rounded-full">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <h3 className="text-lg font-medium">
                                        Week of{" "}
                                        {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </h3>
                                    <Button variant="outline" size="icon" className="rounded-full">
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

                                <div className="grid grid-cols-7 gap-2 mb-6">
                                    {Array.from({ length: 7 }, (_, i) => {
                                        const date = new Date(selectedDate)
                                        date.setDate(date.getDate() - date.getDay() + i)
                                        return (
                                            <Button
                                                key={i}
                                                variant={date.toDateString() === selectedDate.toDateString() ? "default" : "outline"}
                                                className={`h-auto flex-col p-3 ${date.toDateString() === selectedDate.toDateString()
                                                        ? "bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                                        : "border-2"
                                                    }`}
                                                onClick={() => handleDateSelect(date)}
                                            >
                                                <span className="text-2xl font-bold">{date.getDate()}</span>
                                                <span className="text-xs">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                                            </Button>
                                        )
                                    })}
                                </div>

                                <div className="border rounded-lg">
                                    <div className="grid grid-cols-[100px_1fr] divide-x">
                                        <div className="p-2 font-medium text-center">Time</div>
                                        <div className="grid grid-cols-7 divide-x">
                                            {Array.from({ length: 7 }, (_, i) => {
                                                const date = new Date(selectedDate)
                                                date.setDate(date.getDate() - date.getDay() + i)
                                                return (
                                                    <div key={i} className="p-2 text-center text-sm">
                                                        {date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {timeSlots.map((slot) => (
                                        <div key={slot.id} className="grid grid-cols-[100px_1fr] divide-x border-t">
                                            <div className="p-2 text-sm text-center">
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                            <div className="grid grid-cols-7 divide-x">
                                                {Array.from({ length: 7 }, (_, i) => (
                                                    <div key={i} className="p-2 min-h-[60px]">
                                                        {Math.random() > 0.8 && (
                                                            <div className="text-xs p-1 bg-blue-100 rounded border border-blue-200">
                                                                Student Meeting
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {viewMode === "month" && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <Button variant="outline" size="icon" className="rounded-full">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <h3 className="text-lg font-medium">
                                        {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </h3>
                                    <Button variant="outline" size="icon" className="rounded-full">
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
                                    {Array.from({ length: 35 }, (_, i) => {
                                        const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
                                        const startOffset = firstDay.getDay()
                                        const day = i - startOffset + 1
                                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                                        const isCurrentMonth = date.getMonth() === selectedDate.getMonth()

                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                className={`h-20 w-full p-2 flex flex-col items-start justify-start ${!isCurrentMonth ? "opacity-40" : ""
                                                    } ${date.toDateString() === selectedDate.toDateString() ? "bg-[#FFC629]/20 border-[#FFC629]" : ""
                                                    }`}
                                                disabled={!isCurrentMonth}
                                                onClick={() => {
                                                    if (isCurrentMonth) handleDateSelect(date)
                                                }}
                                            >
                                                <span
                                                    className={`text-sm font-medium ${date.toDateString() === new Date().toDateString()
                                                            ? "h-6 w-6 bg-[#FFC629] text-black rounded-full flex items-center justify-center"
                                                            : ""
                                                        }`}
                                                >
                                                    {day > 0 &&
                                                        day <= new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
                                                        ? day
                                                        : ""}
                                                </span>
                                                {isCurrentMonth && Math.random() > 0.7 && (
                                                    <div className="mt-1 w-full">
                                                        <div className="text-xs p-1 bg-blue-100 rounded border border-blue-200 truncate">
                                                            {Math.random() > 0.5 ? "2 appointments" : "1 appointment"}
                                                        </div>
                                                    </div>
                                                )}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Appointments Tab */}
                    <TabsContent value="appointments">
                        <Card className="p-6">
                            <h2 className="mb-6 text-xl font-bold">Upcoming Appointments</h2>

                            {appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.map((appointment) => (
                                        <Card key={appointment.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFC629]">
                                                        <CalendarIcon className="h-6 w-6 text-black" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{appointment.studentName}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatDate(appointment.date)} at {appointment.time}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleCancelAppointment(appointment)}
                                                >
                                                    Cancel Appointment
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">No upcoming appointments</div>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Availability Tab */}
                    <TabsContent value="availability">
                        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
                            <Card className="p-6">
                                <h2 className="mb-4 text-xl font-bold">Weekly Availability</h2>
                                <p className="mb-4 text-gray-500">
                                    Set which days of the week you are generally available for appointments.
                                </p>

                                <div className="space-y-4">
                                    {Object.entries(weekdayAvailability).map(([day, isAvailable]) => (
                                        <div key={day} className="flex items-center justify-between">
                                            <Label htmlFor={`${day}-switch`} className="text-lg capitalize">
                                                {day}
                                            </Label>
                                            <Switch
                                                id={`${day}-switch`}
                                                checked={isAvailable}
                                                onCheckedChange={() => toggleWeekdayAvailability(day as keyof typeof weekdayAvailability)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="mt-6 w-full bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                    onClick={() => setShowAvailabilityDialog(true)}
                                >
                                    Set Default Time Slots
                                </Button>
                            </Card>

                            <Card className="p-6">
                                <h2 className="mb-4 text-xl font-bold">Vacation & Time Off</h2>
                                <p className="mb-4 text-gray-500">Block out entire days when you will be unavailable.</p>

                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-7 gap-2 mb-4">
                                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                                            <div key={i} className="text-center font-medium">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: 35 }, (_, i) => (
                                            <Button key={i} variant="outline" className="h-10 w-full p-0" disabled={i < 3 || i > 30}>
                                                {i >= 3 && i <= 30 ? i - 2 : ""}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button className="w-full bg-[#FFC629] text-black hover:bg-[#FFC629]/90">Block Selected Dates</Button>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Cancel Appointment Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this appointment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {appointmentToCancel && (
                        <div className="py-4">
                            <div className="rounded-lg border p-4">
                                <div className="font-medium">{appointmentToCancel.studentName}</div>
                                <div className="text-sm text-gray-500">
                                    {formatDate(appointmentToCancel.date)} at {appointmentToCancel.time}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Keep Appointment
                        </Button>
                        <Button variant="destructive" onClick={confirmCancelAppointment}>
                            Cancel Appointment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Time Slot Dialog */}
            <Dialog open={showAddSlotDialog} onOpenChange={setShowAddSlotDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Time Slot</DialogTitle>
                        <DialogDescription>Add a new time slot to your availability.</DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Select onValueChange={setNewStartTime}>
                                <SelectTrigger id="start-time" className="w-full">
                                    <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                                    <SelectItem value="08:30 AM">08:30 AM</SelectItem>
                                    <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                                    <SelectItem value="09:30 AM">09:30 AM</SelectItem>
                                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                    <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                                    <SelectItem value="11:30 AM">11:30 AM</SelectItem>
                                    <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                                    <SelectItem value="12:30 PM">12:30 PM</SelectItem>
                                    <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                                    <SelectItem value="01:30 PM">01:30 PM</SelectItem>
                                    <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                                    <SelectItem value="02:30 PM">02:30 PM</SelectItem>
                                    <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                                    <SelectItem value="03:30 PM">03:30 PM</SelectItem>
                                    <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                                    <SelectItem value="04:30 PM">04:30 PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Select onValueChange={setNewEndTime}>
                                <SelectTrigger id="end-time" className="w-full">
                                    <SelectValue placeholder="Select end time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="08:30 AM">08:30 AM</SelectItem>
                                    <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                                    <SelectItem value="09:30 AM">09:30 AM</SelectItem>
                                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                    <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                                    <SelectItem value="11:30 AM">11:30 AM</SelectItem>
                                    <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                                    <SelectItem value="12:30 PM">12:30 PM</SelectItem>
                                    <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                                    <SelectItem value="01:30 PM">01:30 PM</SelectItem>
                                    <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                                    <SelectItem value="02:30 PM">02:30 PM</SelectItem>
                                    <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                                    <SelectItem value="03:30 PM">03:30 PM</SelectItem>
                                    <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                                    <SelectItem value="04:30 PM">04:30 PM</SelectItem>
                                    <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddSlotDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                            onClick={addNewTimeSlot}
                            disabled={!newStartTime || !newEndTime}
                        >
                            Add Time Slot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Set Default Availability Dialog */}
            <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Default Time Slots</DialogTitle>
                        <DialogDescription>Set your default time slots for available days.</DialogDescription>
                    </DialogHeader>

                    <div className="py-4 max-h-[400px] overflow-y-auto">
                        <div className="space-y-4">
                            {timeSlots.map((slot) => (
                                <div key={slot.id} className="flex items-center justify-between">
                                    <Label htmlFor={`default-${slot.id}`} className="text-base">
                                        {slot.startTime} - {slot.endTime}
                                    </Label>
                                    <Switch
                                        id={`default-${slot.id}`}
                                        checked={slot.available}
                                        onCheckedChange={() => toggleTimeSlotAvailability(slot.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                            onClick={() => setShowAvailabilityDialog(false)}
                        >
                            Save Default Slots
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

