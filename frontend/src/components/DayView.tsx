import { DateSelector } from '@/components/DateSelector'
import { AppointmentSlots } from '@/components/AppointmentSlots'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate } from '@/lib/utils'
import type { Appointment } from '@server/sharedTypes'

interface DayViewProps {
    selectedDate: Date;
    weekDates: Date[];
    appointments: Appointment[] | undefined; // Allow undefined if fetching
    selectedAppointment: Appointment | null;
    onDateSelect: (date: Date) => void;
    onAppointmentSelect: (appointment: Appointment) => void;
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;
    isDateAvailable: (date: Date) => boolean;
}

export function DayView({
    selectedDate,
    weekDates,
    appointments,
    selectedAppointment,
    onDateSelect,
    onAppointmentSelect,
    goToPreviousWeek,
    goToNextWeek,
    isDateAvailable,
}: DayViewProps) {
    return (
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
                    onDateSelect={onDateSelect}
                    isDateAvailable={isDateAvailable}
                />
            </Card>

            <Card className="p-6">
                <h2 className="mb-4 text-xl font-bold">Available Appointments for {formatDate(selectedDate)}</h2>
                {/* Filter appointments for the selected date specifically here */}
                {(() => {
                    const dateAppointments = appointments?.filter(
                        (appointment) =>
                            new Date(appointment.startTime).toDateString() === selectedDate.toDateString()
                    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [];


                    return dateAppointments.length > 0 ? (
                        <AppointmentSlots
                            appointments={dateAppointments}
                            selectedAppointment={selectedAppointment}
                            onAppointmentSelect={onAppointmentSelect}
                        />
                    ) : (
                        <div className="text-center py-12 text-gray-500">No available appointments for this date</div>
                    )
                })()}
            </Card>
        </>
    )
}
