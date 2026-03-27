"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { format } from "date-fns";
import { DateOverrides } from "../lib/types";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  return await prisma.user.findUnique({
    where: { email: session.user.email },
  });
}


export async function updateUsername(id: string, username: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { username },
  });
  revalidatePath("/dashboard");
  return user;
}

export async function updateUserAvailability(
  username: string, 
  availableStart: string, 
  availableEnd: string,
  availableDays: string,
  duration: number,
  location: string,
  allowOtherLocation: boolean,
  dateOverrides: DateOverrides | null,
  monthsUpfront: number,
  emailConfirmationMsg?: string,
  emailCancellationMsg?: string
) {
  const user = await prisma.user.update({
    where: { username },
    data: {
      availableStart,
      availableEnd,
      availableDays,
      duration,
      location,
      // @ts-expect-error - Prisma Json type mismatch with our interface
      dateOverrides: dateOverrides,
      monthsUpfront,
      emailConfirmationMsg,
      emailCancellationMsg
    },
  });
  revalidatePath(`/${username}`);
  revalidatePath("/dashboard");
  return user;
}

export async function getUserProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
}

export async function createBooking(data: {
  userId: string;
  guestName: string;
  guestEmail: string;
  date: Date;
  time: string;
  location: string;
  locationDetails?: string;
}) {
  // Check if slot is already taken
  const existing = await prisma.booking.findUnique({
    where: {
      userId_date_time: {
        userId: data.userId,
        date: data.date,
        time: data.time,
      },
    },
  });

  if (existing) {
    if (existing.status !== "CANCELLED") {
      throw new Error("This slot is already booked.");
    } else {
      // If it exists but was cancelled, delete it so we can create a fresh one
      // (satisfying the unique constraint while keeping the create flow simple)
      await prisma.booking.delete({ where: { id: existing.id } });
    }
  }

  const booking = await prisma.booking.create({
    data: {
      userId: data.userId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      date: data.date,
      time: data.time,
      location: data.location,
      locationDetails: data.locationDetails,
      status: "PENDING",
    },
  });

  // Send confirmation emails (non-blocking)
  try {
    const owner = await prisma.user.findUnique({ where: { id: data.userId } });
    if (owner?.email) {
      const { sendBookingConfirmation } = await import("@/lib/email");
      await sendBookingConfirmation({
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        ownerName: owner.name || "Host",
        ownerEmail: owner.email,
        date: format(data.date, "MMMM d, yyyy"),
        time: data.time,
        location: data.location,
        locationDetails: data.locationDetails,
      }, owner.id);
    }
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
    // Don't throw — booking is still created
  }

  // Revalidate the user's booking page
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (user?.username) {
    revalidatePath(`/${user.username}`);
  }
  revalidatePath("/dashboard");
  
  return booking;
}

export async function cancelBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) throw new Error("User not found");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.userId !== currentUser.id) throw new Error("Not authorized");
  if (booking.status === "CANCELLED") throw new Error("Already cancelled");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  // Send cancellation email (non-blocking)
  try {
    const { sendCancellationNotice } = await import("@/lib/email");
    await sendCancellationNotice({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      ownerName: booking.user.name || "Host",
      date: format(booking.date, "MMMM d, yyyy"),
      time: booking.time,
    }, booking.userId);
  } catch (err) {
    console.error("Failed to send cancellation email:", err);
  }

  revalidatePath("/dashboard");
  return updated;
}

export async function getOwnerBookings() {
  const session = await auth();
  if (!session?.user?.email) return [];

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) return [];

  const bookings = await prisma.booking.findMany({
    where: { userId: currentUser.id },
    orderBy: { date: "asc" },
  });

  return bookings;
}

export async function confirmBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) throw new Error("User not found");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.userId !== currentUser.id) throw new Error("Not authorized");
  if (booking.status === "CONFIRMED") throw new Error("Already confirmed");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  return updated;
}

export async function recoverBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) throw new Error("User not found");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.userId !== currentUser.id) throw new Error("Not authorized");
  if (booking.status !== "CANCELLED") throw new Error("Only cancelled bookings can be recovered");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "PENDING",
      cancelledAt: null,
    },
  });

  revalidatePath("/dashboard");
  return updated;
}

export async function getBookedSlots(userId: string, date: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      userId: userId,
      date: date,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { time: true },
  });
  
  return bookings.map(b => b.time);
}
