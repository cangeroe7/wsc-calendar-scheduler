import { useState, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
    dayAvailabilityQuery,
    eventByIdentifierAndFacultyIdQuery,
    facultyMemberByIdentiferQueryOptions,
    scheduleByEventIdQuery,
} from "@/lib/api";
import { userQueryOptions } from "@/lib/api";
import { notFound, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import NotFound from "@/components/NotFound";
import { tryCatch } from "@server/utils/utils";

import { createFileRoute } from "@tanstack/react-router";
import { NotFoundError } from "@/lib/errors";
import { useQuery } from "@tanstack/react-query";
import { MobileBooking } from "@/components/booking/MobileView";
import { TabletBooking } from "@/components/booking/TabletView";
import { DesktopBooking } from "@/components/booking/DeskTopView";
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
            console.log(date);

            return {
                user: userResult.data,
                facultyIdentifier,
                facultyMember,
                eventIdentifier,
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
    const {
        back,
        facultyIdentifier,
        facultyMember,
        eventIdentifier,
        event,
        month,
        date,
    } = Route.useLoaderData();

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        date ? new Date(date) : null,
    );
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(
        month ? new Date(month) : new Date(),
    ); // July 2024
    const [expanded, setExpanded] = useState(!!date);
    const [showTimeOverlay, setShowTimeOverlay] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        navigate({
            to: ".",
            search: (prev) => ({
                ...prev,
                date: selectedDate?.toISOString().slice(0, 10),
            }),
        });
        console.log(selectedDate?.toISOString().slice(0, 10));
    });
    const {
        data: monthData,
        isLoading,
        isFetching,
    } = useQuery({
        ...scheduleByEventIdQuery(
            event.id.toString(),
            `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`,
        ),
        enabled: !!currentMonth,
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 15,
    });

    const {
        data: availability,
        isLoading: isLoadingDay,
        isLoading: isFetchingDay,
    } = useQuery({
        ...dayAvailabilityQuery(
            event.id.toString(),
            selectedDate?.toISOString().slice(0, 10)!,
        ),
        enabled: !!selectedDate,
        staleTime: 1000 * 20,
        gcTime: 1000 * 60,
    });

    const effectiveStart = new Date(
        Math.max(event.startDate.getTime(), new Date(Date.now()).getTime()),
    );

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

    return (
        <div
            className={`flex max-h-screen flex-col items-center ${isMobile ? "bg-white p-0" : "p-4"}`}
        >
            <div
                className={`flex justify-center ${isMobile ? "w-full h-screen" : `w-full ${isTablet ? "pt-[12vh]" : "pt-[20vh]"}`} `}
            >
                {isMobile ? (
                    <MobileBooking props={{
                        showTimeOverlay,
                        handleBackFromTimeOverlay,
                        selectedDate,
                        isLoadingDay,
                        isFetchingDay,
                        selectedTime,
                        setSelectedTime,
                        event,
                        dayAvailability: availability?.availability,
                        facultyIdentifier,
                        eventIdentifier,
                        date,
                        back,
                        facultyMember,
                        handlePreviousMonth,
                        handleNextMonth,
                        currentMonth,
                        effectiveStart,
                        isLoading,
                        isFetching,
                        monthAvailability: monthData?.availability,
                        handleDateSelect,

                    }} />
                ) : (
                    // Tablet and Desktop views with Card wrapper
                    <div
                        className={`overflow-hidden rounded-lg bg-white  border-gray-300 border-1 shadow-lg transition-all duration-300 ease-in-out 
            ${isTablet ? (expanded ? "w-full max-w-[900px]" : "w-full max-w-[650px]") : expanded ? "w-[900px]" : "w-[800px]"}`}
                    >
                        {/* For tablet: Stacked layout */}
                        {isTablet ? (
                            <TabletBooking props={{
                                expanded,
                                selectedDate,
                                isLoadingDay,
                                isFetchingDay,
                                selectedTime,
                                setSelectedTime,
                                event,
                                dayAvailability: availability?.availability,
                                facultyIdentifier,
                                eventIdentifier,
                                date,
                                back,
                                facultyMember,
                                handlePreviousMonth,
                                handleNextMonth,
                                currentMonth,
                                effectiveStart,
                                isLoading,
                                isFetching,
                                monthAvailability: monthData?.availability,
                                handleDateSelect,

                            }} />
                        ) : (
                            /* Desktop Layout (> 1000px) */
                            <DesktopBooking props={{
                                expanded,
                                selectedDate,
                                isLoadingDay,
                                isFetchingDay,
                                selectedTime,
                                setSelectedTime,
                                event,
                                dayAvailability: availability?.availability,
                                facultyIdentifier,
                                eventIdentifier,
                                date,
                                back,
                                facultyMember,
                                handlePreviousMonth,
                                handleNextMonth,
                                currentMonth,
                                effectiveStart,
                                isLoading,
                                isFetching,
                                monthAvailability: monthData?.availability,
                                handleDateSelect,
                            }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
