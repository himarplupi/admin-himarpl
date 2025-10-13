import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { sql, gte, eq, desc, inArray } from "drizzle-orm";
import { posts, postToPostTag } from "@/server/db/schema";
import { users } from "@/server/db/schema";
import { title } from "process";
import z from "zod";
import { link } from "fs";

export type Post7Day = {
  publishedAt: Date | null;
};

export type PostStatistic = {
  totalPostsIn7Days: number;
  percentageIn7Days: number;
  posts7Days: Post7Day[];
};

export const postRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    const [{ count } = { count: 0 }] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(posts);

    return count;
  }),
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
      .where(
        sql`${posts.publishedAt} >= ${fourteenDaysAgo} AND ${posts.publishedAt} < ${sevenDaysAgo}`,
      );

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
  all: protectedProcedure.query(async ({ ctx }) => {
    const postsData = await ctx.db
      .select({
        id: posts.id,
        image: posts.image,
        title: posts.title,
        slug: posts.slug,
        authorId: users.id,
        authorName: users.name,
        metaTitle: posts.metaTitle,
        link: posts.link,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.publishedAt));

    return postsData.map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      slug: p.slug,
      metaTitle: p.metaTitle,
      content: p.content,
      link: p.link,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      publishedAt: p.publishedAt,
      author: p.authorId
        ? {
            id: p.authorId,
            name: p.authorName,
          }
        : null,
    }));
  }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(posts).where(inArray(posts.id, input));
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        image: z.string(),
        metaTitle: z.string(),
        slug: z.string(),
        content: z.string(),
        postTagIds: z.array(z.string()).optional(),
        link: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);

      const [post] = await ctx.db
        .insert(posts)
        .values({
          authorId: ctx.session.user.id,
          title: input.title,
          image: input.image,
          metaTitle: input.metaTitle,
          slug: input.slug,
          content: input.content,
          rawHtml: input.content,
          link: input.link,
          publishedAt: Math.floor(Date.now() / 1000),
        })
        .returning();

      if (!post) {
        throw new Error("Failed to create News");
      }

      if (input.postTagIds && input.postTagIds.length > 0) {
        await ctx.db.insert(postToPostTag).values(
          input.postTagIds.map((tagId) => ({
            postId: post.id,
            postTagId: tagId,
          })),
        );
      }
      return post;
    }),
  publish: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [publishPost] = await ctx.db
        .update(posts)
        .set({
          publishedAt: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(posts.id, input.id))
        .returning();

      if (!publishPost) {
        throw new Error("Failed to publish post");
      }
      return publishPost;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        image: z.string(),
        metaTitle: z.string(),
        slug: z.string(),
        link: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedPost] = await ctx.db
        .update(posts)
        .set({
          title: input.title,
          image: input.image,
          metaTitle: input.metaTitle,
          slug: input.slug,
          content: input.content,
          rawHtml: input.content,
          link: input.link,
          updatedAt: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(posts.id, input.id))
        .returning();

      if (!updatedPost) {
        throw new Error("Failed to update post");
      }
      return updatedPost;
    }),
});
