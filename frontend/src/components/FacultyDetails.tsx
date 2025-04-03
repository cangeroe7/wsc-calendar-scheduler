import type { Faculty } from "@server/sharedTypes"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { User, MapPin, Phone, Mail } from "lucide-react"

export function FacultyDetail({
    faculty,
    onChangeFaculty,
}: {
    faculty: Faculty
    onChangeFaculty: () => void
}) {
    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Selected Faculty</h2>
                <Button variant="outline" size="sm" onClick={onChangeFaculty} className="text-sm">
                    Change Faculty
                </Button>
            </div>

            <div className="mt-2">
                <Card className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            {faculty.photoUrl ? (
                                <img
                                    src={faculty.photoUrl || "/placeholder.svg"}
                                    alt={faculty.name}
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFC629]">
                                    <User className="h-10 w-10 text-black" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-lg">{faculty.name}</div>
                            <div className="text-gray-700">{faculty.title}</div>
                            <div className="text-gray-500">{faculty.position}</div>
                            <div className="text-gray-500">{faculty.department ?? ""}</div>

                            <div className="mt-3 space-y-1">
                                {faculty.officeLocation && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {faculty.officeLocation}
                                    </div>
                                )}
                                {faculty.phone && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Phone className="h-4 w-4 mr-1" />
                                        {faculty.phone}
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-gray-500">
                                    <Mail className="h-4 w-4 mr-1" />
                                    {faculty.email}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Card>
    )
}
