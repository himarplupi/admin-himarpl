import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const periodRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.period.findMany();
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
      return await ctx.db.period.create({
        data: input,
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.period.delete({
        where: { id: input },
        select: { id: true },
      });
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.period.deleteMany({
        where: { id: { in: input } },
      });
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
      return await ctx.db.period.update({
        where: { id: input.id },
        data: input,
      });
    }),
});
