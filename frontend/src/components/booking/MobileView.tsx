import { Button } from "../ui/button"
import { format } from "date-fns"
import { TimezoneSelector } from "../TimeZoneSelector"
import { BackButton } from "./BackButton"
import { LoadingSpinner } from "../ui/loading-spinner"
import { ArrowLeft, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
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

type MobileBookingProps = {
    showTimeOverlay: boolean;
    handleBackFromTimeOverlay: () => void;
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

export function MobileBooking({ props }: { props: MobileBookingProps }) {

    const { showTimeOverlay, handleBackFromTimeOverlay, selectedDate, selectedTime, setSelectedTime, isLoadingDay, isFetchingDay, event, dayAvailability, facultyIdentifier, eventIdentifier, date, back, facultyMember, handlePreviousMonth, handleNextMonth, currentMonth, effectiveStart, isLoading, isFetching, monthAvailability, handleDateSelect } = props

    const navigate = useNavigate();
    return (
        // Full screen mobile view without Card wrapper
        <div className="w-full h-full flex flex-col">
            {/* Mobile Time Overlay */}
            {showTimeOverlay ? (
                <div className="flex-1">
                    <div className="mb-4 p-4 bg-primary">
                        <div className="absolute top-3 left-3 z-100">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBackFromTimeOverlay}
                                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 mr-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-lg font-semibold text-black">
                                {format(selectedDate!, "EEEE")}
                            </div>
                            <div className="text-sm text-gray-700">
                                {format(
                                    selectedDate!,
                                    "MMMM d, yyyy",
                                )}
                            </div>
                        </div>
                        <div className="mt-2 w-[280px] mx-auto">
                            <TimezoneSelector />
                        </div>
                    </div>
                    <div className="px-8 ">
                        {isLoadingDay || isFetchingDay ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TimeSlots
                                    selectedTime={selectedTime}
                                    onSelectTime={setSelectedTime}
                                    selectedDate={selectedDate}
                                    availability={dayAvailability
                                    }
                                    minuteIncrement={
                                        event.bookingInterval
                                    }
                                    appointmentLength={
                                        event.durationMinutes
                                    }
                                />
                                <div className="fixed bottom-0 left-0 right-0 px-8 py-3 bg-white shadow-md">
                                    <Button
                                        className="w-full cursor-pointer"
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
                                        disabled={!selectedTime}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Compact Header for Details with back button at top left */}
                    <div className="w-full p-3 bg-primary relative justify-items-center">
                        {/* Back button at top left */}
                        {back ? (
                            <div className="absolute top-3 left-3 z-10">
                                <BackButton facultyIdentifier={facultyIdentifier} />
                            </div>
                        ) : (
                            ""
                        )}
                        {/* Details content with padding to avoid overlap with back button */}
                        <div className="flex-1 justify-items-center">
                            <h3 className="text-base font-medium text-gray-700">
                                {facultyMember.name}
                            </h3>
                            <h2 className="text-xl font-bold text-black mb-1">
                                {event.name}
                            </h2>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-black text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {event.durationMinutes} Min
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5, w-5" />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                            <div className="my-2 mx-6">
                                <TruncatedText
                                    text={event.description ?? ""}
                                    limit={100}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calendar Section */}
                    <div className="select-none p-4 bg-white flex-1 mx-auto max-w-md">
                        <h2 className="mb-4 text-center text-xl font-semibold text-black">
                            Select a Date & Time
                        </h2>

                        <div className="mb-4 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePreviousMonth}
                                className="bg-primary/40 text-black hover:bg-primary/70 rounded-full disabled:bg-white"
                                disabled={
                                    effectiveStart.getTime() >=
                                    currentMonth.getTime()
                                }
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <span className="text-lg font-medium">
                                {format(currentMonth, "MMMM yyyy")}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextMonth}
                                className="bg-primary/40 text-black hover:bg-primary/70 rounded-full disabled:bg-white"
                                disabled={
                                    new Date(
                                        currentMonth.getFullYear(),
                                        currentMonth.getMonth() + 1,
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
                            <div className="mt-4"></div>
                            <div className="mb-2 text-sm font-medium text-black">
                                Time zone
                            </div>
                            <TimezoneSelector />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
