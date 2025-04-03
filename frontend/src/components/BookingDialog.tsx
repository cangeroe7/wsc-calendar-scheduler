import { useState } from "react"

import type { Faculty, Appointment } from "@server/sharedTypes"
import { formatTime, formatDate } from "@/lib/utils";

import {
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
export function BookingDialog({
    isOpen,
    onClose,
    faculty,
    appointment,
    onConfirm,
}: {
    isOpen: boolean
    onClose: () => void
    faculty: Faculty | null
    appointment: Appointment | null
    onConfirm: () => void
}) {
    const [confirmed, setConfirmed] = useState(false)

    const handleConfirm = () => {
        setConfirmed(true)
        onConfirm()
        setTimeout(() => {
            setConfirmed(false)
            onClose()
        }, 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Appointment</DialogTitle>
                    <DialogDescription>Please review your appointment details before confirming.</DialogDescription>
                </DialogHeader>

                {!confirmed ? (
                    <>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <span className="font-medium">Faculty:</span>
                                <span>{faculty?.name}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <span className="font-medium">Department:</span>
                                <span>{faculty?.department ? faculty.department : ""}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <span className="font-medium">Date:</span>
                                <span>{appointment ? formatDate(appointment.startTime) : ""}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <span className="font-medium">Time:</span>
                                <span>
                                    {appointment ? `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}` : ""}
                                </span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <span className="font-medium">Location:</span>
                                <span>{faculty?.officeLocation || "Online"}</span>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button className="bg-[#FFC629] text-black hover:bg-[#FFC629]/90" onClick={handleConfirm}>
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
    )
}
