import { z } from "zod";

export const departmentFormSchema = z.object({
  name: z
    .string()
    .max(255, {
      message: "Name must be less than 255 characters",
    })
    .min(4, {
      message: "Name must be more than 4 characters",
    }),
  image: z.string(),
  description: z.string(),
  acronym: z
    .string()
    .max(32, {
      message: "Acronym must be less than 32 characters",
    })
    .min(2, {
      message: "Acronym must be more than 2 characters",
    }),
  type: z.enum(["BE", "DP"]),
  periodYear: z.number(),
  programs: z.array(z.string()),
});

export type DepartmentFormSchema = z.infer<typeof departmentFormSchema>;
