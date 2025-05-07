import type { Faculty } from "@server/sharedTypes"
import { Mail, User, Phone, MapPin } from "lucide-react"
import { Button } from "./ui/button"


export function FacultyGrid({
    facultyList,
    onSelectFaculty,
}: {
    facultyList: Faculty[]
    onSelectFaculty: (faculty: Faculty) => void
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-[1200px]">
            {facultyList.map((faculty) => (
                <div
                    key={faculty.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-[400px] max-w-[280px] w-full"
                    onClick={() => onSelectFaculty(faculty)}
                >
                    <div className="p-4 flex flex-col items-center h-full">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg">
                            {faculty.photoUrl ? (
                                <img
                                    src={faculty.photoUrl || "/placeholder.svg"}
                                    alt={faculty.name}
                                    width={150}
                                    height={150}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#FFC629]">
                                    <User className="h-12 w-12 text-black" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-center">{faculty.name}</h2>
                        <p className="text-black/70 mb-2">{faculty.title}</p>
                        <p className="text-gray-500 text-center">{faculty.department ?? ""}</p>
                        <div className="mt-2 text-sm text-black/70">
                            <p className="mb-1 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {faculty.email}
                            </p>
                            {faculty.phone && (
                                <p className="mb-1 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {faculty.phone}
                                </p>
                            )}
                            {faculty.officeLocation && (
                                <p className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {faculty.officeLocation}
                                </p>
                            )}
                        </div>

                        <div className="mt-auto pt-4 w-full">
                            <Button className="w-full bg-[#FFC629] text-black hover:bg-[#e6b325] cursor-pointer">Select</Button>
                        </div>
                    </div>
                </div>
            ))}

            {facultyList.length === 0 && (
                <div className="text-center py-12 col-span-full">
                    <h2 className="text-2xl font-bold text-gray-700">No faculty members found</h2>
                    <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    )
}
