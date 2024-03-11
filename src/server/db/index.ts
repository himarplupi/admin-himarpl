import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: NeonQueryFunction<boolean, boolean> | undefined;
};

const conn = globalForDb.conn ?? neon(env.DATABASE_URL);

if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

export const accounts = schema.accounts;
export type NewAccount = typeof accounts.$inferInsert;
export type AccountSelect = typeof accounts.$inferSelect;

export async function insertAccount(account: NewAccount) {
  return db.insert(accounts).values(account);
}
