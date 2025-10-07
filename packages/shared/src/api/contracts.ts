import type { AuthTokens } from "../types/auth.js";
import type { User } from "../validators/user.schema.js";

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export type RegisterResponse = LoginResponse;

export interface MeResponse {
  user: User;
}
