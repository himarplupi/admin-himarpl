import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getMany: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.users.findMany();
  }),
  getById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.users.findFirst({ where: eq(users.id, input) });
  }),
  getByEmail: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.users.findFirst({ where: eq(users.email, input) });
  }),
});
