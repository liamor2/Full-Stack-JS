import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().optional(),
  JWT_SECRET: z.string().min(10).default("dev-secret")
});

export const env = EnvSchema.parse(process.env);
