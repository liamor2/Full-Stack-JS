import { z } from "zod";

export const LoginZ = z.object({
  email: z.email(),
  password: z.string().min(12),
});

export const RegisterZ = z.object({
  email: z.email(),
  password: z.string().min(12),
  role: z.enum(["admin", "user"]).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export type Login = z.infer<typeof LoginZ>;
export type Register = z.infer<typeof RegisterZ>;
