const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  token?: string | null;
  headers?: Record<string, string>;
}

export interface ApiErrorPayload {
  message: string;
  details?: unknown;
  status?: number;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status ?? 500;
    this.details = payload.details;
  }
}

export async function request<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { method = "GET", body, token, headers = {} } = options;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, init);
  const contentType = res.headers.get("Content-Type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError({
      message: isJson && data?.message ? data.message : res.statusText,
      details: isJson ? data?.details : data,
      status: res.status,
    });
  }

  return data as TResponse;
}

export const apiClient = {
  get: <TResponse>(endpoint: string, token?: string | null) =>
    request<TResponse>(endpoint, { method: "GET", token }),
  post: <TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    token?: string | null,
  ) => request<TResponse, TBody>(endpoint, { method: "POST", body, token }),
  put: <TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    token?: string | null,
  ) => request<TResponse, TBody>(endpoint, { method: "PUT", body, token }),
  patch: <TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    token?: string | null,
  ) => request<TResponse, TBody>(endpoint, { method: "PATCH", body, token }),
  delete: <TResponse>(endpoint: string, token?: string | null) =>
    request<TResponse>(endpoint, { method: "DELETE", token }),
};

export default apiClient;
