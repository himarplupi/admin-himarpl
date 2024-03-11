import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { departments } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";

export const departmentRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.departments.findMany();
  }),
  post: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(["BE", "DP"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .insert(departments)
        .values({
          name: input.name,
          description: input.description,
          type: input.type,
          updatedAt: new Date(),
        })
        .returning();
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(departments)
        .where(eq(departments.id, input))
        .returning({ deletedId: departments.id });
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(departments)
        .where(inArray(departments.id, input))
        .returning({ deletedId: departments.id });
    }),
  put: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(["BE", "DP"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(departments)
        .set({
          name: input.name,
          description: input.description,
          type: input.type,
          updatedAt: new Date(),
        })
        .where(eq(departments.id, input.id))
        .returning();
    }),
});
