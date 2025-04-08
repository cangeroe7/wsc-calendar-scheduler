"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import DateRangePicker from "./date-range-picker"
import WeeklyAvailabilityCompact from "./weekly-availability-compact"

export default function AdminScheduling() {
  const [dateRangeOption, setDateRangeOption] = useState("amount")
  const [dateAmount, setDateAmount] = useState("30")
  const [dateType, setDateType] = useState("calendar")
  const [appointmentLength, setAppointmentLength] = useState("30")
  const [customLength, setCustomLength] = useState("")
  const [showCustomLength, setShowCustomLength] = useState(false)
  const [showDateRangePicker, setShowDateRangePicker] = useState(false)

  useEffect(() => {
    // Auto-open date picker when that option is selected
    setShowDateRangePicker(dateRangeOption === "range")
  }, [dateRangeOption])

  const handleDateRangeOptionChange = (value: string) => {
    setDateRangeOption(value)
  }

  const handleAppointmentLengthChange = (value: string) => {
    setAppointmentLength(value)
    if (value === "custom") {
      setShowCustomLength(true)
    } else {
      setShowCustomLength(false)
    }
  }

  const handleDateRangePickerClose = () => {
    setShowDateRangePicker(false)
  }

  return (
    <Card className="border-black">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-black">Availability Settings</h2>

        <Separator className="my-6 bg-black/20" />

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Date Range</h3>
          <RadioGroup value={dateRangeOption} onValueChange={handleDateRangeOptionChange} className="space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="amount" id="amount" />
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  value={dateAmount}
                  onChange={(e) => setDateAmount(e.target.value)}
                  className="w-20 border-black"
                  min="1"
                />
                <Select value={dateType} onValueChange={setDateType}>
                  <SelectTrigger className="w-[180px] border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendar">calendar days</SelectItem>
                    <SelectItem value="weekday">weekdays</SelectItem>
                  </SelectContent>
                </Select>
                <span>into the future</span>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="range" id="range" className="mt-1" />
              <div>
                <Label htmlFor="range" className="inline-block">
                  Within a date range
                </Label>
                <div className="mt-2 w-[180px]">
                  {dateRangeOption === "range" && (
                    <DateRangePicker autoOpen={showDateRangePicker} onClose={handleDateRangePickerClose} />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="indefinite" id="indefinite" />
              <Label htmlFor="indefinite">Indefinitely into the future</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="my-6 bg-black/20" />

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Appointment Length</h3>
          <div className="flex flex-wrap gap-3">
            {["15", "30", "45", "60", "custom"].map((length) => (
              <Button
                key={length}
                type="button"
                variant={appointmentLength === length ? "default" : "outline"}
                className={`h-12 px-6 ${
                  appointmentLength === length
                    ? "bg-primary text-black hover:bg-primary/90"
                    : "border-black text-black hover:bg-secondary"
                }`}
                onClick={() => handleAppointmentLengthChange(length)}
              >
                {length === "custom" ? "Custom" : `${length} min`}
              </Button>
            ))}
          </div>
          {showCustomLength && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={customLength}
                onChange={(e) => setCustomLength(e.target.value)}
                className="w-24 border-black"
                min="1"
                placeholder="Length"
              />
              <span>minutes</span>
            </div>
          )}
        </div>

        <Separator className="my-6 bg-black/20" />

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Weekly Availability</h3>
          <WeeklyAvailabilityCompact />
        </div>
      </CardContent>
    </Card>
  )
}

