import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { accounts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const accountRouter = createTRPCRouter({
  getByUserId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.accounts.findFirst({
      where: eq(accounts.userId, input),
    });
  }),
});
