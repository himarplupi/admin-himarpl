import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/server/db";
import { env } from "@/env";
import {
  users,
  accounts,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

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

  interface User {
    id: string;
    role: "admin" | "member";
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
  debug: true,
  callbacks: {
    signIn: async ({ profile, account: authAccount }) => {
      const email = profile?.email;

      if (!authAccount) return "/login?errorMsg=Account is not detected";
      if (!email) return "/login?errorMsg=Email is not detected";

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return `/login?errorMsg=Account with email ${email} is not registered`;
      }

      if (user.role !== "admin") {
        return "/login?errorMsg=You are not an admin";
      }

      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id));
      // const account = await api.account.getByUserId.query(user.id);

      if (!account) {
        console.log("Account not found, inserting...");
        // Insert new account user if not found
        const res = await db
          .insert(accounts)
          .values({
            userId: user.id,
            provider: authAccount.provider,
            type: authAccount.type,
            providerAccountId: authAccount.providerAccountId,
            accessToken: authAccount.access_token ?? null,
            refreshToken: authAccount.refresh_token ?? null,
            expiresAt: authAccount.expires_at ?? null,
            scope: authAccount.scope ?? null,
            tokenType: authAccount.token_type ?? null,
            idToken: authAccount.id_token ?? null,
            sessionState: authAccount.session_state ?? null,
          })
          .returning();

        if (!res) return "/login?errorMsg=Failed to insert account";
      }

      return true;
    },
    session: async ({ session, token }) => {
      const [user] = await db
        .select({
          id: users.id,
          role: users.role,
        })
        .from(users)
        .where(eq(users.email, session.user?.email ?? ""));
      return {
        ...session,
        user: {
          ...session.user,
          id: user?.id ?? "",
          role: user?.role ?? "member",
        },
      };
    },
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
