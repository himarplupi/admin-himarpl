import { z } from "zod";

export const periodFormSchema = z.object({
  name: z
    .string()
    .max(255, {
      message: "Name must be less than 255 characters",
    })
    .min(4, {
      message: "Name must be more than 4 characters",
    }),
  logo: z.string(),
  year: z.number(),
});

export type PeriodFormSchema = z.infer<typeof periodFormSchema>;
