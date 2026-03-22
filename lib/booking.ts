import { addMinutes, format, isAfter, isBefore, parse, startOfDay, set } from 'date-fns';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export function generateTimeSlots(
  date: Date,
  dayAvailability: { startTime: string; endTime: string } | null,
  existingBookings: { startTime: Date; endTime: Date }[],
  durationMinutes: number = 30
): TimeSlot[] {
  if (!dayAvailability) return [];

  const slots: TimeSlot[] = [];
  const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
  const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

  let currentSlotStart = set(startOfDay(date), { hours: startHour, minutes: startMin });
  const dayEnd = set(startOfDay(date), { hours: endHour, minutes: endMin });

  const now = new Date();

  while (isBefore(currentSlotStart, dayEnd)) {
    const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);
    
    // Ensure the slot is within the day's availability
    if (isAfter(currentSlotEnd, dayEnd)) break;

    // A slot is available if:
    // 1. It's in the future
    // 2. It doesn't overlap with any existing bookings
    const isFuture = isAfter(currentSlotStart, now);
    const hasOverlap = existingBookings.some(booking => {
      // (StartA < EndB) and (EndA > StartB)
      return isBefore(currentSlotStart, booking.endTime) && isAfter(currentSlotEnd, booking.startTime);
    });

    slots.push({
      startTime: currentSlotStart,
      endTime: currentSlotEnd,
      isAvailable: isFuture && !hasOverlap,
    });

    currentSlotStart = currentSlotEnd;
  }

  return slots;
}
