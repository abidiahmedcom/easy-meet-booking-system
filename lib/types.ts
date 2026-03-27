import { User as PrismaUser, Booking as PrismaBooking } from "@prisma/client";

export type User = PrismaUser & {
  isOwner?: boolean;
};

export type Booking = PrismaBooking;

export interface DateOverride {
  available: boolean;
  slots?: {
    start: string;
    end: string;
  }[];
}

export type DateOverrides = Record<string, DateOverride>;
