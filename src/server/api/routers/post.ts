import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { sql, gte } from "drizzle-orm";
import { posts } from "@/server/db/schema";

export type Post7Day = {
  publishedAt: Date | null;
};

export type PostStatistic = {
  totalPostsIn7Days: number;
  percentageIn7Days: number;
  posts7Days: Post7Day[];
};

export const postRouter = createTRPCRouter({
  getStatistic: protectedProcedure.query(async ({ ctx }) => {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const posts7Days = await ctx.db
      .select({ publishedAt: posts.publishedAt })
      .from(posts)
      .where(gte(posts.publishedAt, sevenDaysAgo.toISOString()))
      .orderBy(sql`${posts.publishedAt} asc`);

    const posts7DaysBeforeResult = await ctx.db
     .select({ count: sql<number>`count(*)` })
     .from(posts)
     .where(sql`${posts.publishedAt} >= ${fourteenDaysAgo} AND ${posts.publishedAt} < ${sevenDaysAgo}`);

    const posts7DaysBefore = posts7DaysBeforeResult[0]?.count ?? 0;

    const totalPostsIn7Days = posts7Days.length - posts7DaysBefore;

    const percentageIn7Days =
      Math.round(
        (totalPostsIn7Days / (posts7DaysBefore === 0 ? 1 : posts7DaysBefore)) *
          100 *
          100,
      ) / 100;

    return {
      totalPostsIn7Days,
      percentageIn7Days,
      posts7Days,
    };
  }),
});
