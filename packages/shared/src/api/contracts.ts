import type { User, AuthTokens } from "../types/auth.js";

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse extends LoginResponse {}

export interface MeResponse {
  user: User;
}
