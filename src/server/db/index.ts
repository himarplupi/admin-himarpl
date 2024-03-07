import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
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

export const users = schema.users;
export type NewUser = typeof users.$inferInsert;

export const accounts = schema.accounts;
export type NewAccount = typeof accounts.$inferInsert;
export type AccountSelect = typeof accounts.$inferSelect;

export async function selectUsersByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email));
}

export async function insertUser(user: NewUser) {
  return db.insert(users).values(user);
}

export async function isAccountFound(userId: string) {
  const result = await db
    .select({ userId: accounts.userId })
    .from(accounts)
    .where(eq(accounts.userId, userId));
  return result.length > 0;
}

export async function insertAccount(account: NewAccount) {
  return db.insert(accounts).values(account);
}
