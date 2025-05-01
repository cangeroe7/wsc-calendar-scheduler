import { Button } from "@/components/ui/button"
import { format, parse, addMinutes } from "date-fns"

interface TimeRange {
    start: string // Format: "HH:MM" in 24-hour format
    end: string // Format: "HH:MM" in 24-hour format
}

interface TimeSlotsProps {
    selectedTime: string | null
    onSelectTime: (time: string) => void
    selectedDate: Date | null
    availability?: TimeRange[] // Changed from object to array of TimeRange
    minuteIncrement?: number
    appointmentLength?: number
}

export default function TimeSlots({
    selectedTime,
    onSelectTime,
    selectedDate,
    availability = [], // Changed default from {} to []
    minuteIncrement = 15,
    appointmentLength = 30,
}: TimeSlotsProps) {
    if (!selectedDate) return null

    // Generate time slots based on availability
    const generateTimeSlots = () => {
        const allTimeSlots: { time: string; displayTime: string; group: string }[] = []

        // Direct iteration through the availability array
        availability.forEach((range) => {
            // Parse start and end times
            const startTime = parse(range.start, "HH:mm", new Date())
            const endTime = parse(range.end, "HH:mm", new Date())

            // Calculate how many slots we can fit
            let currentTime = startTime

            while (true) {
                // Check if adding an appointment would exceed the end time
                const appointmentEndTime = addMinutes(currentTime, appointmentLength)
                if (appointmentEndTime > endTime) break

                // Format the time for display and for value
                const timeValue = format(currentTime, "HH:mm")
                const displayTime = format(currentTime, "h:mm a")

                // Determine time group (Morning, Afternoon, Evening)
                let group = "Morning"
                const hour = currentTime.getHours()
                if (hour >= 12 && hour < 17) {
                    group = "Afternoon"
                } else if (hour >= 17) {
                    group = "Evening"
                }

                allTimeSlots.push({ time: timeValue, displayTime, group })

                // Move to next time slot
                currentTime = addMinutes(currentTime, minuteIncrement)
            }
        })

        return allTimeSlots
    }

    const timeSlots = generateTimeSlots()

    // Group time slots by part of day
    const groupedTimeSlots = timeSlots.reduce(
        (acc, slot) => {
            if (!acc[slot.group]) {
                acc[slot.group] = []
            }
            acc[slot.group].push(slot)
            return acc
        },
        {} as Record<string, typeof timeSlots>,
    )

    // If no time slots available
    if (timeSlots.length === 0) {
        return <div className="p-4 text-center text-gray-500">No available time slots for this date.</div>
    }

    const renderTimeGroup = (title: string, slots: typeof timeSlots) => {
        if (!slots || slots.length === 0) return null

        return (
            <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-500">{title}</h3>
                <div className="flex flex-col space-y-2">
                    {slots.map((slot) => (
                        <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "ghost"}
                            className={`text-sm justify-start px-4 py-2 h-auto cursor-pointer ${selectedTime === slot.time ? "bg-primary text-primary-foreground" : "hover:bg-gray-200 text-black border-[1px] border-black/30"
                                }`}
                            onClick={() => onSelectTime(slot.time)}
                        >
                            {slot.displayTime}
                        </Button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="time-slots overflow-y-auto pr-1">
            {renderTimeGroup("Morning", groupedTimeSlots["Morning"])}
            {renderTimeGroup("Afternoon", groupedTimeSlots["Afternoon"])}
            {renderTimeGroup("Evening", groupedTimeSlots["Evening"])}
        </div>
    )
}
