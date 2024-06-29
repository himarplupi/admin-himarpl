import { z } from "zod";

const department = z.object({
  id: z.string(),
  acronym: z.string(),
  type: z.enum(["BE", "DP"]),
});

export type Department = z.infer<typeof department>;

const user = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  emailVerified: z.date().optional().nullable(),
  image: z.string().url().optional().nullable(),
  role: z.enum(["admin", "member"]),
  position: z.string().optional().nullable(),
  periods: z.array(z.string()),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  accounts: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .optional(),
  departmentId: z.string().optional().nullable(),
  department: z
    .object({
      id: z.string(),
      acronym: z.string(),
      type: z.enum(["BE", "DP"]),
    })
    .optional(),
});

export type User = z.infer<typeof user>;
