import AdminScheduling from "@/components/admin-scheduling"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/")({
    component: AdminPage
})

function AdminPage() {
    return (
        <div className="min-h-screen bg-secondary/30 p-4 md:p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-black">Scheduling Configuration</h1>
                </div>
                <AdminScheduling />
            </div>
        </div>
    )
}

