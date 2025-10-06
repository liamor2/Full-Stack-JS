import { z } from "zod";

export const BaseEntityZ = z.object({
  deleted: z.boolean().default(false),
  deletedAt: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type BaseEntity = z.infer<typeof BaseEntityZ>;
