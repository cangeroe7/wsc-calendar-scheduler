import { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Globe,
    ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { api, queryClient } from "@/lib/api";
import { userQueryOptions } from "@/lib/api";
import { notFound, redirect } from "@tanstack/react-router";
import { z } from "zod";
import NotFound from "@/components/NotFound";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/$facultyIdentifier/$eventIdentifier/")({
    // loader, 
    validateSearch: z.object({
        month: z.string().optional(),
        date: z.string().optional(),
    }),
    loaderDeps: ({ search: { month, date } }) => ({
        month,
        date,
    }),
    loader: async ({ params, deps }) => {

        const { facultyIdentifier, eventIdentifier } = params;
        const search = deps


        // TODO: add a different api call that checks for the correct month, should be the 

        const dateIsValid = !search.date || (
            /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(search.date) &&
            (() => {
                const date = new Date(search.date);
                return !isNaN(date.getTime()) && search.date === date.toISOString().split("T")[0];
            })()
        );

        // If date is invalid, redirect to clean URL
        if (search.date && !dateIsValid) {
            const { date, ...cleanSearch } = search;

            // Throw a redirect that will clean the URL
            throw redirect({
                to: `/$facultyIdentifier/$eventIdentifier`,
                params: {
                    facultyIdentifier,
                    eventIdentifier
                },
                search: cleanSearch,
                replace: true
            });
        }

        const date = search.date ?? null

        try {
            const user = await queryClient.fetchQuery(userQueryOptions);
            if (!user || !user.user) {
                throw redirect({ to: "/" });
            }

            const facultyRes = await api.faculty.identifier[":identifier"].$get({
                param: {
                    identifier: facultyIdentifier,
                },
            });

            if (!facultyRes.ok) {
                throw notFound();
            }

            const facultyMember = await facultyRes.json();

            const eventRes = await api.events.identifier[":identifier"][":facultyId{[0-9]+}"].$get({
                param: {
                    identifier: eventIdentifier,
                    facultyId: facultyMember.id.toString(),
                }
            });

            if (!eventRes.ok) {
                throw notFound();
            }

            const event = await eventRes.json();

            const scheduleRes = await api.schedule.month[":eventId{[0-9]+}"].$get({
                param: {
                    eventId: event.id.toString()
                },
                query: {
                    month: search.month
                }
            });

            if (!scheduleRes.ok) {
                throw Error("Internal server error")
            }

            const { availability, month } = await scheduleRes.json();
            const monthStr = (() => {
                const d = new Date(month);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            })()

            const monthIsValid = !search.month || /^\d{4}-(0[1-9]|1[0-2])$/.test(search.month);

            console.log(search.month);

            if ((search.month && !monthIsValid) || (search.month !== monthStr)) {
                const cleanSearch = { ...search, month: monthStr }

                console.log(cleanSearch)
                // Throw a redirect that will clean the URL
                throw redirect({
                    to: `/$facultyIdentifier/$eventIdentifier`,
                    params: {
                        facultyIdentifier,
                        eventIdentifier
                    },
                    search: cleanSearch,
                    replace: true
                });
            }

            return { user, facultyMember, event, availability, month, date }
        } catch (error) {
            console.log("catch error")
            throw notFound();
        }
    },
    component: BookingCalendar,
    notFoundComponent: () => <NotFound />
});

function BookingCalendar() {

    const { user, facultyMember, event, availability, month, date } = Route.useLoaderData()

    const [selectedDate, setSelectedDate] = useState<Date | null>(date ? new Date(date) : null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(month ? new Date(month) : new Date()); // July 2024
    const [expanded, setExpanded] = useState(false);
    const [showTimeOverlay, setShowTimeOverlay] = useState(false);

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
    };

    // Shared back button component with consistent styling
    const BackButton = () => (
        <Button
            variant="ghost"
            size="default"
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-2 py-1"
        >
            <ArrowLeft className="h-4 w-4" />
        </Button>
    );

    return (
        <div
            className={`flex min-h-screen flex-col items-center justify-center ${isMobile ? "bg-white p-0" : "bg-slate-100 p-4"}`}
        >
            <div
                className={`flex justify-center ${isMobile ? "w-full h-screen" : "w-full"}`}
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
                                />
                            </div>
                        ) : (
                            <>
                                {/* Compact Header for Details with back button at top left */}
                                <div className="w-full p-3 bg-secondary relative justify-items-center">
                                    {/* Back button at top left */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <BackButton />
                                    </div>

                                    {/* Details content with padding to avoid overlap with back button */}
                                    <div className="flex items-start gap-4 pt-10 pl-2">
                                        <div className="flex-1 justify-items-center">
                                            <h3 className="text-base font-medium text-gray-700">
                                                {facultyMember.name}
                                            </h3>
                                            <h2 className="text-xl font-bold text-black mb-2">
                                                {event.name}
                                            </h2>

                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-black text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{event.durationMinutes}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                    </svg>
                                                    <span>Zoom</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar Section */}
                                <div className="p-4 bg-white flex-1">
                                    <h2 className="mb-4 text-center text-xl font-semibold text-black">
                                        Select a Date & Time
                                    </h2>

                                    <div className="mb-4 flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handlePreviousMonth}
                                            className="text-black hover:bg-gray-100"
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
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="h-[280px]">
                                        <CalendarView
                                            currentMonth={currentMonth}
                                            selectedDate={selectedDate!}
                                            onSelectDate={handleDateSelect}
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
                    <Card
                        className={`overflow-hidden rounded-lg border bg-white shadow-lg transition-all duration-300 ease-in-out 
            ${isTablet ? (expanded ? "w-full max-w-[900px]" : "w-full max-w-[650px]") : expanded ? "w-[900px]" : "w-[650px]"}`}
                    >
                        {/* For tablet: Stacked layout */}
                        {isTablet ? (
                            <div className="flex flex-col">
                                {/* Tablet Header with back button at top left */}
                                <div className="w-full p-5 bg-secondary relative">
                                    {/* Back button at top left */}
                                    <div className="absolute top-5 left-5 z-10">
                                        <BackButton />
                                    </div>

                                    {/* Centered details with padding to avoid overlap with back button */}
                                    <div className="flex justify-center">
                                        <div className="flex items-start gap-4 pt-10">
                                            {/* Avatar and Name */}
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage
                                                    src="/placeholder.svg?height=64&width=64"
                                                    alt="Fatima Sy"
                                                />
                                                <AvatarFallback className="bg-primary text-black">
                                                    FS
                                                </AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <div className="flex items-center gap-2 text-black mb-1">
                                                    <div className="h-5 w-5 rounded bg-primary text-black">
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            className="h-5 w-5"
                                                        >
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        ACME Inc.
                                                    </span>
                                                </div>
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
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                        </svg>
                                                        <span>Zoom</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar Section */}
                                <div
                                    className={`p-4 bg-white ${expanded ? "flex" : "block"}`}
                                >
                                    <div
                                        className={`${expanded ? "w-1/2 pr-2" : "w-full"}`}
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
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="h-[280px]">
                                            <CalendarView
                                                currentMonth={currentMonth}
                                                selectedDate={selectedDate!}
                                                onSelectDate={handleDateSelect}
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
                                        <div className="w-1/2 pl-2 border-l">
                                            <h2 className="mb-4 text-lg font-medium text-black">
                                                {format(
                                                    selectedDate,
                                                    "EEEE, MMMM d",
                                                )}
                                            </h2>
                                            <TimeSlots
                                                selectedTime={selectedTime}
                                                onSelectTime={setSelectedTime}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Desktop Layout (> 1000px) */
                            <div className="flex">
                                {/* Left Panel - Host Information */}
                                <div className="w-[325px] border-r p-6 bg-secondary">
                                    {/* Desktop back button above other content */}
                                    <div className="mb-4">
                                        <BackButton />
                                    </div>

                                    <div className="mb-6">
                                        <div className="mb-4 flex items-center gap-2 text-black">
                                            <div className="h-8 w-8 rounded bg-primary text-black">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="h-8 w-8"
                                                >
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                                </svg>
                                            </div>
                                            <span className="text-lg font-medium">
                                                ACME Inc.
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Avatar className="mb-2 h-16 w-16">
                                                <AvatarImage
                                                    src="/placeholder.svg?height=64&width=64"
                                                    alt="Fatima Sy"
                                                />
                                                <AvatarFallback className="bg-primary text-black">
                                                    FS
                                                </AvatarFallback>
                                            </Avatar>
                                            <h3 className="text-lg font-medium text-black">
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
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                            </svg>
                                            <span>Zoom</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <div className="h-4 w-full rounded bg-white/50"></div>
                                        <div className="h-4 w-full rounded bg-white/50"></div>
                                        <div className="h-4 w-full rounded bg-white/50"></div>
                                        <div className="h-4 w-3/4 rounded bg-white/50"></div>
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
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="h-[280px]">
                                            <CalendarView
                                                currentMonth={currentMonth}
                                                selectedDate={selectedDate!}
                                                onSelectDate={handleDateSelect}
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
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}
