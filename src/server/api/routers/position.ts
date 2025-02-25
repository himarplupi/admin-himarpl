import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const positionRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.position.count();
  }),
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.position.findMany();
  }),
  getManySelect: protectedProcedure
    .input(
      z.object({
        name: z.boolean().optional(),
        users: z.boolean().optional(),
        createdAt: z.boolean().optional(),
        updatedAt: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.position.findMany({
        select: { id: true, ...input },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.position.create({
        data: {
          name: input.name,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.position.delete({
        where: { id: input },
        select: { id: true },
      });
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.position.deleteMany({
        where: { id: { in: input } },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.position.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });
    }),
});
