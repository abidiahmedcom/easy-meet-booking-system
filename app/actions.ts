'use server';

import prisma from '@/lib/prisma';
import { generateTimeSlots } from '@/lib/booking';
import { startOfDay, endOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';

export async function getAvailableSlots(date: Date) {
  const dayOfWeek = date.getDay();
  
  const availability = await prisma.availability.findUnique({
    where: { dayOfWeek },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  });

  return generateTimeSlots(date, availability, bookings);
}

export async function createBooking(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const startTimeStr = formData.get('startTime') as string;
  const endTimeStr = formData.get('endTime') as string;

  if (!name || !email || !startTimeStr || !endTimeStr) {
    throw new Error('Missing required fields');
  }

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  // Double check availability (concurrency)
  const existing = await prisma.booking.findFirst({
    where: {
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  if (existing) {
    throw new Error('This slot is already booked');
  }

  await prisma.booking.create({
    data: {
      name,
      email,
      startTime,
      endTime,
    },
  });

  revalidatePath('/');
  return { success: true };
}

export async function getBookings() {
  return await prisma.booking.findMany({
    orderBy: { startTime: 'asc' },
  });
}

export async function deleteBooking(id: string) {
  await prisma.booking.delete({
    where: { id },
  });
  revalidatePath('/admin');
}

export async function updateAvailability(dayOfWeek: number, startTime: string, endTime: string) {
  await prisma.availability.upsert({
    where: { dayOfWeek },
    update: { startTime, endTime },
    create: { dayOfWeek, startTime, endTime },
  });
  revalidatePath('/admin');
}
