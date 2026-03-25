import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

if (typeof window !== "undefined") {
  throw new Error("❌ PRISMA BROWSER ERROR: Prisma should only be imported on the server side! Check your client components. ❌");
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!connectionString) {
    throw new Error("\n\n❌ PRISMA INITIALIZATION ERROR: DATABASE_URL is missing! ❌\n\n");
  }
  const adapter = new PrismaNeonHttp(connectionString, {} as any);
  return new PrismaClient({ adapter }) as any;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
