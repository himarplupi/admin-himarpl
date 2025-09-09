import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, inArray, sql } from "drizzle-orm";
import { periods } from "@/server/db/schema";

export const periodRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.periods.findMany();
  }),
  count: protectedProcedure.query(async ({ ctx }) => {
    const [{ count } = {}] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(periods);

    return count;
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        logo: z.string(),
        year: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(periods)
        .values(input)
        .returning();
      return created;
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(periods)
        .where(eq(periods.id, input))
        .returning({ id: periods.id });
      return deleted;
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(periods)
        .where(inArray(periods.id, input));
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        logo: z.string().optional(),
        year: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(periods)
        .set(data)
        .where(eq(periods.id, id))
        .returning();
      return updated;
    }),
});
