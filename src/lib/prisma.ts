import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_DATABASE_URL for Prisma.");
}

// Prisma 7 requires an explicit driver adapter for the runtime Client.
// This works with Vercel/Postgres and can be pointed at Supabase later by
// changing the environment variables only.
const adapter = new PrismaPg({ connectionString });

// Avoids exhausting DB connections from a new PrismaClient on every
// hot-reload in dev — reuse the same instance across module reloads.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
