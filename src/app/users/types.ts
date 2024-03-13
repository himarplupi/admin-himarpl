import { z } from "zod";

const department = z.object({
  id: z.string(),
  acronym: z.string(),
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
  lastLoginAt: z.date(),
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
    })
    .optional(),
});

export type User = z.infer<typeof user>;
