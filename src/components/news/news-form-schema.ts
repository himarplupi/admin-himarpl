import { z } from "zod";

export const newsFormSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title must be at least 4 characters" })
    .max(255, { message: "Title must be less than 255 characters" }),
  image: z.string().optional(),
  metaTitle: z
    .string()
    .min(4, { message: "Meta title must be at least 4 characters" })
    .max(255, { message: "Meta title must be less than 255 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(255, { message: "Slug must be less than 255 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  rawHtml: z.string().optional(),
  publishedAt: z.date().optional().nullable(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),

  postTagIds: z.array(z.string()).optional(),
});

export type NewsFormSchema = z.infer<typeof newsFormSchema>;
