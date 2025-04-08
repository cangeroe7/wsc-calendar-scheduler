import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TimeSlotsProps {
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

export default function TimeSlots({ selectedTime, onSelectTime }: TimeSlotsProps) {
  // Available time slots
  const timeSlots = ["10:00am", "11:00am", "1:00pm", "2:30pm", "4:00pm"]

  return (
    <div className="flex flex-col space-y-3">
      {timeSlots.map((time) => (
        <Button
          key={time}
          variant={time === selectedTime ? "default" : "outline"}
          className={cn(
            "h-12 justify-center text-base font-normal",
            time === selectedTime
              ? "bg-primary text-black hover:bg-primary/90"
              : "border-black text-black hover:bg-secondary",
          )}
          onClick={() => onSelectTime(time)}
        >
          {time}
        </Button>
      ))}

      <Button className="mt-4 bg-primary text-black hover:bg-primary/90 font-semibold" disabled={!selectedTime}>
        Confirm
      </Button>
    </div>
  )
}

