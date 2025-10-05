import type { User, AuthTokens } from "../types/auth.js";

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export type RegisterResponse = LoginResponse;

export interface MeResponse {
  user: User;
}
