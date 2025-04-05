import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { DashboardHeader } from '@/components/DashboardHeader'
import { BookingDialog } from '@/components/BookingDialog'
import { ScheduleViewSelector, ViewMode } from '@/components/ScheduleViewSelector'
import { FacultyDetail } from '@/components/FacultyDetails'
import { AppointmentDetails } from '@/components/AppointmentDetails'

// Import the new components
import { DayView } from '@/components/DayView'
import { WeekView } from '@/components/WeekView'
import { MonthView } from '@/components/MonthView'


import { getFacultyByIdQueryOptions, getFacultyAppointmentsQueryOptions, userQueryOptions } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import type { Appointment, SelectFacultyAppointments } from '@server/sharedTypes'

import { useState, useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"

import { queryClient } from '@/lib/api';
import NotFound from '@/components/NotFound'
import { capitalize } from '@/lib/utils'

const facultyLoader = async ({
    params,
}: {
    params: { facultyId: string };
}) => {
    const { facultyId } = params;
    try {
        const facultyData = await queryClient.fetchQuery(getFacultyByIdQueryOptions(facultyId));
        if (!facultyData || !facultyData.facultyMember) {
            // Also throw a Response with status 404 here
            throw notFound();
        }

        const userData = await queryClient.fetchQuery(userQueryOptions);
        if (!userData || !userData.user) {
            throw notFound();
        }

        return { user: userData.user, facultyMember: facultyData.facultyMember };
    } catch (error) {
        // Re-throw if it's already a Response
        throw notFound()
    }
};


export const Route = createFileRoute("/dashboard/schedule/$facultyId")({
    loader: facultyLoader,
    component: SchedulePage,
    notFoundComponent: () => <NotFound />,
})

function SchedulePage() {
    // Main Schedule Component
    const { user, facultyMember } = Route.useLoaderData();
    const navigate = useNavigate();

    // Fetch *all* available appointments for this faculty member once
    const facultyIdStr = facultyMember.id.toString();
    const value: SelectFacultyAppointments = { status: 'available' };
    const { data: appointmentsData, isLoading: isLoadingAppointments, error: appointmentsError } = useQuery(
        getFacultyAppointmentsQueryOptions(facultyIdStr, { value })
    );


    // State
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        // Initialize to today, but reset time components for comparisons
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [showBookingDialog, setShowBookingDialog] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("day") // Use ViewMode type
    const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
        const date = new Date(selectedDate); // Use initial selectedDate
        date.setDate(date.getDate() - date.getDay()); // Set to Sunday
        date.setHours(0, 0, 0, 0); // Ensure time is reset
        return date;
    });

    // Recalculate weekStartDate whenever selectedDate changes month or year
    // or when navigating weeks directly
    useEffect(() => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - date.getDay()); // Set to Sunday
        date.setHours(0, 0, 0, 0);
        setWeekStartDate(date);
    }, [selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()]); // Depend on date parts

    // Generate dates for the week view (memoized)
    const generateWeekDates = (startDate: Date): Date[] => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)
            date.setHours(0, 0, 0, 0); // Ensure time part is zeroed
            return date
        })
    }

    const weekDates = useMemo(() => generateWeekDates(weekStartDate), [weekStartDate]);

    // Calculate available dates (memoized) - used by Day and potentially Week/Month views
    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        appointmentsData?.appointments?.forEach(app => {
            if (app.status === 'available') { // Double check status just in case
                dates.add(new Date(app.startTime).toDateString());
            }
        });
        return dates;
    }, [appointmentsData]); // Recompute only when appointment data changes


    // --- Event Handlers ---
    const handleDateSelect = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0); // Normalize selected date
        setSelectedDate(newDate);
        setSelectedAppointment(null); // Clear appointment selection when date changes
        // Optional: Switch to day view when a date is selected from Week/Month?
        // setViewMode("day");
    }

    const handleAppointmentSelect = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        // Optional: Ensure the selectedDate matches the appointment's date
        const appDate = new Date(appointment.startTime);
        appDate.setHours(0, 0, 0, 0);
        if (selectedDate.toDateString() !== appDate.toDateString()) {
            setSelectedDate(appDate);
        }
    }

    const handleBookAppointment = () => {
        if (selectedAppointment) {
            setShowBookingDialog(true)
        }
    }

    const confirmBooking = () => {
        // Booking logic here (API call)
        console.log("Booking confirmed for:", selectedAppointment);
        // TODO: Add API call to book the appointment
        // After successful booking:
        // - Invalidate queries to refetch appointments
        // queryClient.invalidateQueries(getFacultyAppointmentsQueryOptions(facultyIdStr, { value }));
        // - Clear selection
        // setSelectedAppointment(null);
        // - Close dialog
        setShowBookingDialog(false);
        // - Maybe show a success toast/message
    }

    const goToPreviousWeek = () => {
        const newStartDate = new Date(weekStartDate)
        newStartDate.setDate(weekStartDate.getDate() - 7)
        setWeekStartDate(newStartDate);
        // Also update selectedDate if it falls outside the new week (optional, depends on desired UX)
        if (selectedDate < newStartDate) {
            setSelectedDate(newStartDate);
            setSelectedAppointment(null);
        }
    }

    const goToNextWeek = () => {
        const newStartDate = new Date(weekStartDate)
        newStartDate.setDate(weekStartDate.getDate() + 7)
        setWeekStartDate(newStartDate);
        // Also update selectedDate if it falls outside the new week (optional)
        const endOfWeek = new Date(newStartDate);
        endOfWeek.setDate(newStartDate.getDate() + 6);
        if (selectedDate > endOfWeek) {
            setSelectedDate(newStartDate); // Select start of the new week perhaps?
            setSelectedAppointment(null);
        }
    }

    const isDateAvailable = (date: Date): boolean => {
        // Check against the memoized Set for efficiency
        return availableDates.has(date.toDateString());
    };


    // --- Render Logic ---
    if (isLoadingAppointments) {
        return (
            <div className="min-h-screen bg-[#D8E6E4] flex items-center justify-center">
                <p>Loading schedule...</p> {/* Or use a spinner component */}
            </div>
        );
    }

    if (appointmentsError) {
        return (
            <div className="min-h-screen bg-[#D8E6E4] flex items-center justify-center">
                <p className="text-red-600">Error loading appointments: {appointmentsError.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#D8E6E4]">
            <DashboardHeader name={capitalize(user.given_name) + " " + capitalize(user.family_name)} /> {/* Use actual user name */}

            <main className="container mx-auto p-4">
                <div className="grid gap-6 md:grid-cols-[minmax(250px,_1fr)_3fr]"> {/* Adjusted grid columns */}
                    {/* Sidebar */}
                    <div>
                        <FacultyDetail
                            faculty={facultyMember}
                            onChangeFaculty={() => navigate({ to: "/dashboard" })}
                        />
                        <AppointmentDetails selectedAppointment={selectedAppointment} />
                    </div>

                    {/* Calendar and appointment slots */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                            <h2 className="text-xl font-bold">Schedule Appointment</h2>
                            <ScheduleViewSelector
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                            />
                        </div>

                        {/* Conditional Rendering of Views */}
                        {viewMode === "day" && (
                            <DayView
                                selectedDate={selectedDate}
                                weekDates={weekDates}
                                appointments={appointmentsData?.appointments}
                                selectedAppointment={selectedAppointment}
                                onDateSelect={handleDateSelect}
                                onAppointmentSelect={handleAppointmentSelect}
                                goToPreviousWeek={goToPreviousWeek}
                                goToNextWeek={goToNextWeek}
                                isDateAvailable={isDateAvailable}
                            />
                        )}

                        {viewMode === "week" && (
                            <WeekView
                                facultyId={facultyMember.id}
                                weekStartDate={weekStartDate}
                                weekDates={weekDates}
                                selectedDate={selectedDate}
                                appointments={appointmentsData?.appointments}
                                selectedAppointment={selectedAppointment}
                                onDateSelect={handleDateSelect}
                                onAppointmentSelect={handleAppointmentSelect}
                                goToPreviousWeek={goToPreviousWeek}
                                goToNextWeek={goToNextWeek}
                                isDateAvailable={isDateAvailable}
                            />
                        )}

                        {viewMode === "month" && (
                            <MonthView
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate} // Pass setter for month nav
                                appointments={appointmentsData?.appointments}
                                facultyId={facultyMember.id}
                                onDateSelect={handleDateSelect}
                            // isDateAvailable prop removed, handled internally
                            />
                        )}

                        <Button
                            className="h-14 w-full bg-[#FFC629] text-lg font-semibold text-black hover:bg-[#FFC629]/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                            disabled={!selectedAppointment || showBookingDialog} // Disable if dialog is open too
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
                appointment={selectedAppointment} // Pass the selected appointment
                onConfirm={confirmBooking}
            />
        </div>
    )
}
