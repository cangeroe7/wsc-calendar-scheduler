import { useState } from "react";
import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import type { Department, Faculty } from "@server/sharedTypes";

import { SearchBar } from "@/components/SearchBar";
import { FacultyGrid } from "@/components/FacultyGrid";
import { getAllFacultyQueryOptions, userQueryOptions } from "@/lib/api";
import NotFound from "@/components/NotFound";
import { departmentEnum } from "@server/db/schema/schema";


const departments = departmentEnum.enumValues;

export const Route = createFileRoute('/dashboard/')({
    loader: async ({ context }) => {

        try {
            const userData = await context.queryClient.fetchQuery(userQueryOptions);
            if (!userData || !userData.user) {
                throw redirect({ to: "/" });
            };

            const facultyData = await context.queryClient.fetchQuery(getAllFacultyQueryOptions);
            if (!facultyData || !facultyData.faculty) {
                throw notFound();
            }

            return { user: userData.user, facultyMembers: facultyData.faculty }
        } catch (error) {
            throw new Response("Internal server error", { status: 500 });
        }
    },
    component: Dashboard,
    notFoundComponent: () => <NotFound />
})

// Main Dashboard Component
function Dashboard() {
    const navigate = useNavigate();

    const { facultyMembers } = Route.useLoaderData();

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

    // Filter faculty based on search and department
    const filteredFaculty = facultyMembers.filter((faculty) => {
        const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDepartment = selectedDepartment ? faculty.department === selectedDepartment : true
        return matchesSearch && matchesDepartment
    })

    // Handle faculty selection - navigate to scheduling page
    const handleFacultySelect = (faculty: Faculty) => {
        navigate({ to: `/dashboard/schedule/${faculty.id}` })
    }

    return (
        <div>
            {/* Search and Filter Bar */}
            <div className="sticky top-16 z-11 px-10">
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                    departmentList={departments}
                />
            </div>

            {/* Main content */}
            <main className="relative z-10 h-[calc(100vh-9rem)] mt-16 px-10 pr-7 overflow-y-auto scrollbar-thin scrollbar-thumb-black/50 scrollbar-track-transparent scrollbar-ab" style={{scrollbarGutter: "stable overlay"}}>
                <div className="@container mx-auto">
                    <FacultyGrid facultyList={filteredFaculty} onSelectFaculty={handleFacultySelect} />
                </div>
            </main>
        </div>
    )
}

