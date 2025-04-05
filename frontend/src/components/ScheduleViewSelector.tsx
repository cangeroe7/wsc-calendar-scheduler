import { Button } from "@/components/ui/button"
import { Calendar, CalendarDays, CalendarRange } from "lucide-react"

export type ViewMode = "day" | "week" | "month";

interface ScheduleViewSelectorProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function ScheduleViewSelector({ viewMode, onViewModeChange }: ScheduleViewSelectorProps) {
    return (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <Button
                variant="ghost"
                size="sm"
                className={`rounded-md ${viewMode === "day" ? "bg-white shadow-sm" : ""}`}
                onClick={() => onViewModeChange("day")}
            >
                <Calendar className="h-4 w-4 mr-2" />
                Day
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`rounded-md ${viewMode === "week" ? "bg-white shadow-sm" : ""}`}
                onClick={() => onViewModeChange("week")}
            >
                <CalendarDays className="h-4 w-4 mr-2" />
                Week
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`rounded-md ${viewMode === "month" ? "bg-white shadow-sm" : ""}`}
                onClick={() => onViewModeChange("month")}
            >
                <CalendarRange className="h-4 w-4 mr-2" />
                Month
            </Button>
        </div>
    )
}
