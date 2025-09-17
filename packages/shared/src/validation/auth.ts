import { z } from "zod";

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
  role: z.enum(["user", "admin"]).optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const AuthSuccessSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string().optional(),
    role: z.enum(["user", "admin"]),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }),
  tokens: z.object({
    accessToken: z.string(),
  }),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
