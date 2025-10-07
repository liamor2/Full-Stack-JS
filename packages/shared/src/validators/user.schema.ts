import { z } from "zod";
import { BaseEntityZ } from "./baseEntity.schema.js";

export const UserZ = BaseEntityZ.extend({
  email: z.email().min(1),
  password: z.string().min(12),
  role: z.enum(["admin", "user"]).default("user"),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export type User = z.infer<typeof UserZ>;
