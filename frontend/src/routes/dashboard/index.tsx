import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { appointmentsForFaculty, userQueryOptions, getAllFacultyQueryOptions } from "@/lib/api";
import type { Department, Appointment, Faculty } from "@server/sharedTypes";

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
    X,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { departmentEnum } from "@server/db/schema/faculty";

// Mock data for the current teacher
export const Route = createFileRoute("/dashboard/")({
    component: Dashboard,
});

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Format time for display
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

// Format date for display
const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
};

function Dashboard() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
    const [selectedAppointment, setSelectedAppointment] =
        useState<Appointment | null>(null);
    const [showBookingDialog, setShowBookingDialog] = useState(false);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
    const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);


    const results = useQueries({
        queries: [
            userQueryOptions,
            getAllFacultyQueryOptions,
        ]
    });

    const { data: appointments } = useQuery({
        queryKey: ["appointments-for-faculty", selectedFaculty],
        queryFn: () => appointmentsForFaculty(selectedFaculty!.id),
        enabled: !!selectedFaculty, // Only run the query if selectedFaculty exists
    });

    const [userResult, facultyResult] = results;

    const allFaculty = facultyResult.data?.faculty;


    // Filter faculty based on search and department
    const filteredFaculty = allFaculty?.filter((faculty) => {
        const matchesSearch = faculty.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment
            ? faculty.department === selectedDepartment
            : true;
        return matchesSearch && matchesDepartment;
    });

    // Get unique departments from faculty data
    const departments = departmentEnum.enumValues;

    // Set the week start date to the Sunday of the current week
    useEffect(() => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - date.getDay()); // Set to Sunday
        setWeekStartDate(date);
    }, [selectedDate]);

    // Update available dates when faculty changes
    useEffect(() => {
        if (selectedFaculty) {
            const dates = new Set<string>();

            // Find all appointments for the selected faculty
            appointments!.appointments
                .filter(
                    (appointment) =>
                        appointment.facultyId === selectedFaculty.id &&
                        appointment.status === "available"
                )
                .forEach((appointment) => {
                    // Add the date to the set (without time)
                    const dateString = appointment.startTime.toDateString();
                    dates.add(dateString);
                });

            // Convert the set of date strings back to Date objects
            const availableDatesArray = Array.from(dates).map(
                (dateStr) => new Date(dateStr)
            );
            setAvailableDates(availableDatesArray);
        }
    }, [selectedFaculty]);

    // Generate dates for the next 7 days
    const generateWeekDates = (startDate: Date) => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return date;
        });
    };

    const weekDates = generateWeekDates(weekStartDate);

    // Navigate to previous week
    const goToPreviousWeek = () => {
        const newStartDate = new Date(weekStartDate);
        newStartDate.setDate(weekStartDate.getDate() - 7);
        setWeekStartDate(newStartDate);
    };

    // Navigate to next week
    const goToNextWeek = () => {
        const newStartDate = new Date(weekStartDate);
        newStartDate.setDate(weekStartDate.getDate() + 7);
        setWeekStartDate(newStartDate);
    };

    // Check if a date has available appointments
    const isDateAvailable = (date: Date): boolean => {
        if (!selectedFaculty) return false;

        return availableDates.some(
            (availableDate) => availableDate.toDateString() === date.toDateString()
        );
    };

    const getAppointmentsForDate = (date: Date): Appointment[] => {
    if (!selectedFaculty) return []

    return appointments!.appointments
      .filter(
        (appointment) =>
          appointment.facultyId === selectedFaculty.id &&
          appointment.status === "available" &&
          appointment.startTime.toDateString() === date.toDateString(),
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  const dateAppointments = getAppointmentsForDate(selectedDate)

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedAppointment(null);
    };

    const handleAppointmentSelect = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
    };

    const handleBookAppointment = () => {
        if (selectedFaculty && selectedAppointment) {
            setShowBookingDialog(true);
        }
    };

    const confirmBooking = () => {
        setBookingConfirmed(true);
        setTimeout(() => {
            setShowBookingDialog(false);
            setBookingConfirmed(false);
            setSelectedAppointment(null);
        }, 2000);
    };

    // Generate month calendar dates
    const generateMonthDates = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startOffset = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const calendarDays: (Date | null)[] = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < startOffset; i++) {
            calendarDays.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(new Date(year, month, i));
        }

        // Add empty slots to complete the grid (if needed)
        const totalSlots = Math.ceil(calendarDays.length / 7) * 7;
        for (let i = calendarDays.length; i < totalSlots; i++) {
            calendarDays.push(null);
        }

        return calendarDays;
    };

    const monthDates = generateMonthDates();

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
                                <span>{userResult.data ? capitalize(userResult.data?.user.given_name) + " " + capitalize(userResult.data?.user.family_name) : "John Doe"}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-10 w-10 border-gray-200"
                                asChild
                            >
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
                        <h2 className="mb-4 text-xl font-bold">Find Faculty</h2>

                        {/* Search input */}
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-[#FFC629] focus:outline-none focus:ring-1 focus:ring-[#FFC629]"
                                />
                                <button
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={() => setSearchQuery("")}
                                >
                                    {searchQuery && (
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Department filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between border-2 py-2"
                                    >
                                        {selectedDepartment
                                            ? selectedDepartment
                                            : "All Departments"}
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px]">
                                    <DropdownMenuItem
                                        className="py-2"
                                        onClick={() => setSelectedDepartment(null)}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div>All Departments</div>
                                            {selectedDepartment === null && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </div>
                                    </DropdownMenuItem>
                                    {departments.map((department) => (
                                        <DropdownMenuItem
                                            key={department}
                                            className="py-2"
                                            onClick={() => setSelectedDepartment(department)}
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <div>{department}</div>
                                                {selectedDepartment === department && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Faculty selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Faculty
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between border-2 py-6 text-lg"
                                    >
                                        {selectedFaculty ? selectedFaculty.name : "Choose faculty"}
                                        <ChevronDown className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] max-h-[300px] overflow-y-auto">
                                    {filteredFaculty && filteredFaculty?.length > 0 ? (
                                        filteredFaculty!.map((faculty) => (
                                            <DropdownMenuItem
                                                key={faculty.id}
                                                className="py-3 text-base"
                                                onClick={() => setSelectedFaculty(faculty)}
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <div>
                                                        <div>{faculty.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {faculty.title}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {faculty.department
                                                                ? faculty.department
                                                                : ""}
                                                        </div>
                                                    </div>
                                                    {selectedFaculty?.id === faculty.id && (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <div className="py-3 text-center text-gray-500">
                                            No faculty found
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {selectedFaculty && (
                            <div className="mt-6">
                                <h3 className="mb-2 text-lg font-medium">Selected Faculty:</h3>
                                <Card className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {selectedFaculty.photoUrl ? (
                                                <img
                                                    src={selectedFaculty.photoUrl || "/placeholder.svg"}
                                                    alt={selectedFaculty.name}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFC629]">
                                                    <User className="h-10 w-10 text-black" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-lg">
                                                {selectedFaculty.name}
                                            </div>
                                            <div className="text-gray-700">
                                                {selectedFaculty.title}
                                            </div>
                                            <div className="text-gray-500">
                                                {selectedFaculty.position}
                                            </div>
                                            <div className="text-gray-500">
                                                {selectedFaculty.department
                                                    ? selectedFaculty.department
                                                    : ""}
                                            </div>

                                            <div className="mt-3 space-y-1">
                                                {selectedFaculty.officeLocation && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {selectedFaculty.officeLocation}
                                                    </div>
                                                )}
                                                {selectedFaculty.phone && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="h-4 w-4 mr-1" />
                                                        {selectedFaculty.phone}
                                                    </div>
                                                )}
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Mail className="h-4 w-4 mr-1" />
                                                    {selectedFaculty.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </Card>

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
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            onClick={goToPreviousWeek}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <h3 className="text-lg font-medium">Select Date</h3>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            onClick={goToNextWeek}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {weekDates.map((date, index) => {
                                            const isAvailable = selectedFaculty
                                                ? isDateAvailable(date)
                                                : false;
                                            return (
                                                <Button
                                                    key={index}
                                                    variant={
                                                        date.toDateString() === selectedDate.toDateString()
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className={`h-auto flex-col p-3 ${date.toDateString() === selectedDate.toDateString()
                                                        ? "bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                                        : isAvailable
                                                            ? "border-2"
                                                            : "border-2 opacity-40"
                                                        }`}
                                                    onClick={() => isAvailable && handleDateSelect(date)}
                                                    disabled={!isAvailable}
                                                >
                                                    <span className="text-sm">
                                                        {date.toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                        })}
                                                    </span>
                                                    <span className="text-2xl font-bold">
                                                        {date.getDate()}
                                                    </span>
                                                    <span className="text-xs">
                                                        {date.toLocaleDateString("en-US", {
                                                            month: "short",
                                                        })}
                                                    </span>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h2 className="mb-4 text-xl font-bold">
                                        Available Appointments for {formatDate(selectedDate)}
                                    </h2>
                                    {selectedFaculty ? (
                                        dateAppointments.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-3">
                                                {dateAppointments.map((appointment) => (
                                                    <Button
                                                        key={appointment.id}
                                                        variant={
                                                            selectedAppointment?.id === appointment.id
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        className={`h-16 ${selectedAppointment?.id === appointment.id
                                                            ? "bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                                            : "border-2"
                                                            }`}
                                                        onClick={() => handleAppointmentSelect(appointment)}
                                                    >
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Clock className="h-5 w-5 mb-1" />
                                                            <span className="text-sm font-medium">
                                                                {formatTime(appointment.startTime)} -{" "}
                                                                {formatTime(appointment.endTime)}
                                                            </span>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                No available appointments for this date
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            Please select a faculty member first
                                        </div>
                                    )}
                                </Card>
                            </>
                        )}

                        {viewMode === "week" && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={goToPreviousWeek}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <h3 className="text-lg font-medium">
                                        Week of{" "}
                                        {weekStartDate.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={goToNextWeek}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                {selectedFaculty ? (
                                    <div className="border rounded-lg">
                                        <div className="grid grid-cols-[100px_1fr] divide-x">
                                            <div className="p-2 font-medium text-center">Time</div>
                                            <div className="grid grid-cols-7 divide-x">
                                                {weekDates.map((date, i) => (
                                                    <div
                                                        key={i}
                                                        className={`p-2 text-center text-sm font-medium ${date.toDateString() ===
                                                            selectedDate.toDateString()
                                                            ? "bg-[#FFC629]/20"
                                                            : ""
                                                            } ${isDateAvailable(date) ? "cursor-pointer" : "text-gray-400"}`}
                                                        onClick={() =>
                                                            isDateAvailable(date) && handleDateSelect(date)
                                                        }
                                                    >
                                                        {date.toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                        })}
                                                        <div className="text-lg font-bold">
                                                            {date.getDate()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Generate time slots for the week view */}
                                        {(() => {
                                            // Get all appointments for the selected faculty for this week
                                            const weekAppointments = appointments!.appointments.filter(
                                                (appointment) =>
                                                    appointment.facultyId === selectedFaculty.id &&
                                                    appointment.status === "available" &&
                                                    weekDates.some(
                                                        (date) =>
                                                            appointment.startTime.toDateString() ===
                                                            date.toDateString()
                                                    )
                                            );

                                            // Get all unique time slots from the week's appointments
                                            const timeSlots = new Set<string>();
                                            weekAppointments.forEach((appointment) => {
                                                const startTime = formatTime(appointment.startTime);
                                                const endTime = formatTime(appointment.endTime);
                                                timeSlots.add(`${startTime} - ${endTime}`);
                                            });

                                            // Sort time slots
                                            const sortedTimeSlots = Array.from(timeSlots).sort(
                                                (a, b) => {
                                                    const timeA = new Date(
                                                        `01/01/2023 ${a.split(" - ")[0]}`
                                                    ).getTime();
                                                    const timeB = new Date(
                                                        `01/01/2023 ${b.split(" - ")[0]}`
                                                    ).getTime();
                                                    return timeA - timeB;
                                                }
                                            );

                                            return sortedTimeSlots.map((timeSlot, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-[100px_1fr] divide-x border-t"
                                                >
                                                    <div className="p-2 text-sm text-center">
                                                        {timeSlot}
                                                    </div>
                                                    <div className="grid grid-cols-7 divide-x">
                                                        {weekDates.map((date, i) => {
                                                            // Find appointment for this date and time slot
                                                            const appointment = weekAppointments.find(
                                                                (apt) => {
                                                                    const aptTimeSlot = `${formatTime(apt.startTime)} - ${formatTime(apt.endTime)}`;
                                                                    return (
                                                                        aptTimeSlot === timeSlot &&
                                                                        apt.startTime.toDateString() ===
                                                                        date.toDateString()
                                                                    );
                                                                }
                                                            );

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`p-2 min-h-[60px] ${appointment
                                                                        ? "cursor-pointer hover:bg-[#FFC629]/10"
                                                                        : ""
                                                                        } ${appointment &&
                                                                            selectedDate.toDateString() ===
                                                                            date.toDateString() &&
                                                                            selectedAppointment?.id === appointment.id
                                                                            ? "bg-[#FFC629]/20 border border-[#FFC629]"
                                                                            : ""
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (appointment) {
                                                                            handleDateSelect(date);
                                                                            handleAppointmentSelect(appointment);
                                                                        }
                                                                    }}
                                                                >
                                                                    {appointment && (
                                                                        <div className="text-xs p-1 bg-blue-100 rounded border border-blue-200 text-center">
                                                                            Available
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        Please select a faculty member first
                                    </div>
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
                                            const newDate = new Date(selectedDate);
                                            newDate.setMonth(newDate.getMonth() - 1);
                                            setSelectedDate(newDate);
                                        }}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <h3 className="text-lg font-medium">
                                        {selectedDate.toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={() => {
                                            const newDate = new Date(selectedDate);
                                            newDate.setMonth(newDate.getMonth() + 1);
                                            setSelectedDate(newDate);
                                        }}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                        (day, i) => (
                                            <div key={i} className="text-center font-medium">
                                                {day}
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {monthDates.map((date, i) => {
                                        if (!date) {
                                            return <div key={i} className="h-16"></div>;
                                        }

                                        const isAvailable = selectedFaculty
                                            ? isDateAvailable(date)
                                            : false;

                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                className={`h-16 w-full p-2 flex flex-col items-start justify-start ${!isAvailable ? "opacity-40" : ""
                                                    } ${date.toDateString() === selectedDate.toDateString()
                                                        ? "bg-[#FFC629]/20 border-[#FFC629]"
                                                        : ""
                                                    }`}
                                                disabled={!isAvailable}
                                                onClick={() => {
                                                    if (isAvailable) handleDateSelect(date);
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
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        <Button
                            className="h-14 w-full bg-[#FFC629] text-lg font-semibold text-black hover:bg-[#FFC629]/90 disabled:bg-gray-200"
                            disabled={!selectedFaculty || !selectedAppointment}
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
                        <DialogDescription>
                            Please review your appointment details before confirming.
                        </DialogDescription>
                    </DialogHeader>

                    {!bookingConfirmed ? (
                        <>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Faculty:</span>
                                    <span>{selectedFaculty?.name}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Department:</span>
                                    <span>
                                        {selectedFaculty?.department
                                            ? selectedFaculty.department
                                            : ""}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Date:</span>
                                    <span>
                                        {selectedAppointment
                                            ? formatDate(selectedAppointment.startTime)
                                            : ""}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Time:</span>
                                    <span>
                                        {selectedAppointment
                                            ? `${formatTime(selectedAppointment.startTime)} - ${formatTime(selectedAppointment.endTime)}`
                                            : ""}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                    <span className="font-medium">Location:</span>
                                    <span>{selectedFaculty?.officeLocation || "Online"}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBookingDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-[#FFC629] text-black hover:bg-[#FFC629]/90"
                                    onClick={confirmBooking}
                                >
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
                            <p className="text-center text-gray-500">
                                Your appointment has been successfully booked.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
