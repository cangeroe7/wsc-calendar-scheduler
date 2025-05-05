import { Link } from "@tanstack/react-router"

import { Calendar, LogOut } from "lucide-react"
import { Button } from "./ui/button"


export function DashboardHeader({ name }: { name: string | null }) {
    return (
        <header className="fixed top-0 left-0 right-0 h-20 z-50 pt-6 pb-4 px-10">
            <div className="container mx-auto h-full">
                <div className="flex items-center justify-between h-fit">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-[#FFC629]" />
                        <h1 className="text-2xl font-bold">Calendar App</h1>
                    </div>
                    {name && (
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span>{name}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10  bg-gray-300 shadow-lg" asChild>
                                <Link to="/">
                                    <LogOut className="h-5 w-5 text-black/70" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
