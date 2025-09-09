import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { departments, programs, periods, positions } from "@/server/db/schema";
import { eq, inArray, sql, asc, desc } from "drizzle-orm";

export const departmentRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(departments);

    return result[0]?.count ?? 0;
  }),
  all: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: departments.id,
        name: departments.name,
        acronym: departments.acronym,
        image: departments.image,
        description: departments.description,
        type: departments.type,
        periodId: periods.id,
        periodYear: departments.periodYear,
        periodName: periods.name,
        programId: programs.id,
        programContent: programs.content,
        positionId: positions.id,
        positionName: positions.name,
      })
      .from(departments)
      .leftJoin(programs, eq(departments.id, programs.departmentId))
      .leftJoin(positions, eq(departments.id, positions.departmentId))
      .leftJoin(periods, eq(departments.periodYear, periods.year))
      .orderBy(desc(departments.periodYear), asc(departments.name));

    const result = rows.reduce((acc, row) => {
      let dept = acc.find((d) => d.id === row.id);
      if (!dept) {
        dept = {
          id: row.id,
          name: row.name,
          acronym: row.acronym,
          image: row.image,
          description: row.description,
          type: row.type,
          periodYear: row.periodYear,
          periodName: row.periodName,
          programs: [],
          positions: [],
        };
        acc.push(dept);
      }

      if (row.programId) {
        if (!dept.programs.some((p) => p.id === row.programId)) {
          dept.programs.push({
            id: row.programId,
            content: row.programContent ?? "",
          });
        }
      }

      if (row.positionId) {
        if (!dept.positions.some((p) => p.id === row.positionId)) {
          dept.positions.push({
            id: row.positionId,
            name: row.positionName ?? "",
          });
        }
      }
      return acc;
    }, [] as {
      id: string;
      name: string;
      acronym: string;
      image: string | null;
      description: string | null;
      type: string;
      periodYear: number;
      periodName: string | null;
      programs: { id: string; content: string }[];
      positions: { id: string; name: string }[];
    }[]);
    return result;
  }),
  getManySelect: protectedProcedure
    .input(
      z.object({
        name: z.boolean().optional(),
        acronym: z.boolean().optional(),
        description: z.boolean().optional(),
        image: z.boolean().optional(),
        type: z.boolean().optional(),
        periodYear: z.boolean().optional(),
        programs: z.boolean().optional(),
        users: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const columns: any = { id: departments.id };
      if (input.name) columns.name = departments.name;
      if (input.acronym) columns.acronym = departments.acronym;
      if (input.description) columns.description = departments.description;
      if (input.image) columns.image = departments.image;
      if (input.type) columns.type = departments.type;
      if (input.periodYear) columns.periodYear = departments.periodYear;

      return ctx.db.select(columns).from(departments);
    }),
  getByPeriodYear: protectedProcedure
    .input(
      z.object({
        periodYear: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(departments)
        .where(eq(departments.periodYear, input.periodYear));
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
      const [dept] = await ctx.db
        .insert(departments)
        .values({
          name: input.name,
          description: input.description,
          acronym: input.acronym,
          image: input.image,
          type: input.type,
          periodYear: input.periodYear,
        })
        .returning();

      if(!dept) {
        throw new Error("Failed to create department");
      }

      if (input.programs.length > 0) {
        await ctx.db.insert(programs).values(
          input.programs.map((p) => ({
            departmentId: dept.id,
            content: p,
          })),
        );
      }
      return dept;
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(departments)
        .where(eq(departments.id, input))
        .returning({ id: departments.id });

      return deleted;
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(departments)
        .where(inArray(departments.id, input));
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
      const { id, programs: newPrograms, ...rest } = input;

      const [updated] = await ctx.db
        .update(departments)
        .set(rest)
        .where(eq(departments.id, id))
        .returning();

      if (newPrograms) {
        await ctx.db.delete(programs).where(eq(programs.departmentId, id));

        if (newPrograms.length > 0) {
          await ctx.db.insert(programs).values(
            newPrograms.map((p) => ({
              departmentId: id,
              content: p,
            })),
          );
        }
      }
      return updated;
    }),
});
