// Generate time slots for a given date
export function generateTimeSlots(date: Date) {
  // Generate different time slots based on the day of the week
  const day = date.getDay();
  const baseSlots = [
    { id: 1, time: "09:00 AM", available: true },
    { id: 2, time: "10:00 AM", available: true },
    { id: 3, time: "11:00 AM", available: true },
    { id: 4, time: "01:00 PM", available: true },
    { id: 5, time: "02:00 PM", available: true },
    { id: 6, time: "03:00 PM", available: true },
  ];

  // Make some slots unavailable based on the day
  return baseSlots.map((slot) => ({
    ...slot,
    available: day !== 0 && day !== 6 && Math.random() > 0.3,
  }));
}
