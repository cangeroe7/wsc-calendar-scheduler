import { useState } from "react";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Globe,
    MapPin,
    CheckCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createFileRoute } from "@tanstack/react-router";
import { tryCatch } from "@server/utils/utils";
import { Link } from "@tanstack/react-router";
import { notFound, redirect } from "@tanstack/react-router";
import {
    facultyMemberByIdentiferQueryOptions,
    eventByIdentifierAndFacultyIdQuery,
    userQueryOptions,
    createAppointment
} from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import NotFound from "@/components/NotFound";
import TruncatedText from "@/components/TruncatedText";
import { capitalize } from "@/lib/utils";

export const Route = createFileRoute("/$facultyIdentifier/$eventIdentifier/_authenticated/$appointmentDatetime")({
    loader: async ({ context, params }) => {
        const { facultyIdentifier, eventIdentifier, appointmentDatetime } = params;
        const queryClient = context.queryClient;


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

            // Parse the appointment datetime
            const appointmentStart = new Date(appointmentDatetime);
            if (isNaN(appointmentStart.getTime())) {
                throw notFound();
            }

            // Calculate end time based on duration
            const appointmentEnd = new Date(appointmentStart);
            appointmentEnd.setMinutes(appointmentEnd.getMinutes() + event.durationMinutes);

            return {
                user: userResult.data,
                facultyIdentifier,
                facultyMember,
                eventIdentifier,
                event,
                appointmentStart,
                appointmentEnd
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw notFound();
            }
            throw error;
        }
    },
    component: ConfirmAppointment,
    notFoundComponent: () => <NotFound />
});

function ConfirmAppointment() {
    const {
        facultyIdentifier,
        facultyMember,
        eventIdentifier,
        event,
        appointmentStart,
        appointmentEnd
    } = Route.useLoaderData();
    const { user } = Route.useRouteContext()

    const [title, setTitle] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);


    // Check if screen is mobile (≤ 650px)
    const isMobile = useMediaQuery("(max-width: 650px)");
    // Check if screen is tablet (≤ 1000px)
    const isTablet = useMediaQuery("(max-width: 1000px)");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const appointmentDetails = {
                eventId: event.id,
                facultyId: facultyMember.id,
                title: title ?? `Appointment with ${capitalize(user!.given_name) + " " + capitalize(user!.family_name)}`,
                description,
                startTime: appointmentStart,
                endTime: appointmentEnd,
            }
            // Simulating API call for booking confirmation
            const createAppointmentResult = await tryCatch(createAppointment({ value: appointmentDetails }))

            if (createAppointmentResult.error) {
                throw Error(createAppointmentResult.error.message)

            }

            if (!createAppointmentResult.data) {
                setIsSuccess(false);
            }

            setIsSuccess(true);
        } catch (error) {
            throw error
        } finally {
            setIsSubmitting(false);
        }
    }

    const formatTime = (date: Date) => {
        return format(date, "h:mm a");
    };

    const formatDate = (date: Date) => {
        return format(date, "EEEE, MMMM d, yyyy");
    };

    // Shared back button component with consistent styling
    const BackButton = () => (
        <Link to="/$facultyIdentifier/$eventIdentifier"
            params={{ facultyIdentifier, eventIdentifier }}
            search={{ back: true, date: format(appointmentStart, "yyyy-MM-dd") }}>
            <Button
                variant="ghost"
                size="default"
                className="flex rounded-b-full items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1"
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
    );

    return (
        <div className={`flex min-h-screen flex-col items-center ${isMobile ? "bg-white" : "p-4"}`}>
            <div className={`flex justify-center ${isMobile ? "w-full h-screen" : "w-full pt-32"}`}>
                {isMobile ? (
                    // Mobile layout
                    <div className="w-full h-full flex flex-col">
                        {/* Mobile Header */}
                        <div className="w-full p-3 bg-primary relative">
                            <div className="absolute top-3 left-3 z-10">
                                <BackButton />
                            </div>
                            <div className="text-center pt-8">
                                <h2 className="text-xl font-bold text-black mb-1">
                                    Confirm Appointment
                                </h2>
                            </div>
                        </div>

                        {isSuccess ? (
                            // Success message
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-bold text-black mb-2">Appointment Confirmed!</h3>
                                <p className="text-gray-600">
                                    Your appointment has been successfully scheduled.
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto">
                                {/* Appointment details */}
                                <div className="px-4 py-4 border-b">
                                    <h3 className="font-medium text-gray-700 mb-1">
                                        {facultyMember.name}
                                    </h3>
                                    <h2 className="text-lg font-bold text-black mb-3">
                                        {event.name}
                                    </h2>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-gray-600" />
                                            <span>{formatDate(appointmentStart)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-gray-600" />
                                            <span>{formatTime(appointmentStart)} - {formatTime(appointmentEnd)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-gray-600" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-gray-600" />
                                            <span>Eastern time - US & Canada</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form for course and description */}
                                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <Input
                                            value={title ?? ""}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter title"
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            What would you like to discuss?
                                        </label>
                                        <Textarea
                                            value={description ?? ""}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Briefly describe what you'd like to discuss during this appointment"
                                            className="w-full min-h-32"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-6"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Confirming..." : "Confirm Appointment"}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    // Tablet and Desktop views
                    <div className={`overflow-auto scrollbar-thin scrollbar-thumb-black/50  scrollbar-track-white/0 rounded-lg bg-white border-gray-300 border-1 shadow-lg 
                        ${isTablet ? "w-full max-w-[700px] h-[calc(100vh-6rem)]" : "w-[900px]"}`}>

                        {/* Conditional rendering for success state */}
                        {isSuccess ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <CheckCircle className="h-20 w-20 text-green-600 mb-6" />
                                <h2 className="text-2xl font-bold text-black mb-3">
                                    Appointment Successfully Scheduled!
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Your appointment with {facultyMember.name} has been confirmed.
                                </p>
                                <p className="text-gray-500">
                                    You will be redirected to the faculty page shortly...
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {/* Header with title and back button */}
                                <div className="sticky top-0 z-10 p-5 bg-primary">
                                    <div className="absolute top-5 left-5">
                                        <BackButton />
                                    </div>
                                    <h2 className="text-xl font-bold text-center text-black">
                                        Confirm Your Appointment
                                    </h2>
                                </div>

                                <div className={`flex ${isTablet ? "flex-col" : "flex-row"}`}>
                                    {/* Appointment details panel */}
                                    <div className={`p-6 ${isTablet ? "border-b" : "border-r"} border-gray-300 
                                        ${isTablet ? "w-full" : "w-1/2"}`}>
                                        <div className="flex items-center gap-4 mb-6">
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage
                                                    src={facultyMember.photoUrl || ""}
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
                                                <h3 className="text-base font-medium text-gray-700">
                                                    {facultyMember.name}
                                                </h3>
                                                <h2 className="text-xl font-bold text-black">
                                                    {event.name}
                                                </h2>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-gray-600" />
                                                <span className="text-black">{formatDate(appointmentStart)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-gray-600" />
                                                <span className="text-black">
                                                    {formatTime(appointmentStart)} - {formatTime(appointmentEnd)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-5 w-5 text-gray-600" />
                                                <span className="text-black">{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Globe className="h-5 w-5 text-gray-600" />
                                                <span className="text-black">Eastern time - US & Canada</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 text-gray-700">
                                            <TruncatedText
                                                text={event.description || "No description provided."}
                                                limit={200}
                                            />
                                        </div>
                                    </div>

                                    {/* Form panel */}
                                    <div className={`p-6 ${isTablet ? "w-full" : "w-1/2"}`}>
                                        <h3 className="text-lg font-medium text-black mb-6">
                                            Additional Information
                                        </h3>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Title
                                                </label>
                                                <Input
                                                    value={title ?? ""}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Enter title"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    What would you like to discuss?
                                                </label>
                                                <Textarea
                                                    value={description ?? ""}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Briefly describe what you'd like to discuss during this appointment"
                                                    className="w-full min-h-36"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full mt-8"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Confirming..." : "Confirm Appointment"}
                                            </Button>
                                        </form>
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
