import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, CalendarIcon, List } from "lucide-react"
import DateSpecificHoursModal from "./date-specific-hours-modal"
import WeeklyAvailabilityCompact from "./weekly-availability-compact"

export default function ScheduleAdmin() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-2 bg-white rounded-lg p-2 w-fit mx-auto border border-black">
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className={viewMode === "list" ? "bg-primary text-black" : ""}
        >
          <List className="h-4 w-4 mr-2" />
          List View
        </Button>
        <Button
          variant={viewMode === "calendar" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("calendar")}
          className={viewMode === "calendar" ? "bg-primary text-black" : ""}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Calendar View
        </Button>
      </div>

      <Separator className="bg-black/20" />

      <Card className="border-black">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="col-span-3 p-6">
              <h2 className="text-2xl font-bold text-black">Weekly Hours</h2>
              <p className="mt-2 text-gray-600 mb-6">
                Set your default weekly availability. These hours will apply to all dates unless overridden.
              </p>
              <WeeklyAvailabilityCompact />
            </div>

            <div className="col-span-2 border-t lg:border-t-0 lg:border-l border-black/20">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black">Date Specific Hours</h2>
                <p className="mt-2 text-gray-600">
                  Override your availability for specific dates, such as holidays or special events.
                </p>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-4 border-black">
                  <Plus className="mr-2 h-4 w-4" />
                  Add date-specific hours
                </Button>

                <div className="mt-6 text-center text-gray-500 py-8 border border-dashed border-gray-300 rounded-lg">
                  No date-specific overrides yet.
                  <br />
                  Click "Add date-specific hours" to customize specific dates.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DateSpecificHoursModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

