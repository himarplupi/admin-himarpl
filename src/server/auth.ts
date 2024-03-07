import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env";
import {
  db,
  selectUsersByEmail,
  isAccountFound,
  insertAccount,
  NewAccount,
} from "@/server/db";
import { createTable, users } from "@/server/db/schema";

type NewUser = typeof users.$inferInsert;

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "admin" | "member";
    } & DefaultSession["user"];
  }

  interface User extends NewUser {
    role: "admin" | "member";
    lastLoginAt: Date;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn: async ({ profile, account }) => {
      const email = profile?.email;

      if (!account) return "/login?errorMsg=Account is not detected";
      if (!email) return "/login?errorMsg=Email is not detected";

      const users = await selectUsersByEmail(email);

      if (users.length === 0)
        return `/login?errorMsg=${email} is not registered`;

      const user = users[0];

      if (user?.role !== "admin") {
        return `/login?errorMsg=${email} is not an admin`;
      }

      const accountFound = await isAccountFound(user.id);

      if (!accountFound) {
        console.log("Account not found, inserting...");
        // Insert new account user if not found
        const res = await insertAccount({
          userId: user.id,
          provider: account.provider,
          type: account.type as NewAccount["type"],
          providerAccountId: account.providerAccountId,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          scope: account.scope,
          token_type: account.token_type,
          id_token: account.id_token,
          session_state: account.session_state,
        });

        if (!res) return "/login?errorMsg=Failed to insert account";
      }

      return true;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
  },
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  events: {
    async createUser(message) {
      console.log("\ncreateUser", message);
    },
    async updateUser(message) {
      console.log("\nupdateUser", message);
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
