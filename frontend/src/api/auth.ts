import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from "@full-stack-js/shared";

import apiClient from "./client.js";

type AuthResponse = LoginResponse;

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse, LoginRequest>("/auth/login", credentials);
}

export async function register(
  payload: RegisterRequest,
): Promise<AuthResponse> {
  return apiClient.post<AuthResponse, RegisterRequest>(
    "/auth/register",
    payload,
  );
}

export async function fetchCurrentUser(token: string) {
  return apiClient.get<{ user: AuthResponse["user"] }>("/auth/me", token);
}

export default { login, register, fetchCurrentUser };
