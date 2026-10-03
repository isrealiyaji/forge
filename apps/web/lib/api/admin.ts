import { apiClient } from "./client";

export type AdminMember = {
  id: number;
  name: string;
  email: string;
  member_id: number;
  current_streak: number;
  subscription_status: "active" | "past_due" | "cancelled" | null;
  instructor_name: string | null;
  created_at: string;
};

type Opts = { cookie?: string };

export const adminApi = {
  listMembers: (opts?: Opts) => apiClient.get<{ members: AdminMember[] }>("/api/members", opts),
  deactivateMember: (memberId: number) => apiClient.delete<void>(`/api/members/${memberId}`),
};
