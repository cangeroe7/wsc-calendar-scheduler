import type { Appointment } from "@server/sharedTypes"
import { formatTime } from "@/lib/utils"
import { Button } from "./ui/button"
import { Clock } from "lucide-react"


export function AppointmentSlots({
    appointments,
    selectedAppointment,
    onAppointmentSelect,
}: {
    appointments: Appointment[]
    selectedAppointment: Appointment | null
    onAppointmentSelect: (appointment: Appointment) => void
}) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {appointments.map((appointment) => (
                <Button
                    key={appointment.id}
                    variant={selectedAppointment?.id === appointment.id ? "default" : "outline"}
                    className={`h-16 ${selectedAppointment?.id === appointment.id ? "bg-[#FFC629] text-black hover:bg-[#FFC629]/90" : "border-2"
                        }`}
                    onClick={() => onAppointmentSelect(appointment)}
                >
                    <div className="flex flex-col items-center gap-1">
                        <Clock className="h-5 w-5 mb-1" />
                        <span className="text-sm font-medium">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </span>
                    </div>
                </Button>
            ))}
        </div>
    )
}
