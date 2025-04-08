import { useState } from "react"
import { format, addMonths, subMonths } from "date-fns"
import { Clock, ChevronLeft, ChevronRight, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CalendarView from "@/components/calendar-view"
import TimeSlots from "@/components/time-slots"

import { createFileRoute } from "@tanstack/react-router"
export const Route = createFileRoute("/dashboard/schedule/$facultyId")({
    component: BookingCalendar,
})

function BookingCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null) // July 22, 2024
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2024, 6, 1)) // July 2024

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-5xl overflow-hidden rounded-lg border bg-white shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Left Panel - Host Information */}
                    <div className="border-b border-r p-6 md:border-b-0 ">
                        <div className="mb-6">
                            <div className="mb-4 flex items-center gap-2 text-black">
                                <div className="h-8 w-8 rounded bg-primary text-black">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-medium">ACME Inc.</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Avatar className="mb-2 h-16 w-16">
                                    <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Fatima Sy" />
                                    <AvatarFallback className="bg-primary text-black">FS</AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-medium text-black">Fatima Sy</h3>
                                <h2 className="mb-6 text-2xl font-bold text-black">Client Check-in</h2>
                            </div>
                        </div>

                        <div className="space-y-4 text-black">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5" />
                                <span>30 min</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                <span>Zoom</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="h-4 w-full rounded bg-white/50"></div>
                            <div className="h-4 w-full rounded bg-white/50"></div>
                            <div className="h-4 w-full rounded bg-white/50"></div>
                            <div className="h-4 w-3/4 rounded bg-white/50"></div>
                        </div>
                    </div>

                    {/* Middle Panel - Calendar */}
                    <div className="border-b border-r p-6 md:border-b-0">
                        <h2 className="mb-6 text-center text-xl font-semibold text-black">Select a Date & Time</h2>

                        <div className="mb-6 flex items-center justify-between">
                            <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="text-black hover:bg-secondary">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <span className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</span>
                            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="text-black hover:bg-secondary">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <CalendarView currentMonth={currentMonth} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

                        <div className="mt-6">
                            <div className="mb-2 text-sm font-medium text-black">Time zone</div>
                            <Select defaultValue="eastern">
                                <SelectTrigger className="w-full border-black">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <SelectValue placeholder="Select timezone" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="eastern">Eastern time - US & Canada</SelectItem>
                                    <SelectItem value="central">Central time - US & Canada</SelectItem>
                                    <SelectItem value="mountain">Mountain time - US & Canada</SelectItem>
                                    <SelectItem value="pacific">Pacific time - US & Canada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Right Panel - Time Slots */}
                    {selectedDate && (

                        <div className="p-6">
                            <h2 className="mb-6 text-lg font-medium text-black">{format(selectedDate, "EEEE, MMMM d")}</h2>

                            <TimeSlots selectedTime={selectedTime} onSelectTime={setSelectedTime} />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

