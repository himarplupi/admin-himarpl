import { env } from "@/env";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export type DB = LibSQLDatabase<typeof schema> & { $client: Client };
export const db: DB = drizzle(client, { schema });

export * from "./schema";
export * from "./relations";
