export function greet(name: string): string {
  return `Hello, ${name}! (from shared package)`;
}

export const VERSION = "0.0.1";

export type { User, AuthTokens, JwtPayload } from "./types/auth.js";
export type {
  LoginResponse,
  RegisterResponse,
  MeResponse,
} from "./api/contracts.js";
