import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

import { revalidatePath } from "next/cache";

export const userRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.count();
  }),
  getMany: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany();
  }),
  byPeriod: protectedProcedure
    .input(
      z.object({
        period: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.user.findMany({
        include: {
          department: {
            select: {
              acronym: true,
            },
          },
          accounts: {
            select: {
              id: true,
            },
          },
        },
        where: {
          periods: { has: input.period },
        },
      });
    }),
  getById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.user.findFirst({ where: { id: input } });
  }),
  getByEmail: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.user.findFirst({ where: { email: input } });
  }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.deleteMany({
        where: { id: { in: input } },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        image: z.string(),
        position: z.string(),
        periods: z.array(z.string()),
        role: z.enum(["admin", "member"]),
        departmentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      input.email = input.email.toLowerCase();
      input.position = input.position.toLowerCase();

      return await ctx.db.user.create({
        data: input,
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        image: z.string().optional(),
        periods: z.array(z.string()).optional(),
        position: z.string().optional(),
        role: z.enum(["admin", "member"]).optional(),
        departmentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          image: input.image,
          periods: input.periods,
          position: input.position,
          role: input.role,
          departmentId: input.departmentId,
        },
      });
    }),

  getStatistic: protectedProcedure.query(async ({ ctx }) => {
    // 7 days last login
    const usersLastLoginPromise = ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        lastLoginAt: true,
      },
      orderBy: {
        lastLoginAt: "desc",
      },
      where: {
        lastLoginAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    // 1 hour last login
    const totalUsersLastLoginPromise = ctx.db.user.count({
      where: {
        lastLoginAt: { gt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      },
    });

    const totalUserPreviousLoginPromise = ctx.db.user.count({
      where: {
        lastLoginAt: {
          lt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      },
    });

    const totalUsersPromise = ctx.db.user.count();

    const totalUsersActivePromise = ctx.db.user.count({
      where: {
        accounts: {
          some: {
            id: {
              not: undefined,
            },
          },
        },
      },
    });

    const [
      totalUsers,
      totalUsersLastLogin,
      totalUserPreviousLogin,
      usersLastLogin,
      totalUsersActive,
    ] = await Promise.all([
      totalUsersPromise,
      totalUsersLastLoginPromise,
      totalUserPreviousLoginPromise,
      usersLastLoginPromise,
      totalUsersActivePromise,
    ]);

    return {
      totalUsers,
      totalUsersLastLogin,
      totalDiffUsersLastLogin: totalUsersLastLogin - totalUserPreviousLogin,
      totalUsersActive,
      usersLastLogin,
    };
  }),
});
