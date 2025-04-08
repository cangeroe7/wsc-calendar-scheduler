"use client"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

interface DateSpecificHoursModalProps {
  isOpen: boolean
  onClose: () => void
}

interface TimeRange {
  start: string
  end: string
}

interface DateOverride {
  date: Date
  isBlocked: boolean
  timeRanges: TimeRange[]
}

export default function DateSpecificHoursModal({ isOpen, onClose }: DateSpecificHoursModalProps) {
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

  // Reset selected date when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined)
    }
  }, [isOpen])

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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)

    if (!dateOverrides.some((override) => isSameDay(override.date, date))) {
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

  const handleSave = () => {
    // Here you would save the date overrides to your backend
    console.log("Date overrides:", dateOverrides)
    onClose()
  }

  const selectedOverride = getSelectedDateOverride()

  // Simulate booked appointments
  const bookedAppointments = [
    new Date(2025, 3, 15), // April 15, 2025
    new Date(2025, 3, 16), // April 16, 2025
    new Date(2025, 3, 20), // April 20, 2025
  ]

  // Custom calendar component
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    })

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="border-black">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <h3 className="text-xl font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
          <Button variant="outline" size="sm" onClick={handleNextMonth} className="border-black">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-medium text-sm text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isBooked = bookedAppointments.some((d) => isSameDay(d, day))
            const isUnavailable = dateOverrides.some((d) => isSameDay(d.date, day) && d.isBlocked)
            const isCustomHours = dateOverrides.some((d) => isSameDay(d.date, day) && !d.isBlocked)

            return (
              <div
                key={i}
                className={cn("relative h-12 flex items-center justify-center", !isCurrentMonth && "opacity-30")}
              >
                <button
                  type="button"
                  disabled={!isCurrentMonth}
                  onClick={() => isCurrentMonth && handleDateSelect(day)}
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isSelected && "ring-2 ring-black",
                    isBooked && !isSelected && "bg-primary/20",
                    isUnavailable && "bg-red-200",
                    isCustomHours && "bg-primary/60",
                    isCurrentMonth &&
                      !isSelected &&
                      !isBooked &&
                      !isUnavailable &&
                      !isCustomHours &&
                      "hover:bg-gray-100",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm",
                      isUnavailable && "text-red-800",
                      isCustomHours && "text-black font-medium",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-primary/20"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-primary/60"></div>
            <span className="text-sm">Custom Hours</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-red-200"></div>
            <span className="text-sm">Unavailable</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Date-Specific Hours</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 py-6">
          <div className="border-r pr-6">{renderCalendar()}</div>

          <div>
            {selectedDate ? (
              <div className="space-y-6">
                <h4 className="text-xl font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h4>

                <div className="flex items-center space-x-4">
                  <Button
                    variant={selectedOverride?.isBlocked ? "default" : "outline"}
                    className={cn(
                      "border-black flex-1",
                      selectedOverride?.isBlocked && "bg-red-500 text-white hover:bg-red-600",
                    )}
                    onClick={() => toggleDateBlocked(true)}
                  >
                    Unavailable
                  </Button>

                  <Button
                    variant={!selectedOverride?.isBlocked ? "default" : "outline"}
                    className={cn(
                      "border-black flex-1",
                      !selectedOverride?.isBlocked && "bg-primary text-black hover:bg-primary/90",
                    )}
                    onClick={() => toggleDateBlocked(false)}
                  >
                    Custom Hours
                  </Button>
                </div>

                {selectedOverride && !selectedOverride.isBlocked && (
                  <div className="space-y-4 pt-2">
                    <h5 className="font-medium">Available Time Slots</h5>

                    {selectedOverride.timeRanges.map((timeRange, index) => (
                      <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <Select
                          value={timeRange.start}
                          onValueChange={(value) => updateTimeRange(index, "start", value)}
                        >
                          <SelectTrigger className="w-[110px] border-black">
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
                        <span className="mx-3">to</span>
                        <Select value={timeRange.end} onValueChange={(value) => updateTimeRange(index, "end", value)}>
                          <SelectTrigger className="w-[110px] border-black">
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

                    <Button variant="outline" size="sm" onClick={addTimeRange} className="mt-2 border-black w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add another time slot
                    </Button>
                  </div>
                )}

                {selectedOverride && selectedOverride.isBlocked && (
                  <div className="bg-red-50 p-4 rounded-lg mt-4">
                    <p className="text-red-800">
                      This date will be marked as unavailable. No appointments can be booked.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center p-8 bg-gray-50 rounded-lg max-w-md">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-medium mb-2">Select a Date</h4>
                  <p className="text-gray-600">
                    Choose a date from the calendar to customize availability or mark as unavailable.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-black">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-black hover:bg-primary/90">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

