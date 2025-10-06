import { z } from "zod";

export const UserCreateSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32).optional(),
  password: z.string().min(8).max(128),
  role: z.enum(["user", "admin"]).optional(),
});

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(32).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(["user", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  role: z.enum(["user", "admin"]),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
