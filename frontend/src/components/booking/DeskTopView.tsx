import { Button } from "../ui/button"
import { format } from "date-fns"
import { TimezoneSelector } from "../TimeZoneSelector"
import { BackButton } from "./BackButton"
import { LoadingSpinner } from "../ui/loading-spinner"
import { MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TimeSlots from "./time-slots"
import { AppointmentEventDated } from "@server/sharedTypes"
import { useNavigate } from "@tanstack/react-router"
import type { Faculty } from "@server/sharedTypes"
import TruncatedText from "../TruncatedText"
import CalendarView from "./calendar-view"
interface TimeRange {
    start: string
    end: string
}

type DesktopBookingProps = {
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

export function DesktopBooking({ props }: { props: DesktopBookingProps }) {

    const { expanded, selectedDate, selectedTime, setSelectedTime, isLoadingDay, isFetchingDay, event, dayAvailability, facultyIdentifier, eventIdentifier, date, back, facultyMember, handlePreviousMonth, handleNextMonth, currentMonth, effectiveStart, isLoading, isFetching, monthAvailability, handleDateSelect } = props
    const navigate = useNavigate();

    return (

        /* Desktop Layout (> 1000px) */
        <div className="flex">
            {/* Left Panel - Host Information */}
            <div className="w-[325px] border-r border-gray-300 p-6 bg-primary">
                {/* Desktop back button above other content */}
                {back ? (
                    <div className="mb-4">
                        <BackButton facultyIdentifier={facultyIdentifier} />
                    </div>
                ) : (
                    ""
                )}
                <div className="mb-2">
                    <div className="flex flex-col items-center">
                        <Avatar className="mb-2 h-20 w-20 shadow-black/35 shadow-md">
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
                        <h3 className="text-lg font-medium text-black/75">
                            {facultyMember.name}
                        </h3>
                        <h2 className="mb-6 text-2xl font-bold text-black">
                            {event.name}
                        </h2>
                    </div>
                </div>

                <div className="space-y-4 text-black">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5" />
                        <span>{`${event.durationMinutes} Min`}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5" />
                        <span>{event.location}</span>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <TruncatedText text={event.description ?? ""} limit={150} />
                </div>
            </div>

            {/* Right Panel - Combined Date & Time Selection */}
            <div className="flex flex-1 justify-center transition-all duration-300 ease-in-out">
                {/* Date Selection */}
                <div className="select-none p-6 bg-white">
                    <h2 className="mb-6 text-center text-xl font-semibold text-black">
                        Select a Date & Time
                    </h2>

                    <div className="mb-6 flex items-center justify-between">
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

                    <div className="mt-6">
                        <div className="mb-2 text-sm font-medium text-black">
                            Time zone
                        </div>
                        <TimezoneSelector />
                    </div>
                </div>

                {/* Time Selection - Desktop (side panel) */}
                <div
                    className={`bg-white transition-all duration-300 ease-in-out overflow-hidden ${expanded
                        ? "w-[300px] opacity-100"
                        : "w-0 opacity-0"
                        }`}
                >
                    {selectedDate && (
                        <div className="p-6">
                            <h2 className="mb-4 pt-14 text-md font-medium text-black">
                                Wednesday, September 31
                            </h2>
                            {isLoadingDay ||
                                isFetchingDay ? (
                                <div className="max-h-[370px] overflow-auto">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <>
                                    <div className="max-h-[370px] overflow-auto">
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

                                    <div className="mt-auto pt-4.5">
                                        <Button
                                            className="shadow-md w-full cursor-pointer"
                                            onClick={() =>
                                                navigate({
                                                    to: "/$facultyIdentifier/$eventIdentifier/$appointmentDatetime",
                                                    params: {
                                                        facultyIdentifier:
                                                            facultyIdentifier,
                                                        eventIdentifier:
                                                            eventIdentifier,
                                                        appointmentDatetime: `${date}T${selectedTime}`,
                                                    },
                                                })
                                            }
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
            </div>
        </div>
    )

}
