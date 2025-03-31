// Mock data for the current teacher
export const currentTeacher = {
  id: 1,
  name: "Dr. Smith",
  subject: "Mathematics",
  email: "smith@example.edu",
}

// Mock data for appointments
export const initialAppointments = [
  {
    id: 1,
    studentName: "Alice Johnson",
    date: new Date(2025, 2, 31),
    time: "10:00 AM",
    status: "confirmed",
  },
  {
    id: 2,
    studentName: "Bob Williams",
    date: new Date(2025, 2, 31),
    time: "02:00 PM",
    status: "confirmed",
  },
  {
    id: 3,
    studentName: "Charlie Brown",
    date: new Date(2025, 3, 1),
    time: "11:00 AM",
    status: "confirmed",
  },
  {
    id: 4,
    studentName: "Diana Miller",
    date: new Date(2025, 3, 2),
    time: "09:00 AM",
    status: "confirmed",
  },
]

// Mock data for available time slots template
export const defaultTimeSlots = [
  { id: 1, time: "09:00 AM", available: true },
  { id: 2, time: "10:00 AM", available: true },
  { id: 3, time: "11:00 AM", available: true },
  { id: 4, time: "01:00 PM", available: true },
  { id: 5, time: "02:00 PM", available: true },
  { id: 6, time: "03:00 PM", available: true },
]


