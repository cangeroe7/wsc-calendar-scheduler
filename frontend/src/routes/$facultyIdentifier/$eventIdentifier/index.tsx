//TODO: YOU LEFT OFF AT LINE 286
import { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Globe,
    ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CalendarView from "@/components/calendar-view";
import TimeSlots from "@/components/time-slots";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
    eventByIdentifierAndFacultyIdQuery,
    facultyMemberByIdentiferQueryOptions,
    scheduleByEventIdQuery,
} from "@/lib/api";
import { userQueryOptions } from "@/lib/api";
import { Link, notFound, redirect } from "@tanstack/react-router";
import { z } from "zod";
import NotFound from "@/components/NotFound";
import { tryCatch } from "@server/utils/utils";

import { createFileRoute } from "@tanstack/react-router";
import TruncatedText from "@/components/TruncatedText";
import { NotFoundError } from "@/lib/errors";
export const Route = createFileRoute("/$facultyIdentifier/$eventIdentifier/")({
    validateSearch: z.object({
        back: z.any().optional(),
        month: z.string().optional(),
        date: z.string().optional(),
    }),
    loaderDeps: ({ search: { back, month, date } }) => ({
        back,
        month,
        date,
    }),
    loader: async ({ context, params, deps }) => {
        const { facultyIdentifier, eventIdentifier } = params;
        const search = deps;
        const queryClient = context.queryClient;

        // Validate date format
        const dateIsValid =
            !search.date ||
            (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(
                search.date,
            ) &&
                (() => {
                    const date = new Date(search.date);
                    return (
                        !isNaN(date.getTime()) &&
                        search.date === date.toISOString().split("T")[0]
                    );
                })());

        // If date is invalid, redirect to clean URL
        if (search.date && !dateIsValid) {
            const { date, ...cleanSearch } = search;
            throw redirect({
                to: `/$facultyIdentifier/$eventIdentifier`,
                params: params,
                search: cleanSearch,
                replace: true,
            });
        }

        const date = search.date ?? null;

        try {
            // Fetch user data
            const userResult = await tryCatch(
                queryClient.fetchQuery(userQueryOptions),
            );
            if (!userResult.data || !userResult.data.user) {
                throw redirect({ to: "/" });
            }

            const facultyMember = await queryClient.fetchQuery(
                facultyMemberByIdentiferQueryOptions(facultyIdentifier),
            );
            if (!facultyMember) {
                throw notFound();
            }

            const event = await queryClient.fetchQuery(
                eventByIdentifierAndFacultyIdQuery(
                    eventIdentifier,
                    facultyMember.id,
                ),
            );

            if (!event) {
                throw notFound();
            }

            const schedule = await queryClient.fetchQuery(
                scheduleByEventIdQuery(event.id.toString(), search.month),
            );

            if (!schedule) {
                throw notFound();
            }

            const { availability, month } = schedule;

            // Format and validate month
            const monthStr = (() => {
                const d = new Date(month);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            })();

            const monthIsValid =
                !search.month || /^\d{4}-(0[1-9]|1[0-2])$/.test(search.month);

            if ((search.month && !monthIsValid) || search.month !== monthStr) {
                const cleanSearch = { ...search, month: monthStr };
                throw redirect({
                    to: `/$facultyIdentifier/$eventIdentifier`,
                    params: params,
                    search: cleanSearch,
                    replace: true,
                });
            }

            return {
                user: userResult.data,
                facultyIdentifier,
                facultyMember,
                event,
                availability,
                month,
                date,
                back: search.back ? true : false,
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw notFound();
            }

            throw error;
        }
    },
    component: BookingCalendar,
    notFoundComponent: () => <NotFound />,
});

function BookingCalendar() {
    const { back, facultyIdentifier, facultyMember, event, availability, month, date } =
        Route.useLoaderData();

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        date ? new Date(date) : null,
    );
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(
        month ? new Date(month) : new Date(),
    ); // July 2024
    const [expanded, setExpanded] = useState(false);
    const [showTimeOverlay, setShowTimeOverlay] = useState(false);

    const effectiveStart = new Date(Math.max(event.startDate.getTime(), new Date(Date.now()).getTime()))

    // Check if screen is mobile (≤ 650px)
    const isMobile = useMediaQuery("(max-width: 650px)");
    // Check if screen is tablet (≤ 1000px)
    const isTablet = useMediaQuery("(max-width: 1000px)");

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    // Reset selected time when date changes
    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);

        // Add a slight delay before expanding for better animation
        if (!expanded) {
            setTimeout(() => {
                setExpanded(true);
            }, 50);
        }

        // For mobile, show the time overlay
        if (isMobile) {
            setShowTimeOverlay(true);
        }
    };

    // Reset when date is deselected
    useEffect(() => {
        if (!selectedDate && expanded) {
            setExpanded(false);
            setShowTimeOverlay(false);
        }
    }, [selectedDate, expanded]);

    // Handle back button in mobile time overlay
    const handleBackFromTimeOverlay = () => {
        setShowTimeOverlay(false);
        setSelectedDate(null);
    };

    // Shared back button component with consistent styling
    const BackButton = () => (
        <Link to="/$facultyIdentifier" params={{ facultyIdentifier }}>
            <Button
                variant="ghost"
                size="default"
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-2 py-1"
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
    );

    return (
        <div
            className={`flex min-h-screen flex-col items-center ${isMobile ? "bg-white p-0" : "bg-slate-100 p-4"}`}
        >
            <div
                className={`flex justify-center ${isMobile ? "w-full h-screen" : "w-full pt-32"}`}
            >
                {isMobile ? (
                    // Full screen mobile view without Card wrapper
                    <div className="w-full h-full flex flex-col">
                        {/* Mobile Time Overlay */}
                        {showTimeOverlay ? (
                            <div className="p-4 bg-white flex-1">
                                <div className="mb-4 flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBackFromTimeOverlay}
                                        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 mr-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <h2 className="text-lg font-medium text-black">
                                        {format(selectedDate!, "EEEE, MMMM d")}
                                    </h2>
                                </div>
                                <TimeSlots
                                    selectedTime={selectedTime}
                                    onSelectTime={setSelectedTime}
                                    selectedDate={selectedDate}
                                    availability={availability}
                                    minuteIncrement={event.bookingInterval}
                                />
                            </div>
                        ) : (
                            <>
                                {/* Compact Header for Details with back button at top left */}
                                <div className="w-full p-3 bg-secondary relative justify-items-center">
                                    {/* Back button at top left */}
                                    {back ? (
                                        <div className="absolute top-3 left-3 z-10">
                                            <BackButton />
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
                                <div className="select-none p-4 bg-white flex-1">
                                    <h2 className="mb-4 text-center text-xl font-semibold text-black">
                                        Select a Date & Time
                                    </h2>

                                    <div className="mb-4 flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handlePreviousMonth}
                                            className="text-black hover:bg-gray-100"
                                            disabled={effectiveStart.getTime() >= currentMonth.getTime()}
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
                                            className="text-black hover:bg-gray-100"
                                            disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > event.endDate}
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="h-[320px]">
                                        <CalendarView
                                            currentMonth={currentMonth}
                                            selectedDate={selectedDate!}
                                            onSelectDate={handleDateSelect}
                                            startDate={effectiveStart}
                                            endDate={event.endDate}
                                            availability={availability}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-2 text-sm font-medium text-black">
                                            Time zone
                                        </div>
                                        <Select defaultValue="eastern">
                                            <SelectTrigger className="w-full border-black">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    <SelectValue placeholder="Select timezone" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="eastern">
                                                    Eastern time - US & Canada
                                                </SelectItem>
                                                <SelectItem value="central">
                                                    Central time - US & Canada
                                                </SelectItem>
                                                <SelectItem value="mountain">
                                                    Mountain time - US & Canada
                                                </SelectItem>
                                                <SelectItem value="pacific">
                                                    Pacific time - US & Canada
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // Tablet and Desktop views with Card wrapper
                    <div
                        className={`overflow-hidden rounded-lg bg-white  border-gray-300 border-1 shadow-lg transition-all duration-300 ease-in-out 
            ${isTablet ? (expanded ? "w-full max-w-[800px]" : "w-full max-w-[650px]") : expanded ? "w-[800px]" : "w-[800px]"}`}
                    >
                        {/* For tablet: Stacked layout */}
                        {isTablet ? (
                            <div className="flex flex-col">
                                {/* Tablet Header with back button at top left */}
                                <div className="w-full p-5 bg-secondary relative">
                                    {/* Back button at top left */}
                                    {back ? (
                                        <div className="absolute top-5 left-5 z-10">
                                            <BackButton />
                                        </div>

                                    ) : ""}

                                    {/* Centered details with padding to avoid overlap with back button */}
                                    <div className="flex justify-center ">
                                        <div className="flex items-center gap-4 pt-10">
                                            {/* Avatar and Name */}
                                            <Avatar className="h-14 w-14">
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
                                                <h3 className="text-base font-medium text-black">
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
                                </div>

                                {/* Calendar Section */}
                                <div
                                    className={`select-none bg-white p-6 ${expanded ? "flex" : "block px-32"}`}
                                >
                                    <div
                                        className={`p-6 ${expanded ? "w-1/2 pr-2" : "w-full"}`}
                                    >
                                        <h2 className="mb-4 text-center text-xl font-semibold text-black">
                                            Select a Date & Time
                                        </h2>

                                        <div className="mb-4 flex items-center justify-between">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handlePreviousMonth}
                                                className="text-black hover:bg-gray-100"
                                                disabled={effectiveStart.getTime() >= currentMonth.getTime()}
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
                                                className="text-black hover:bg-gray-100"
                                                disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > event.endDate}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="h-[320px] p-4">
                                            <CalendarView
                                                currentMonth={currentMonth}
                                                selectedDate={selectedDate!}
                                                onSelectDate={handleDateSelect}
                                                startDate={effectiveStart}
                                                endDate={event.endDate}
                                                availability={availability}
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <div className="mb-2 text-sm font-medium text-black">
                                                Time zone
                                            </div>
                                            <Select defaultValue="eastern">
                                                <SelectTrigger className="w-full border-black">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4" />
                                                        <SelectValue placeholder="Select timezone" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="eastern">
                                                        Eastern time - US &
                                                        Canada
                                                    </SelectItem>
                                                    <SelectItem value="central">
                                                        Central time - US &
                                                        Canada
                                                    </SelectItem>
                                                    <SelectItem value="mountain">
                                                        Mountain time - US &
                                                        Canada
                                                    </SelectItem>
                                                    <SelectItem value="pacific">
                                                        Pacific time - US &
                                                        Canada
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Tablet Time Selection (side-by-side with calendar when date is selected) */}
                                    {expanded && selectedDate && (
                                        <div className="w-1/2 pl-2 p-6">
                                            <h2 className="mb-4 text-lg font-medium text-black">
                                                {format(
                                                    selectedDate,
                                                    "EEEE, MMMM d",
                                                )}
                                            </h2>
                                            <TimeSlots
                                                selectedTime={selectedTime}
                                                onSelectTime={
                                                    setSelectedTime
                                                }
                                                selectedDate={selectedDate}
                                                availability={availability}
                                                minuteIncrement={event.bookingInterval}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Desktop Layout (> 1000px) */
                            <div className="flex">
                                {/* Left Panel - Host Information */}
                                <div className="w-[325px] border-r border-gray-300 p-6 bg-secondary">
                                    {/* Desktop back button above other content */}
                                    {back ? (

                                        <div className="mb-4">
                                            <BackButton />
                                        </div>
                                    ) : ""}
                                    <div className="mb-2">
                                        <div className="flex flex-col items-center">
                                            <Avatar className="border-3 border-gray-500 mb-2 h-20 w-20">
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
                                            <h3 className="text-lg font-medium text-gray-600">
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
                                        {event.description}
                                    </div>
                                </div>

                                {/* Right Panel - Combined Date & Time Selection */}
                                <div className="flex flex-1 transition-all duration-300 ease-in-out">
                                    {/* Date Selection */}
                                    <div className="p-6 bg-white">
                                        <h2 className="mb-6 text-center text-xl font-semibold text-black">
                                            Select a Date & Time
                                        </h2>

                                        <div className="mb-6 flex items-center justify-between">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handlePreviousMonth}
                                                className="text-black hover:bg-gray-100"
                                                disabled={effectiveStart.getTime() > currentMonth.getTime()}
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
                                                className="bg-primary/40 text-black hover:bg-primary/70"
                                                disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > event.endDate}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="h-[320px]">
                                            <CalendarView
                                                currentMonth={currentMonth}
                                                selectedDate={selectedDate!}
                                                onSelectDate={handleDateSelect}
                                                startDate={effectiveStart}
                                                endDate={event.endDate}
                                                availability={availability}
                                            />
                                        </div>

                                        <div className="mt-6">
                                            <div className="mb-2 text-sm font-medium text-black">
                                                Time zone
                                            </div>
                                            <Select defaultValue="eastern">
                                                <SelectTrigger className="w-full border-black">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4" />
                                                        <SelectValue placeholder="Select timezone" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="eastern">
                                                        Eastern time - US &
                                                        Canada
                                                    </SelectItem>
                                                    <SelectItem value="central">
                                                        Central time - US &
                                                        Canada
                                                    </SelectItem>
                                                    <SelectItem value="mountain">
                                                        Mountain time - US &
                                                        Canada
                                                    </SelectItem>
                                                    <SelectItem value="pacific">
                                                        Pacific time - US &
                                                        Canada
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Time Selection - Desktop (side panel) */}
                                    <div
                                        className={`bg-white transition-all duration-300 ease-in-out overflow-hidden ${expanded
                                            ? "w-[250px] opacity-100"
                                            : "w-0 opacity-0"
                                            }`}
                                    >
                                        {selectedDate && (
                                            <div className="p-6">
                                                <h2 className="mb-6 text-lg font-medium text-black">
                                                    {format(
                                                        selectedDate,
                                                        "EEEE, MMMM d",
                                                    )}
                                                </h2>
                                                <TimeSlots
                                                    selectedTime={selectedTime}
                                                    onSelectTime={
                                                        setSelectedTime
                                                    }
                                                    selectedDate={selectedDate}
                                                    availability={availability}
                                                    minuteIncrement={event.bookingInterval}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
