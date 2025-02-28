import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.count();
  }),
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        departments: true,
        positions: true,
        periods: true,
        accounts: {
          select: {
            id: true,
          },
        },
      },
    });
  }),
  byPeriod: protectedProcedure
    .input(
      z.object({
        periodYear: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.user.findMany({
        include: {
          departments: {
            select: {
              acronym: true,
              type: true,
            },
          },
          accounts: {
            select: {
              id: true,
            },
          },
        },
        where: {
          periods: {
            some: {
              year: input.periodYear,
            },
          },
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
        role: z.enum(["admin", "member"]),
        periodYears: z.array(z.number()),
        positionIds: z.array(z.string()).optional(),
        departmentIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      input.email = input.email.toLowerCase();

      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          image: input.image,
          role: input.role,
          periods: {
            connect: input.periodYears.map((year) => ({
              year,
            })),
          },
          positions: input.positionIds && {
            connect: input.positionIds.map((id) => ({
              id,
            })),
          },
          departments: input.departmentIds && {
            connect: input.departmentIds.map((id) => ({
              id,
            })),
          },
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        image: z.string().optional(),
        role: z.enum(["admin", "member"]).optional(),
        positionIds: z.array(z.string()).optional(),
        periodYears: z.array(z.number()).optional(),
        departmentIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findFirst({
        where: { id: input.id },
        include: {
          positions: true,
          periods: true,
          departments: true,
        },
      });

      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          image: input.image,
          role: input.role,
          periods: {
            disconnect: currentUser?.periods.map((period) => ({
              year: period.year,
            })),
            connect: input.periodYears?.map((year) => ({
              year,
            })),
          },
          positions: {
            disconnect: currentUser?.positions.map((position) => ({
              id: position.id,
            })),
            connect: input.positionIds?.map((id) => ({
              id,
            })),
          },
          departments: {
            disconnect: currentUser?.departments.map((department) => ({
              id: department.id,
            })),
            connect: input.departmentIds?.map((id) => ({
              id,
            })),
          },
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
