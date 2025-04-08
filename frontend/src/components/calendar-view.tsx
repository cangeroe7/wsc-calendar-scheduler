"use client"

import { useState, useEffect } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  currentMonth: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export default function CalendarView({ currentMonth, selectedDate, onSelectDate }: CalendarViewProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [availableDates, setAvailableDates] = useState<number[]>([])

  // Generate calendar days for the current month view
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    })

    setCalendarDays(days)

    // Simulate available dates (in a real app, this would come from an API)
    const available = [9, 10, 16, 17, 23, 24, 25, 30, 31]
    setAvailableDates(available)
  }, [currentMonth])

  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 text-center">
        {weekdays.map((day) => (
          <div key={day} className="text-sm font-medium text-black">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, i) => {
          const dayNum = Number.parseInt(format(day, "d"))
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const isAvailable = availableDates.includes(dayNum) && isCurrentMonth

          return (
            <button
              key={i}
              onClick={() => isAvailable && onSelectDate(day)}
              disabled={!isAvailable}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors",
                isCurrentMonth ? "text-black" : "text-gray-400",
                isAvailable && !isSelected && "text-primary hover:bg-secondary",
                isSelected && "bg-primary text-black hover:bg-primary/90",
                !isAvailable && isCurrentMonth && "text-gray-400",
                !isCurrentMonth && "opacity-50",
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

