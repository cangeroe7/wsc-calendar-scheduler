import { Button } from "./ui/button"

export function DateSelector({
    weekDates,
    selectedDate,
    onDateSelect,
    isDateAvailable,
}: {
    weekDates: Date[]
    selectedDate: Date
    onDateSelect: (date: Date) => void
    isDateAvailable: (date: Date) => boolean
}) {
    return (
        <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
                const isAvailable = isDateAvailable(date)
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
                        onClick={() => isAvailable && onDateSelect(date)}
                        disabled={!isAvailable}
                    >
                        <span className="text-sm">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <span className="text-2xl font-bold">{date.getDate()}</span>
                        <span className="text-xs">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                    </Button>
                )
            })}
        </div>
    )
}
