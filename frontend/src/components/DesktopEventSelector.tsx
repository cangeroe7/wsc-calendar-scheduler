
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import TruncatedText from "@/components/TruncatedText";
import { BackButton } from "@/components/booking/BackButton";
import type { AppointmentEventDated, Faculty } from "@server/sharedTypes";

interface DesktopEventSelectorProps {
    facultyIdentifier: string;
    facultyMember: Faculty;
    /** All bookable events for this faculty member */
    events: AppointmentEventDated[];
    /** Show a loading overlay while events are fetched */
    isLoadingEvents?: boolean;
}

/**
 * Desktop‑only event–picker that mirrors the visual language of the `DesktopBooking` view
 * but lets a student choose *which* appointment type (event) they want to book.
 */
export default function DesktopEventSelector({
    facultyIdentifier,
    facultyMember,
    events,
    isLoadingEvents = false,
}: DesktopEventSelectorProps) {
    const navigate = useNavigate();

    return (
        <div className="flex w-full max-w-screen-lg shadow-lg border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* LEFT column – faculty details */}
            <div className="w-[325px] bg-primary p-6 border-r border-gray-300 select-none">
                <div className="mb-4">
                    <BackButton facultyIdentifier={facultyIdentifier} />
                </div>

                <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-20 w-20 shadow-md shadow-black/35 mb-2">
                        <AvatarImage src={facultyMember.photoUrl ?? ""} alt={facultyMember.name} />
                        <AvatarFallback className="bg-primary text-black">
                            {facultyMember.name.split(" ").map((w) => w[0]).join("")}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-medium text-black/75">{facultyMember.name}</h3>
                    <h2 className="text-2xl font-bold text-black">Select an Appointment</h2>
                </div>

                <p className="text-sm text-black/80 leading-relaxed">
                    Choose the kind of meeting you want to book with {facultyMember.name}. After picking
                    an appointment type youʼll be able to select a date and time.
                </p>
            </div>

            {/* RIGHT column – list of events */}
            <div className="flex-1 p-6 relative">
                {isLoadingEvents && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <LoadingSpinner size="xl" />
                    </div>
                )}

                <h2 className="text-xl font-semibold text-black mb-6 text-center">Available Appointment Types</h2>

                {events.length === 0 ? (
                    <p className="text-center text-gray-600">This faculty member currently has no bookable events.</p>
                ) : (
                    <ul className="space-y-4 max-h-[540px] overflow-auto px-1 pr-2">
                        {events.map((ev) => (
                            <li
                                key={ev.id}
                                className="border border-gray-300 rounded-lg hover:shadow-md transition-shadow duration-150"
                            >
                                <button
                                    type="button"
                                    className="w-full text-left p-4 flex justify-between items-center gap-4"
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

                                        {ev.description && (
                                            <div className="mt-2 text-black/90">
                                                <TruncatedText text={ev.description} limit={120} />
                                            </div>
                                        )}
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-black/50" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
