"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeRange {
  start: string
  end: string
}

interface DayAvailability {
  enabled: boolean
  timeRanges: TimeRange[]
}

export default function WeeklyAvailability() {
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
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Weekly Hours</h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {days.map((day) => (
          <div
            key={day.id}
            className={cn("rounded-lg border border-black p-4", !availability[day.id].enabled && "bg-gray-50")}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${day.id}-switch`}
                  checked={availability[day.id].enabled}
                  onCheckedChange={(checked) => toggleDayEnabled(day.id, checked)}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor={`${day.id}-switch`} className="font-medium">
                  {day.label}
                </Label>
              </div>
            </div>

            {availability[day.id].enabled ? (
              <div className="space-y-3">
                {availability[day.id].timeRanges.map((timeRange, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={timeRange.start}
                      onValueChange={(value) => updateTimeRange(day.id, index, "start", value)}
                    >
                      <SelectTrigger className="w-[90px] border-black">
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
                    <span>-</span>
                    <Select
                      value={timeRange.end}
                      onValueChange={(value) => updateTimeRange(day.id, index, "end", value)}
                    >
                      <SelectTrigger className="w-[90px] border-black">
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
                      disabled={availability[day.id].timeRanges.length === 1}
                      className="h-8 w-8 rounded-full p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={() => addTimeRange(day.id)} className="mt-2 border-black">
                  <Plus className="mr-1 h-4 w-4" />
                  Add time
                </Button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Unavailable</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

