import { Link } from "@tanstack/react-router"

import { Calendar, User, LogOut } from "lucide-react"
import { Button } from "./ui/button"


export function DashboardHeader({name}: {name: string}) {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-[#FFC629]" />
                        <h1 className="text-2xl font-bold">Calendar App</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC629]">
                                <User className="h-5 w-5 text-black" />
                            </div>
                            <span>{name}</span>
                        </div>
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200" asChild>
                            <Link to="/">
                                <LogOut className="h-5 w-5 text-gray-600" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
