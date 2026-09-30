import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Global connection pool to prevent connection exhaustion and improve response speed
const globalForDb = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: pg.Pool;
};

const pool =
  globalForDb.pool ??
  new pg.Pool({
    connectionString,
    max: 20, // Max concurrent connections in pool
    min: 2,  // Keep warm idle connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

const adapter = new PrismaPg(pool);

// Only log errors in production/dev to eliminate massive terminal stdout I/O latency on every query
const prisma =
  globalForDb.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.prisma = prisma;
  globalForDb.pool = pool;
}

export default prisma;