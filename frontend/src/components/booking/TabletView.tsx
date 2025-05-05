import { Button } from "../ui/button"
import { format } from "date-fns"
import { TimezoneSelector } from "../TimeZoneSelector"
import { BackButton } from "./BackButton"
import { LoadingSpinner } from "../ui/loading-spinner"
import { MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TimeSlots from "./time-slots"
import { AppointmentEventDated } from "@server/sharedTypes"
import type { Faculty } from "@server/sharedTypes"
import TruncatedText from "../TruncatedText"
import CalendarView from "./calendar-view"
import { useNavigate } from "@tanstack/react-router"
interface TimeRange {
    start: string
    end: string
}

type TabletBookingProps = {
    expanded: boolean;
    selectedDate: Date | null;
    isLoadingDay: boolean;
    isFetchingDay: boolean;
    selectedTime: string | null;
    setSelectedTime: (value: string) => void;
    event: AppointmentEventDated;
    dayAvailability?: TimeRange[]
    facultyIdentifier: string;
    eventIdentifier: string;
    date: string | null;
    back: boolean;
    facultyMember: Faculty;
    handlePreviousMonth: () => void;
    handleNextMonth: () => void;
    currentMonth: Date;
    effectiveStart: Date;
    isLoading: boolean;
    isFetching: boolean;
    monthAvailability?: Record<string, Array<{ start: string; end: string }>>;
    handleDateSelect: (date: Date) => void;

}

export function TabletBooking({ props }: { props: TabletBookingProps }) {
    const navigate = useNavigate();

    const { expanded, selectedDate, selectedTime, setSelectedTime, isLoadingDay, isFetchingDay, event, dayAvailability, facultyIdentifier, eventIdentifier, date, back, facultyMember, handlePreviousMonth, handleNextMonth, currentMonth, effectiveStart, isLoading, isFetching, monthAvailability, handleDateSelect } = props

    return (

        <div className="flex flex-col">
            {/* Tablet Header with back button at top left */}
            <div className="w-full p-5 bg-primary relative">
                {/* Back button at top left */}
                {back ? (
                    <div className="absolute top-5 left-5 z-10">
                        <BackButton facultyIdentifier={facultyIdentifier} />
                    </div>
                ) : (
                    ""
                )}

                {/* Centered details with padding to avoid overlap with back button */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-4 pt-4">
                        {/* Avatar and Name */}
                        <Avatar className="h-16 w-16 shadow-black/35 shadow-md">
                            <AvatarImage
                                src={
                                    facultyMember.photoUrl ||
                                    ""
                                }
                                alt={facultyMember.name}
                            />
                            <AvatarFallback className="bg-primary text-black">
                                {facultyMember.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h3 className="text-base font-medium text-gray-800">
                                {facultyMember.name}
                            </h3>
                            <h2 className="text-xl font-bold text-black mb-2">
                                {event.name}
                            </h2>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-black text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{`${event.durationMinutes} Min`}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>
                                        {event.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-4">
                    <TruncatedText
                        text={event.description ?? ""}
                        limit={100}
                    />
                </div>
            </div>

            {/* Calendar Section */}
            <div
                className={`flex justify-center select-none bg-white ${expanded ? "flex" : "block px-16"}`}
                    >
                    <div
                        className={`m-6 ${expanded ? "w-1/2 pr-2" : "w-full"}`}
                    >
                        <h2 className="mb-4 text-center text-xl font-semibold text-black">
                            Select a Date & Time
                        </h2>

                        <div className="mb-4 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePreviousMonth}
                                className="border-[2px] border-black/20 text-black hover:bg-black/10 rounded-full disabled:border-[0px] disabled:bg-white enabled:cursor-pointer"
                                disabled={
                                    effectiveStart.getTime() >=
                                    currentMonth.getTime()
                                }
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <span className="text-lg font-medium">
                                {format(
                                    currentMonth,
                                    "MMMM yyyy",
                                )}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextMonth}
                                className="border-[2px] border-black/20 text-black hover:bg-black/10 rounded-full disabled:border-[0px] disabled:bg-white enabled:cursor-pointer"
                                disabled={
                                    new Date(
                                        currentMonth.getFullYear(),
                                        currentMonth.getMonth() +
                                        1,
                                        1,
                                    ) > event.endDate
                                }
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="h-[320px] relative">
                            {isLoading || isFetching ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                    <LoadingSpinner size="xxl" />
                                </div>
                            ) : null}
                            <CalendarView
                                currentMonth={currentMonth}
                                selectedDate={selectedDate}
                                onSelectDate={handleDateSelect}
                                startDate={effectiveStart}
                                endDate={event.endDate}
                                availability={
                                    monthAvailability
                                }
                            />
                        </div>

                        <div className="mt-4">
                            <div className="mb-2 text-sm font-medium text-black">
                                Time zone
                            </div>
                            <TimezoneSelector />
                        </div>
                    </div>

                {/* Tablet Time Selection (side-by-side with calendar when date is selected) */}
                {expanded && selectedDate && (
                    <div className="w-1/2 pl-2 p-6 space-y-0.5">
                        <h2 className="mb-4 text-lg font-medium text-black">
                            {format(
                                selectedDate,
                                "EEEE, MMMM d",
                            )}
                        </h2>
                        {isLoadingDay || isFetchingDay ? (
                            <div className="max-h-[400px] overflow-auto">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <>
                                <div className="max-h-[400px] overflow-auto scrollbar-thin">
                                    <TimeSlots
                                        selectedTime={
                                            selectedTime
                                        }
                                        onSelectTime={
                                            setSelectedTime
                                        }
                                        selectedDate={
                                            selectedDate
                                        }
                                        availability={
                                            dayAvailability
                                        }
                                        minuteIncrement={
                                            event.bookingInterval
                                        }
                                        appointmentLength={
                                            event.durationMinutes
                                        }
                                    />
                                </div>
                                <div className="mt-auto pt-3">
                                    <Button
                                        className="w-full cursor-pointer"
                                        onClick={() => {
                                            navigate({
                                                to: "/$facultyIdentifier/$eventIdentifier/$appointmentDatetime",
                                                params: {
                                                    facultyIdentifier:
                                                        facultyIdentifier,
                                                    eventIdentifier:
                                                        eventIdentifier,
                                                    appointmentDatetime: `${date}T${selectedTime}`,
                                                },
                                            });
                                        }}
                                        disabled={
                                            !selectedTime
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div >
    )
}
