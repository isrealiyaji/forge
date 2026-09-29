import { apiClient } from "./client";
import type { Role } from "@/lib/nav-config";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  emailVerifiedAt: string | null;
};

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiClient.post<{ user: { id: number; name: string; email: string; role: Role } }>("/api/auth/register", input),

  login: (input: { email: string; password: string }) =>
    apiClient.post<{ user: SessionUser }>("/api/auth/login", input),

  logout: () => apiClient.post<void>("/api/auth/logout"),

  me: (cookie?: string) => apiClient.get<{ user: SessionUser }>("/api/auth/me", cookie ? { cookie } : undefined),

  verifyEmail: (token: string) => apiClient.post<void>("/api/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    apiClient.post<{ message: string }>("/api/auth/resend-verification", { email }),

  forgotPassword: (email: string) => apiClient.post<{ message: string }>("/api/auth/forgot-password", { email }),

  resetPassword: (input: { token: string; password: string }) =>
    apiClient.post<void>("/api/auth/reset-password", input),

  acceptInvite: (input: { token: string; name: string; password: string }) =>
    apiClient.post<{ user: { id: number; name: string; email: string; role: Role } }>(
      "/api/invites/accept",
      input,
    ),
};
