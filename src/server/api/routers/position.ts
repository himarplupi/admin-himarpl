import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, inArray, sql } from "drizzle-orm";
import { departments, positions } from "@/server/db/schema";

export const positionRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    const [{ count } = {}] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(positions);

    return count;
  }),
  all: protectedProcedure.query(async ({ ctx }) => {
  const result = await ctx.db
    .select({
      id: positions.id,
      name: positions.name,
      departmentId: positions.departmentId,
      departmentName: departments.name,
      departmentAcronym: departments.acronym,
      departmentYear: departments.periodYear,
      departmentType: departments.type,
    })
    .from(positions)
    .leftJoin(departments, eq(positions.departmentId, departments.id));

    return result.map((pos) => ({
      id: pos.id,
      name: pos.name,
      department: pos.departmentId
        ? {
            id: pos.departmentId,
            name: pos.departmentName,
            acronym: pos.departmentAcronym,
            year: pos.departmentYear,
            type: pos.departmentType,
          }
        : null,
    }));
}),
  getByDepartmentIds: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(positions)
        .where(inArray(positions.departmentId, input));
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
      const selectFields: Record<string, any> = { id: positions.id };
      if (input.name) selectFields.name = positions.name;
      if (input.createdAt) selectFields.createdAt = positions.createdAt;
      if (input.updatedAt) selectFields.updatedAt = positions.updatedAt;

      return await ctx.db.select(selectFields).from(positions);
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        departmentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(positions)
        .values({
          name: input.name,
          departmentId: input.departmentId,
        })
        .returning();
      return created;
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(positions)
        .where(eq(positions.id, input))
        .returning({ id: positions.id });
        
      return deleted;
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(positions)
        .where(inArray(positions.id, input));
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        departmentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(positions)
        .set({
          name: input.name,
          departmentId: input.departmentId,
        })
        .where(eq(positions.id, input.id))
        .returning();
      return updated;
    }),
});
