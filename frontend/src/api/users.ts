import type { User } from "@full-stack-js/shared";

import apiClient from "./client.js";

export async function fetchUser(id: string, token?: string | null) {
  return apiClient.get<User>(`/users/${id}`, token ?? null);
}

export default { fetchUser };
