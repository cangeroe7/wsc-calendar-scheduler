import type { Department } from "@server/sharedTypes"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Component: SearchBar
export function SearchBar({
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    departmentList,
}: {
    searchQuery: string
    setSearchQuery: (query: string) => void
    selectedDepartment: Department | null
    setSelectedDepartment: (department: Department | null) => void
    departmentList: Department[]
}) {
    return (
        <div className="bg-[#FFC629] p-4 shadow-md">
            <div className="container mx-auto flex flex-row items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search faculty by name..."
                        className="pl-10 bg-white border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-64">
                    <Select
                        value={selectedDepartment || "All Departments"}
                        onValueChange={(value) => setSelectedDepartment(value === "All Departments" ? null : (value as Department))}
                    >
                        <SelectTrigger className="bg-white border-none">
                            <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Departments">All Departments</SelectItem>
                            {departmentList.map((department) => (
                                <SelectItem key={department} value={department}>
                                    {departmentList}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
