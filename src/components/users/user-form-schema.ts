import { z } from "zod";

export const userFormSchema = z.object({
  name: z
    .string()
    .max(255, {
      message: "Name must be less than 255 characters",
    })
    .min(4, {
      message: "Name must be more than 4 characters",
    }),
  image: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  periodYears: z.array(z.number()),
  departmentIds: z.array(z.string()),
  positionIds: z.array(z.string()),
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
