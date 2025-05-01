import type { Appointment } from "@server/sharedTypes"
import { formatDate, formatTime } from "@/lib/utils"


export function AppointmentDetails({ selectedAppointment }: { selectedAppointment: Appointment | null }) {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Appointment Details</h3>
            {selectedAppointment ? (
                <div className="space-y-2">
                    <div className="p-3 bg-[#FFC629]/10 rounded-md border border-[#FFC629]">
                        <div className="font-medium">Selected Date:</div>
                        <div>{formatDate(selectedAppointment.startTime)}</div>
                    </div>
                    <div className="p-3 bg-[#FFC629]/10 rounded-md border border-[#FFC629]">
                        <div className="font-medium">Selected Time:</div>
                        <div>
                            {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 text-center p-4 border border-dashed rounded-md">No appointment selected yet</div>
            )}
        </div>
    )
}
