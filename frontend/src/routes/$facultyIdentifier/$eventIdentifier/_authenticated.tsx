import { createFileRoute, Outlet } from '@tanstack/react-router'
import { userQueryOptions } from '@/lib/api';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/$facultyIdentifier/$eventIdentifier/_authenticated')({
    beforeLoad: async ({ context }) => {
        const queryClient = context.queryClient;

        try {
            const data = await queryClient.fetchQuery(userQueryOptions);
            return data;
        } catch (e) {
            return { user: null };
        }
    },
    component: Component,
})

function Component() {
    const { user } = Route.useRouteContext();
    console.log(user)
    if (!user) {
        return <Login />;
    }
    return <Outlet />
}

function Login() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#D8E6E4] p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <Calendar className="h-16 w-16 text-[#FFC629]" />
                    <h1 className="text-3xl font-bold tracking-tight text-black">Calendar App</h1>
                    <p className="text-sm text-gray-600">Organize your schedule with ease</p>
                </div>

                <div className="space-y-4 pt-6">
                    <Button className="h-14 w-full bg-[#FFC629] text-lg font-semibold text-black hover:bg-[#FFC629]/90" asChild>
                        <a href="/api/login">Login</a>
                    </Button>

                    <Button
                        className="h-14 w-full border-2 border-[#FFC629] bg-transparent text-lg font-semibold text-black hover:bg-[#FFC629]/10"
                        asChild
                    >
                        <a href="/api/register">Register</a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
