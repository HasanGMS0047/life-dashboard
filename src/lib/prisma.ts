import fs from "fs";
import path from "path";
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
//
// Supabase's hosted Postgres is signed by "Supabase Root 2021 CA", which
// isn't in Node's default trust store on Vercel's serverless runtime. pg's
// connection-string parsing now treats `sslmode=require` as full
// certificate verification, so that combination fails with Prisma error
// P1011 ("self-signed certificate in certificate chain") — this only ever
// showed up in production, since local dev's connection string explicitly
// sets `sslmode=disable`. Pinning Supabase's actual root CA (downloaded
// from Project Settings > Database > SSL Configuration) restores full
// verification instead of disabling it.
//
// Passing both `connectionString` and `ssl` in the same config object does
// NOT work: pg's ConnectionParameters re-parses connectionString internally
// and merges it OVER whatever `ssl` was explicitly passed (see
// node_modules/pg/lib/connection-parameters.js), silently discarding our CA.
// Decomposing the URL into discrete fields (no `connectionString` key at
// all) avoids that re-parse so the explicit `ssl` config actually sticks.
const requiresTls = !connectionString.includes("sslmode=disable");

function buildPgConfig(rawConnectionString: string, ca: string) {
  const url = new URL(rawConnectionString);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    database: url.pathname.slice(1),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { ca, rejectUnauthorized: true },
  };
}

const adapter = requiresTls
  ? new PrismaPg(
      buildPgConfig(
        connectionString,
        fs.readFileSync(path.join(process.cwd(), "public", "prod-ca-2021.crt"), "utf8")
      )
    )
  : new PrismaPg({ connectionString });

// Avoids exhausting DB connections from a new PrismaClient on every
// hot-reload in dev — reuse the same instance across module reloads.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
