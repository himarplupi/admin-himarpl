import { z } from "zod";

export const positionFormSchema = z.object({
  name: z.string().min(1, "Nama posisi harus diisi"),
  departmentId: z.string().min(1, "Departemen harus diisi"),
});

export type PositionFormSchema = z.infer<typeof positionFormSchema>;
