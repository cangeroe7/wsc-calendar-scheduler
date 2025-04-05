import { useState } from "react";
import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import type { Department, Faculty } from "@server/sharedTypes";

import { DashboardHeader } from "@/components/DashboardHeader";
import { SearchBar } from "@/components/SearchBar";
import { FacultyGrid } from "@/components/FacultyGrid";
import { getAllFacultyQueryOptions, userQueryOptions } from "@/lib/api";
import NotFound from "@/components/NotFound";
import { queryClient } from "@/lib/api";
import { departmentEnum } from "@server/db/schema/faculty";
import { capitalize } from "@/lib/utils";


const departments = departmentEnum.enumValues;
async function dashboardLoader() {
    try {
        const userData = await queryClient.fetchQuery(userQueryOptions);
        if (!userData || !userData.user) {
            throw redirect({ to: "/" });
        };

        const facultyData = await queryClient.fetchQuery(getAllFacultyQueryOptions);
        if (!facultyData || !facultyData.faculty) {
            throw notFound();
        }

        return { user: userData.user, facultyMembers: facultyData.faculty }
    } catch (error) {
        throw new Response("Internal server error", { status: 500 });
    }
}

export const Route = createFileRoute('/dashboard/')({
    loader: dashboardLoader,
    component: Dashboard,
    notFoundComponent: () => <NotFound />
})

// Main Dashboard Component
function Dashboard() {
    const navigate = useNavigate();

    const { facultyMembers, user } = Route.useLoaderData();

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
        <div className="min-h-screen bg-[#D8E6E4]">
            {/* Header */}
            <DashboardHeader name={capitalize(user.given_name) + " " + capitalize(user.family_name)} />

            {/* Search and Filter Bar */}
            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                departmentList={departments}
            />

            {/* Main content */}
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Select a Faculty Member</h1>
                <FacultyGrid facultyList={filteredFaculty} onSelectFaculty={handleFacultySelect} />
            </main>
        </div>
    )
}

