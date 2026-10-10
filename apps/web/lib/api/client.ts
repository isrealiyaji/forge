// Server-side callers (Server Components) talk to the API directly and
// forward the browser's cookie header explicitly via `options.cookie`.
// Browser-side callers go through this app's own /api/* rewrite instead of
// the API's real cross-site domain, so the session cookie Set by login ends
// up scoped to this domain and middleware/Server Components can see it.
const API_URL =
  typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000" : "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Forward the incoming request's Cookie header — only needed for server-side calls (layouts, route handlers). */
  cookie?: string;
};

const request = async <T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.cookie ? { cookie: options.cookie } : {}),
    },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  // Access tokens are short-lived (15m). On the browser, silently refresh once
  // and retry rather than bouncing the user to /login mid-session.
  if (res.status === 401 && !isRetry && !options.cookie && !path.startsWith("/api/auth/")) {
    const refreshed = await fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" });
    if (refreshed.ok) return request<T>(path, options, true);
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Something went wrong.");
  }
  return data as T;
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
