import { apiClient } from "./client";

export type AdminMember = {
  id: number;
  name: string;
  email: string;
  member_id: number;
  current_streak: number;
  subscription_status: "active" | "past_due" | "cancelled" | null;
  instructor_id: number | null;
  instructor_name: string | null;
  created_at: string;
};

export type AdminInstructor = {
  id: number;
  name: string;
  email: string;
  specialty: string | null;
  member_count: number;
};

export type GymSettings = {
  max_members_per_instructor: number;
  subscription_grace_period_days: number;
};

export type AdminPlan = {
  id: number;
  name: string;
  price_cents: number;
  interval: "monthly" | "quarterly" | "annual";
  features: string[];
  is_active: boolean;
};

export type CreatePlanInput = {
  name: string;
  priceCents: number;
  interval: "monthly" | "quarterly" | "annual";
  paystackPlanCode: string;
  features?: string[];
};

type Opts = { cookie?: string };

export const adminApi = {
  listMembers: (opts?: Opts) => apiClient.get<{ members: AdminMember[] }>("/api/members", opts),
  deactivateMember: (memberId: number) => apiClient.delete<void>(`/api/members/${memberId}`),

  listInstructors: (opts?: Opts) => apiClient.get<{ instructors: AdminInstructor[] }>("/api/instructors", opts),
  deactivateInstructor: (instructorId: number) => apiClient.delete<void>(`/api/instructors/${instructorId}`),

  settings: (opts?: Opts) => apiClient.get<{ settings: GymSettings }>("/api/admin/settings", opts),

  reassignMember: (memberId: number, instructorId: number) =>
    apiClient.post<void>("/api/assignments/reassign", { memberId, instructorId }),
  rebalance: () => apiClient.post<{ rebalancedCount: number }>("/api/assignments/rebalance"),

  listPlans: (opts?: Opts) => apiClient.get<{ plans: AdminPlan[] }>("/api/subscriptions/plans", opts),
  createPlan: (input: CreatePlanInput) =>
    apiClient.post<{ plan: AdminPlan }>("/api/subscriptions/plans", input),
  setPlanActive: (planId: number, isActive: boolean) =>
    apiClient.patch<void>(`/api/subscriptions/plans/${planId}`, { isActive }),
};
