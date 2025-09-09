import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { accounts } from "@/server/db/schema";
import { db } from "@/server/db";

export const accountRouter = createTRPCRouter({
  getByUserId: publicProcedure.input(z.string()).query(({ input }) => {
    const result = db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, input))
      .limit(1);

    return result;
  }),
});
