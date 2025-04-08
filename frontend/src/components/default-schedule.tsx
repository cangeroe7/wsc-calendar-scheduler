"use client"
import WeeklyAvailabilityCompact from "./weekly-availability-compact"

export default function DefaultSchedule() {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Set your default weekly availability. These hours will apply to all dates unless overridden by date-specific
        settings.
      </p>
      <WeeklyAvailabilityCompact />
    </div>
  )
}

