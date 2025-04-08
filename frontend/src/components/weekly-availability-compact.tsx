import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface TimeRange {
  start: string
  end: string
}

interface DayAvailability {
  enabled: boolean
  timeRanges: TimeRange[]
}

export default function WeeklyAvailabilityCompact() {
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    monday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
    tuesday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
    wednesday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
    thursday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
    friday: { enabled: true, timeRanges: [{ start: "09:00", end: "17:00" }] },
    saturday: { enabled: false, timeRanges: [{ start: "09:00", end: "17:00" }] },
    sunday: { enabled: false, timeRanges: [{ start: "09:00", end: "17:00" }] },
  })

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

  const toggleDayEnabled = (day: string, enabled: boolean) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        enabled,
      },
    })
  }

  const updateTimeRange = (day: string, index: number, field: "start" | "end", value: string) => {
    const newTimeRanges = [...availability[day].timeRanges]
    newTimeRanges[index] = {
      ...newTimeRanges[index],
      [field]: value,
    }

    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        timeRanges: newTimeRanges,
      },
    })
  }

  const addTimeRange = (day: string) => {
    const newTimeRanges = [...availability[day].timeRanges, { start: "09:00", end: "17:00" }]

    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        timeRanges: newTimeRanges,
      },
    })
  }

  const removeTimeRange = (day: string, index: number) => {
    const newTimeRanges = [...availability[day].timeRanges]
    newTimeRanges.splice(index, 1)

    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        timeRanges: newTimeRanges.length ? newTimeRanges : [{ start: "09:00", end: "17:00" }],
      },
    })
  }

  const days = [
    { id: "monday", label: "MON" },
    { id: "tuesday", label: "TUE" },
    { id: "wednesday", label: "WED" },
    { id: "thursday", label: "THU" },
    { id: "friday", label: "FRI" },
    { id: "saturday", label: "SAT" },
    { id: "sunday", label: "SUN" },
  ]

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <div key={day.id} className="border-b border-black/20 pb-4 last:border-b-0 last:pb-0">
          <div className="space-y-3">
            {/* Day header with checkbox and first time slot - always stays at top */}
            <div className="flex flex-wrap items-center">
              <div className="flex items-center mr-4">
                <Switch
                  id={`${day.id}-switch`}
                  checked={availability[day.id].enabled}
                  onCheckedChange={(checked) => toggleDayEnabled(day.id, checked)}
                  className="data-[state=checked]:bg-primary mr-2"
                />
                <Label htmlFor={`${day.id}-switch`} className="font-medium w-12">
                  {day.label}
                </Label>
              </div>

              {availability[day.id].enabled ? (
                <>
                  {/* First time range always with the checkbox */}
                  <div className="flex items-center flex-wrap">
                    <Select
                      value={availability[day.id].timeRanges[0].start}
                      onValueChange={(value) => updateTimeRange(day.id, 0, "start", value)}
                    >
                      <SelectTrigger className="w-[100px] border-black">
                        <SelectValue>{formatTime(availability[day.id].timeRanges[0].start)}</SelectValue>
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
                    <Select
                      value={availability[day.id].timeRanges[0].end}
                      onValueChange={(value) => updateTimeRange(day.id, 0, "end", value)}
                    >
                      <SelectTrigger className="w-[100px] border-black">
                        <SelectValue>{formatTime(availability[day.id].timeRanges[0].end)}</SelectValue>
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
                      onClick={() => removeTimeRange(day.id, 0)}
                      disabled={availability[day.id].timeRanges.length === 1}
                      className="ml-2 h-8 w-8 rounded-full p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => addTimeRange(day.id)}
                      className="ml-1 h-8 w-8 rounded-full p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <span className="ml-2 text-sm text-gray-500">Unavailable</span>
              )}
            </div>

            {/* Additional time ranges */}
            {availability[day.id].enabled && availability[day.id].timeRanges.length > 1 && (
              <div className="pl-[60px] space-y-3">
                {availability[day.id].timeRanges.slice(1).map((timeRange, idx) => {
                  const index = idx + 1 // Adjust index since we're slicing
                  return (
                    <div key={index} className="flex items-center flex-wrap">
                      <Select
                        value={timeRange.start}
                        onValueChange={(value) => updateTimeRange(day.id, index, "start", value)}
                      >
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
                      <Select
                        value={timeRange.end}
                        onValueChange={(value) => updateTimeRange(day.id, index, "end", value)}
                      >
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
                        onClick={() => removeTimeRange(day.id, index)}
                        className="ml-2 h-8 w-8 rounded-full p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

