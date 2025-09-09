import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { eq, sql, inArray, and, exists, gte, lt, asc } from "drizzle-orm";
import {
  users,
  positions,
  departments,
  periods,
  accounts,
  positionToUser,
  departmentToUser,
  periodToUser,
} from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    const [{ count } = { count: 0 }] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    return count;
  }),
  all: protectedProcedure.query(async ({ ctx }) => {
    const usersData = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        username: users.username,
        role: users.role,
        positionId: positions.id,
        positionName: positions.name,
        departmentId: departments.id,
        departmentName: departments.name,
        departmentAcronym: departments.acronym,
        departmentType: departments.type,
        periodId: periods.id,
        periodName: periods.name,
        periodYear: periods.year,
        accountId: accounts.id,
      })
      .from(users)
      .leftJoin(positionToUser, eq(users.id, positionToUser.userId))
      .leftJoin(positions, eq(positionToUser.positionId, positions.id))
      .leftJoin(departmentToUser, eq(users.id, departmentToUser.userId))
      .leftJoin(departments, eq(departmentToUser.departmentId, departments.id))
      .leftJoin(periodToUser, eq(users.id, periodToUser.userId))
      .leftJoin(periods, eq(periodToUser.periodId, periods.id))
      .leftJoin(accounts, eq(users.id, accounts.userId))
      .orderBy(asc(users.name));

    return usersData.map((u) => ({
      ...u,
      positions: u.positionName ? [{ id: u.positionId, name: u.positionName }] : [],
      departments: u.departmentName ? [{ id: u.departmentId, name: u.departmentName, acronym: u.departmentAcronym, type: u.departmentType }] : [],
      periods: u.periodName ? [{ id: u.periodId, name: u.periodName, year: u.periodYear }] : [],
      accounts: u.accountId? [{ id: u.accountId }] : [],
    }));
  }),
  byPeriod: protectedProcedure
    .input(
      z.object({
        periodYear: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.users.findMany({
        with: {
          departments: {
            columns: {
              id: true,
              acronym: true,
              type: true,
            },
          },
          accounts: {
            columns: {
              id: true,
            },
          },
        },
        where: (u, {exists, eq}) =>
          exists(
            ctx.db
              .select()
              .from(periodToUser)
              .where(and(eq(periodToUser.userId, u.id), eq(periodToUser.periodId, input.periodYear.toString())))
          ),
      });
    }),
  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.db.query.users.findFirst({
      where: (u, {eq}) => eq(u.id, input),
    });
  }),
  getByEmail: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.db.query.users.findFirst({
      where: (u, {eq}) => eq(u.email, input.toLowerCase()),
    });
  }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(users)
        .where(inArray(users.id, input));
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        image: z.string(),
        username: z.string(),
        role: z.enum(["admin", "member"]),
        periodYears: z.array(z.number()),
        positionIds: z.array(z.string()).optional(),
        departmentIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLocaleLowerCase();
      console.log(input);

      const [user] = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email,
          emailVerified: new Date(),
          image: input.image,
          username: input.username,
          role: input.role,
        })
        .returning();

      if(!user) {
        throw new Error("Failed to create user");
      };

      if(input.periodYears.length > 0) {
        const periodsData = await ctx.db
          .select()
          .from(periods)
          .where(inArray(periods.year, input.periodYears));
        await ctx.db
          .insert(periodToUser)
          .values(
            periodsData.map((p) => ({
              userId: user.id,
              periodId: p.id,
            }))
          );
      }
      if(input.positionIds?.length) {
        await ctx.db
          .insert(positionToUser)
          .values(
            input.positionIds.map((id) => ({
              userId: user.id,
              positionId: id,
            }))
          );
      }
      if(input.departmentIds?.length) {
        await ctx.db
          .insert(departmentToUser)
          .values(
            input.departmentIds.map((id) => ({
              userId: user.id,
              departmentId: id,
            }))
          );
      }
      return user;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        username: z.string().optional(),
        image: z.string().optional(),
        role: z.enum(["admin", "member"]).optional(),
        positionIds: z.array(z.string()).optional(),
        periodYears: z.array(z.number()).optional(),
        departmentIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [currentUser] = await ctx.db
        .update(users)
        .set({
          name: input.name,
          email: input.email?.toLocaleLowerCase(),
          image: input.image,
          username: input.username,
          role: input.role,
        })
        .where(eq(users.id, input.id))
        .returning();

      if(!currentUser) return null;

      if(input.periodYears) {
        await ctx.db
          .delete(periodToUser)
          .where(eq(periodToUser.userId, input.id));
          if(input.periodYears.length > 0) {
            const periodsData = await ctx.db
              .select()
              .from(periods)
              .where(inArray(periods.year, input.periodYears));

            await ctx.db
              .insert(periodToUser)
              .values(
                periodsData.map((p) => ({
                  userId: input.id,
                  periodId: p.id,
                }))
              );
          }
      }
      if(input.positionIds) {
        await ctx.db
          .delete(positionToUser)
          .where(eq(positionToUser.userId, input.id));
          if(input.positionIds.length > 0) {
            await ctx.db
              .insert(positionToUser)
              .values(
                input.positionIds.map((id) => ({
                  userId: input.id,
                  positionId: id,
                }))
              );
          }
      }
      if(input.departmentIds) {
        await ctx.db
          .delete(departmentToUser)
          .where(eq(departmentToUser.userId, input.id));
          if(input.departmentIds.length > 0) {
            await ctx.db
              .insert(departmentToUser)
              .values(
                input.departmentIds.map((deptId) => ({
                  userId: input.id,
                  departmentId: deptId,
                }))
              );
          }
      }
      return currentUser;
    }),

  getStatistic: protectedProcedure.query(async ({ ctx }) => {
    // 7 days last login
    const usersLastLoginPromise = ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(gte(users.lastLoginAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .orderBy(sql`${users.lastLoginAt} desc`);

    // 1 hour last login
    const totalUsersLastLoginPromise = ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.lastLoginAt, new Date(Date.now() - 1 * 60 * 60 * 1000)));

    const totalUserPreviousLoginPromise = ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          lt(users.lastLoginAt, new Date(Date.now() - 1 * 60 * 60 * 1000)),
          gte(users.lastLoginAt, new Date(Date.now() - 2 * 60 * 60 * 1000)),
        )
      );

    const totalUsersPromise = ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const totalUsersActivePromise = ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        exists(
          ctx.db
            .select()
            .from(accounts)
            .where(eq(accounts.userId, users.id)),
        ),
      );

    const [
      [{ count: totalUsers } = { count: 0 }],
      [{ count: totalUsersLastLogin } = { count: 0 }],
      [{ count: totalUserPreviousLogin } = { count: 0 }],
      usersLastLogin,
      [{ count: totalUsersActive } = { count: 0 }],
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
