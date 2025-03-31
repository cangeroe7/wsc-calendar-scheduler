import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
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
            <Link to="/about" className="[&.active]:font-bold">
                About
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
