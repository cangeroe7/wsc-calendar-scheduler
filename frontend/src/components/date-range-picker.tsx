import { useState, useEffect, useRef } from "react"
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  autoOpen?: boolean
  onClose?: () => void
}

export default function DateRangePicker({ autoOpen = false, onClose }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [nextMonth, setNextMonth] = useState<Date>(addMonths(new Date(), 1))
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsOpen(autoOpen)
  }, [autoOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (onClose) onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date)
      setEndDate(null)
    } else {
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
    }
  }

  const handleMouseEnter = (date: Date) => {
    if (startDate && !endDate) {
      setHoverDate(date)
    }
  }

  const handleMouseLeave = () => {
    setHoverDate(null)
  }

  const isInRange = (date: Date) => {
    if (startDate && endDate) {
      return isWithinInterval(date, { start: startDate, end: endDate })
    }
    if (startDate && hoverDate) {
      if (hoverDate < startDate) {
        return isWithinInterval(date, { start: hoverDate, end: startDate })
      }
      return isWithinInterval(date, { start: startDate, end: hoverDate })
    }
    return false
  }

  const renderCalendarMonth = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    })

    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    return (
      <div className="w-full">
        <div className="mb-2 text-center text-lg font-medium">{format(month, "MMMM yyyy")}</div>
        <div className="mb-1 grid grid-cols-7 text-center">
          {weekdays.map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, month)
            const isSelected = (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate))
            const isRangeDate = isInRange(day) && !isSelected

            return (
              <button
                key={i}
                type="button"
                disabled={!isCurrentMonth}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                  !isCurrentMonth && "invisible",
                  isSelected && "bg-primary text-black",
                  isRangeDate && "bg-secondary",
                  !isSelected && !isRangeDate && isCurrentMonth && "hover:bg-secondary/50",
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

  const handlePreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1))
    setNextMonth(addMonths(nextMonth, -1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
    setNextMonth(addMonths(nextMonth, 1))
  }

  const handleApply = () => {
    if (startDate && endDate) {
      setIsOpen(false)
      if (onClose) onClose()
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start border-black text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {startDate && endDate
          ? `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
          : "Select date range"}
      </Button>

      {isOpen && (
        <div
          ref={calendarRef}
          className="fixed left-auto z-50 mt-2 w-auto rounded-lg border border-black bg-white p-4 shadow-lg"
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            zIndex: 50,
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {renderCalendarMonth(currentMonth)}
            {renderCalendarMonth(nextMonth)}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} className="border-black">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!startDate || !endDate}
              className="bg-primary text-black hover:bg-primary/90"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

