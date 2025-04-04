import { Link } from "@tanstack/react-router"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface NotFoundProps {
    title?: string
    message?: string
    backTo?: {
        href: string
        label: string
    }
}

export default function NotFound({
    title = "404 Not Found",
    message = "The resource you're looking for doesn't exist or has been moved.",
    backTo = {
        href: "/dashboard",
        label: "Back to Dashboard",
    },
}: NotFoundProps) {
    return (
        <div className="min-h-screen bg-[#D8E6E4] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                <p className="text-gray-600 mb-8">{message}</p>

                <Button className="bg-[#FFC629] text-black hover:bg-[#FFC629]/90 w-full" asChild>
                    <Link to={backTo.href}>{backTo.label}</Link>
                </Button>
            </div>
        </div>
    )
}

