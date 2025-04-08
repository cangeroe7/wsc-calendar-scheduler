import { useState } from "react"
import { format, addMonths, subMonths, isSameDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeRange {
  start: string
  end: string
}

interface DateOverride {
  date: Date
  isBlocked: boolean
  timeRanges: TimeRange[]
}

export default function DateSpecificHours() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([])

  const timeOptions = [
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
  ]

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "pm" : "am"
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12
    return `${formattedHour}:${minutes}${ampm}`
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)

    if (date && !dateOverrides.some((override) => isSameDay(override.date, date))) {
      setDateOverrides([
        ...dateOverrides,
        {
          date,
          isBlocked: false,
          timeRanges: [{ start: "09:00", end: "17:00" }],
        },
      ])
    }
  }

  const getSelectedDateOverride = () => {
    if (!selectedDate) return null
    return dateOverrides.find((override) => isSameDay(override.date, selectedDate)) || null
  }

  const toggleDateBlocked = (isBlocked: boolean) => {
    if (!selectedDate) return

    setDateOverrides(
      dateOverrides.map((override) => (isSameDay(override.date, selectedDate) ? { ...override, isBlocked } : override)),
    )
  }

  const updateTimeRange = (index: number, field: "start" | "end", value: string) => {
    if (!selectedDate) return

    setDateOverrides(
      dateOverrides.map((override) => {
        if (isSameDay(override.date, selectedDate)) {
          const newTimeRanges = [...override.timeRanges]
          newTimeRanges[index] = {
            ...newTimeRanges[index],
            [field]: value,
          }
          return { ...override, timeRanges: newTimeRanges }
        }
        return override
      }),
    )
  }

  const addTimeRange = () => {
    if (!selectedDate) return

    setDateOverrides(
      dateOverrides.map((override) => {
        if (isSameDay(override.date, selectedDate)) {
          return {
            ...override,
            timeRanges: [...override.timeRanges, { start: "09:00", end: "17:00" }],
          }
        }
        return override
      }),
    )
  }

  const removeTimeRange = (index: number) => {
    if (!selectedDate) return

    setDateOverrides(
      dateOverrides.map((override) => {
        if (isSameDay(override.date, selectedDate)) {
          const newTimeRanges = [...override.timeRanges]
          newTimeRanges.splice(index, 1)
          return {
            ...override,
            timeRanges: newTimeRanges.length ? newTimeRanges : [{ start: "09:00", end: "17:00" }],
          }
        }
        return override
      }),
    )
  }

  const selectedOverride = getSelectedDateOverride()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="text-black">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="text-black">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md border border-black"
          modifiers={{
            blocked: dateOverrides.filter((o) => o.isBlocked).map((o) => o.date),
            custom: dateOverrides.filter((o) => !o.isBlocked).map((o) => o.date),
          }}
          modifiersClassNames={{
            blocked: "bg-red-100 text-gray-500",
            custom: "bg-primary text-black",
          }}
        />
      </div>

      <div>
        {selectedDate ? (
          <div className="space-y-4">
            <h4 className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h4>

            <div className="flex items-center space-x-4">
              <Button
                variant={selectedOverride?.isBlocked ? "default" : "outline"}
                className={cn("border-black", selectedOverride?.isBlocked && "bg-red-500 text-white hover:bg-red-600")}
                onClick={() => toggleDateBlocked(true)}
              >
                Unavailable
              </Button>

              <Button
                variant={!selectedOverride?.isBlocked ? "default" : "outline"}
                className={cn(
                  "border-black",
                  !selectedOverride?.isBlocked && "bg-primary text-black hover:bg-primary/90",
                )}
                onClick={() => toggleDateBlocked(false)}
              >
                Custom Hours
              </Button>
            </div>

            {selectedOverride && !selectedOverride.isBlocked && (
              <div className="space-y-3 pt-2">
                {selectedOverride.timeRanges.map((timeRange, index) => (
                  <div key={index} className="flex items-center">
                    <Select value={timeRange.start} onValueChange={(value) => updateTimeRange(index, "start", value)}>
                      <SelectTrigger className="w-[100px] border-black">
                        <SelectValue>{formatTime(timeRange.start)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="mx-2">-</span>
                    <Select value={timeRange.end} onValueChange={(value) => updateTimeRange(index, "end", value)}>
                      <SelectTrigger className="w-[100px] border-black">
                        <SelectValue>{formatTime(timeRange.end)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeRange(index)}
                      disabled={selectedOverride.timeRanges.length === 1}
                      className="ml-2 h-8 w-8 rounded-full p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addTimeRange} className="mt-2 border-black">
                  <Plus className="mr-1 h-4 w-4" />
                  Add time range
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">Select a date to customize hours</div>
        )}
      </div>
    </div>
  )
}

