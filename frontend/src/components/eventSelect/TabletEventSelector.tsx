import { MapPin, Phone, Mail, Clock, ChevronRight, ArrowLeft } from "lucide-react"
import { AppointmentEventDated } from "@server/sharedTypes"
import { Link, useNavigate } from "@tanstack/react-router"
import type { Faculty } from "@server/sharedTypes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "../ui/loading-spinner";
import { format } from "date-fns";
import { Button } from "../ui/button";

interface TabletEventSelectorProps {
    facultyIdentifier: string;
    facultyMember: Faculty;
    events: AppointmentEventDated[];
    isLoadingEvents?: boolean;
}

export default function TabletEventSelector({
    facultyIdentifier,
    facultyMember,
    events,
    isLoadingEvents = false,
}: TabletEventSelectorProps) {
    const navigate = useNavigate();

    const BackButton = () => (
        <Link to="/dashboard">
            <Button
                variant="ghost"
                size="icon"
                className="flex cursor-pointer rounded-full items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1"
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
    );
    const threeevents = [...events, ...events, ...events, ...events, ...events]

    return (
        <div className="flex flex-col ">
            {/* Tablet Header with back button at top left */}
            <div className="w-full p-5 bg-primary relative">
                {/* Back button at top left */}
                <div className="absolute top-5 left-5 z-10">
                    <BackButton />
                </div>

                {/* Centered details with padding to avoid overlap with back button */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-4 pt-4">
                        {/* Avatar and Name */}
                        <Avatar className="h-16 w-16 shadow-black/35 shadow-md">
                            <AvatarImage
                                src={facultyMember.photoUrl || ""}
                                alt={facultyMember.name}
                            />
                            <AvatarFallback className="bg-primary text-black">
                                {facultyMember.name.split(" ").map((word) => word[0]).join("")}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h3 className="text-base font-medium text-gray-800">
                                {facultyMember.name}
                            </h3>
                            <p className=" font-bold text-black/90 mb-2">
                                {facultyMember.department}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2 text-black/85">
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
            <main className="flex-1 p-4 relative">
                {isLoadingEvents && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 z-10">
                        <LoadingSpinner size="xl" />
                    </div>
                )}

                {events.length === 0 ? (
                    <p className="text-center text-gray-600 mt-10">This faculty member currently has no bookable events.</p>
                ) : (
                    <ul className="space-y-4 overflow-auto max-h-[520px] scrollbar-thin p-1 pr-2">
                        {threeevents.map((ev) => (
                            <li key={ev.id} className="border border-black/30 rounded-lg hover:shadow-md transition-shadow duration-150">
                                <button
                                    type="button"
                                    className="w-full text-left p-4 flex justify-between items-start gap-4 active:bg-black/10 cursor-pointer"
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
                                        <h3 className="text-lg font-medium text-black mb-2">
                                            {ev.name}
                                        </h3>

                                        {/* duration & location stacked */}
                                        <div className="flex flex-col gap-2 text-sm text-black/80 mb-2">
                                            <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                                <Clock className="h-4 w-4" />
                                                {ev.durationMinutes} min
                                            </span>
                                            {ev.location && (
                                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                                    <MapPin className="h-4 w-4" />
                                                    {ev.location}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-xs text-black/70">
                                            {format(ev.startDate, "MMM d, yyyy")} – {format(ev.endDate, "MMM d, yyyy")}
                                        </p>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-black/50 mt-1 flex-shrink-0" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>

    )
}
