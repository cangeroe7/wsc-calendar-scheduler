import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { userQueryOptions } from '@/lib/api';
import { DashboardHeader } from '@/components/DashboardHeader';
import { capitalize } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    loader: async ({ context }) => {

        try {
            const userData = await context.queryClient.fetchQuery(userQueryOptions);
            return { user: userData?.user ?? null }
        } catch (error) {
            throw new Response("Internal server error", { status: 500 });
        }
    },
    component: Root
});

function Root() {
    const isMobile = useMediaQuery("(max-width: 650px)");
    const { user } = Route.useLoaderData();
    return (
        <div className="relative min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url("/Wildcat.jpg")` }}>
            <div className="absolute inset-0 bg-black/4 pointer-events-none"></div>

            <div className="relative z-10 ">
                {!isMobile && <DashboardHeader name={user ? capitalize(user.given_name) + " " + capitalize(user.family_name) : null} />}
                    <Outlet />
            </div>
        </div>
    )
}

