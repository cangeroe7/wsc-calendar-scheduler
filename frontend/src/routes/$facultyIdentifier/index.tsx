import DesktopEventSelector from '@/components/eventSelect/DesktopEventSelector';
import { createFileRoute } from '@tanstack/react-router'
import { notFound } from '@tanstack/react-router';
import { facultyEventsById, facultyMemberByIdentiferQueryOptions } from '@/lib/api';
import NotFound from '@/components/NotFound';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import TabletEventSelector from '@/components/eventSelect/TabletEventSelector';

export const Route = createFileRoute('/$facultyIdentifier/')({
    loader: async ({ context, params }) => {
        const { facultyIdentifier } = params;

        const queryClient = context.queryClient;


        const facultyMember = await queryClient.fetchQuery(
            facultyMemberByIdentiferQueryOptions(facultyIdentifier),
        );

        if (!facultyMember) {
            throw notFound();
        }

        const events = await queryClient.fetchQuery(
            facultyEventsById(facultyMember.id)
        )

        if (!events) {
            throw notFound();
        }

        return { facultyIdentifier, facultyMember, events }
    },
    component: RouteComponent,
    notFoundComponent: () => <NotFound />,
})

function RouteComponent() {

    const isMobile = useMediaQuery("(max-width: 650px)");
    const isTablet = useMediaQuery("(max-width: 1000px)");

    const { facultyIdentifier, facultyMember, events } = Route.useLoaderData();

    return (

        <div
            className={`flex max-h-screen flex-col items-center ${isMobile ? "bg-white p-0" : "p-4"}`}
        >
            <div
                className={`flex justify-center ${isMobile ? "w-full h-screen" : `w-full ${isTablet ? "pt-[12vh]" : "pt-[20vh]"}`} `}
            >
                {isMobile ? (
                    <div>Mobile in Progress</div>
                ) : (

                    <div
                        className={`overflow-hidden rounded-lg bg-white  border-gray-300 border-1 shadow-xl transition-all duration-300 ease-in-out 
            ${isTablet ? ("w-full max-w-[650px]") : "w-[900px]"}`}
                    >
                        {/* For tablet: Stacked layout */}
                        {isTablet ? (
                            <TabletEventSelector
                                facultyIdentifier={facultyIdentifier}
                                facultyMember={facultyMember}
                                events={events}
                            />
                        ) : (
                            <DesktopEventSelector
                                facultyIdentifier={facultyIdentifier}
                                facultyMember={facultyMember}
                                events={events}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
