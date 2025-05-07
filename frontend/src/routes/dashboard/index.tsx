import { useEffect, useState } from "react";
import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import type { Department, Faculty } from "@server/sharedTypes";

import { SearchBar } from "@/components/SearchBar";
import { FacultyGrid } from "@/components/FacultyGrid";
import { getAllFacultyQueryOptions, userQueryOptions } from "@/lib/api";
import NotFound from "@/components/NotFound";
import { departmentEnum } from "@server/db/schema/schema";
import { z } from "zod";

const departments = departmentEnum.enumValues;

export const Route = createFileRoute('/dashboard/')({
    validateSearch: z.object({
        q: z.string().optional().transform((val) => val ? val : undefined),
        department: z
            .string()
            .optional()
            .transform((val) =>
                val && departmentEnum.enumValues.includes(val as Department) ? val as Department : undefined
            ),
    }),
    loaderDeps: ({ search: { q, department } }) => ({
        q,
        department,
    }),
    loader: async ({ context, deps }) => {

        try {
            const userData = await context.queryClient.fetchQuery(userQueryOptions);
            if (!userData || !userData.user) {
                throw redirect({ to: "/" });
            };

            const facultyData = await context.queryClient.fetchQuery(getAllFacultyQueryOptions);
            if (!facultyData || !facultyData.faculty) {
                throw notFound();
            }

            return { user: userData.user, facultyMembers: facultyData.faculty, ...deps }
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

    const { facultyMembers, q, department } = Route.useLoaderData();

    const [searchQuery, setSearchQuery] = useState(q ?? "")
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(department ?? null)

    useEffect(() => {
        navigate({
            to: ".",
            search: {
                q: searchQuery,
                department: selectedDepartment ?? "",
            },
            replace: true, // avoid pushing history every keystroke
        });
    }, [searchQuery, selectedDepartment]);

    // Filter faculty based on search and department
    const filteredFaculty = facultyMembers.filter((faculty) => {
        const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDepartment = selectedDepartment ? faculty.department === selectedDepartment : true
        return matchesSearch && matchesDepartment
    })

    // Handle faculty selection - navigate to scheduling page
    const handleFacultySelect = (faculty: Faculty) => {
        navigate({ to: `/${faculty.email.split("@")[0]}` })
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
            <main className="relative z-10 h-[calc(100vh-9rem)] mt-16 px-10 pr-7 overflow-y-auto scrollbar-thin scrollbar-thumb-black/50 scrollbar-track-transparent scrollbar-ab">
                <div className="@container py-4 flex justify-center">
                    <FacultyGrid facultyList={filteredFaculty} onSelectFaculty={handleFacultySelect} />
                </div>
            </main>
        </div>
    )
}

