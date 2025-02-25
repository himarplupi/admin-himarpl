import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const departmentRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.department.count();
  }),
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.department.findMany();
  }),
  getManySelect: protectedProcedure
    .input(
      z.object({
        name: z.boolean().optional(),
        acronym: z.boolean().optional(),
        description: z.boolean().optional(),
        image: z.boolean().optional(),
        type: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.department.findMany({
        select: { id: true, ...input },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        acronym: z.string(),
        image: z.string(),
        programs: z.array(z.string()),
        periodYear: z.number(),
        type: z.enum(["BE", "DP"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.department.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          acronym: input.acronym,
          periodYear: input.periodYear,
          programs: {
            createMany: {
              data: input.programs.map((program) => ({
                content: program,
              })),
            },
          },
          image: input.image,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.department.delete({
        where: { id: input },
        select: { id: true },
      });
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.department.deleteMany({
        where: { id: { in: input } },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        acronym: z.string().optional(),
        programs: z.array(z.string()).optional(),
        image: z.string().optional(),
        periodYear: z.number().optional(),
        type: z.enum(["BE", "DP"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.department.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          periodYear: input.periodYear,
          type: input.type,
          acronym: input.acronym,
          image: input.image,
          programs: input.programs && {
            deleteMany: {},
            createMany: {
              data: input.programs?.map((program) => ({
                content: program,
              })),
            },
          },
        },
      });
    }),
});
