import { MapPin, Phone, Mail, User, Clock, ChevronRight } from "lucide-react"
import { AppointmentEventDated } from "@server/sharedTypes"
import { useNavigate } from "@tanstack/react-router"
import type { Faculty } from "@server/sharedTypes"
import { LoadingSpinner } from "../ui/loading-spinner";
import { format } from "date-fns";

interface DesktopEventSelectorProps {
    facultyIdentifier: string;
    facultyMember: Faculty;
    events: AppointmentEventDated[];
    isLoadingEvents?: boolean;
}

export default function DesktopEventSelector({
    facultyIdentifier,
    facultyMember,
    events,
    isLoadingEvents = false,
}: DesktopEventSelectorProps) {
    const navigate = useNavigate();
    const threeEvents = [...events, ...events, ...events, ...events, ...events, ...events, ...events]

    return (

        /* Desktop Layout (> 1000px) */
        <div className="flex">
            {/* Left Panel - Host Information */}
            <div className="w-[325px] border-r border-gray-300 p-6 bg-primary">
                {/* Desktop back button above other content */}
                <div className="p-4 flex flex-col items-center h-full">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg">
                        {facultyMember.photoUrl ? (
                            <img
                                src={facultyMember.photoUrl || "/placeholder.svg"}
                                alt={facultyMember.name}
                                width={150}
                                height={150}
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#FFC629]">
                                <User className="h-12 w-12 text-black" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-center">{facultyMember.name}</h2>
                    <p className="text-black/85 mb-2 text-lg">{facultyMember.title}</p>
                    <p className="text-black/85 text-center text-lg">{facultyMember.department ?? ""}</p>
                    <div className="mt-2 text-black/85">
                        <p className="mb-1 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {facultyMember.email}
                        </p>
                        {facultyMember.phone && (
                            <p className="mb-1 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {facultyMember.phone}
                            </p>
                        )}
                        {facultyMember.officeLocation && (
                            <p className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {facultyMember.officeLocation}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT column – list of events */}
            <div className="flex-1 p-4 relative bg-white">
                {isLoadingEvents && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 z-10">
                        <LoadingSpinner size="xl" />
                    </div>
                )}

                <h2 className="text-xl font-semibold text-black mb-6 text-center">Available Events</h2>

                {events.length === 0 ? (
                    <p className="text-center text-gray-600">This faculty member currently has no bookable events.</p>
                ) : (
                    <ul
                        className="grid grid-cols-2 gap-4 max-h-[540px] overflow-auto p-2 scrollbar-thin"
                    >
                        {threeEvents.map((ev) => (
                            <li
                                key={ev.id}
                                className="basis-1/2 border border-black/30 rounded-lg hover:shadow-md transition-shadow duration-150"
                            >
                                <button
                                    type="button"
                                    className="w-full text-left p-4 flex justify-between cursor-pointer active:bg-black/10 items-center gap-4"
                                    onClick={() =>
                                        navigate({
                                            to: "/$facultyIdentifier/$eventIdentifier",
                                            params: {
                                                facultyIdentifier,
                                                eventIdentifier: ev.identifier,
                                            },
                                        })
                                    }
                                >
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-black mb-1">
                                            {ev.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/80">
                                            <span className="inline-flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {ev.durationMinutes} min
                                            </span>
                                            {ev.location && (
                                                <span className="inline-flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {ev.location}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-2">
                                                {/* Use event.daysOfWeek or startDate/endDate etc. Here we show date range */}
                                                {`${format(ev.startDate, "MMM d, yyyy")} – ${format(ev.endDate, "MMM d, yyyy")}`}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-black/50" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )

}
