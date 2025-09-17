import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().transform(v => parseInt(v, 10)).optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  MONGO_URI: z.url().or(z.string().startsWith("mongodb://")).describe("Mongo connection string")
});

export const env = EnvSchema.parse(process.env);

export const CONFIG = {
  port: env.PORT || 3000,
  jwtSecret: env.JWT_SECRET,
  mongoUri: env.MONGO_URI,
  isProd: env.NODE_ENV === "production"
};
