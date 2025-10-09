import type { Login, Register, LoginResponse } from "@full-stack-js/shared";

import apiClient from "./client.js";

type AuthResponse = LoginResponse;

export async function login(credentials: Login): Promise<AuthResponse> {
  return apiClient.post<AuthResponse, Login>("/auth/login", credentials);
}

export async function register(payload: Register): Promise<AuthResponse> {
  await apiClient.post<unknown, Register>("/auth/register", payload);
  const loginPayload: Login = {
    email: payload.email,
    password: payload.password,
  };
  return login(loginPayload);
}

export async function fetchCurrentUser(token: string) {
  return apiClient.get<{ user: AuthResponse["user"] }>("/auth/me", token);
}

export default { login, register, fetchCurrentUser };
