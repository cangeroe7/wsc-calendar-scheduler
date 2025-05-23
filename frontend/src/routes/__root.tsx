import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Root
});

function Root() {
    return (
        <>
            <NavBar />
            <hr />
            <Outlet />
            <TanStackRouterDevtools />
        </>
    )
}

function NavBar() {
    return (
        <div className="p-2 flex gap-2">
            <Link to="/" className="[&.active]:font-bold">
                Home
            </Link>{' '}
            <Link to="/admin/availability/schedule" className="[&.active]:font-bold">
                Schedule
            </Link>
            <Link to="/admin/availability/schedule/1" className="[&.active]:font-bold">
                ScheduleID
            </Link>
            <Link to="/daagoum1/test-identifier" className="[&.active]:font-bold">
                Agoumba schedule page
            </Link>
            <Link to="/dashboard" className="[&.active]:font-bold">
                Dashboard
            </Link>
            <Link to="/admin" className="[&.active]:font-bold">
                Admin
            </Link>
        </div>

    )
}
