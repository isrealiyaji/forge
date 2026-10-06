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

export type AdminClass = {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  instructor_name: string | null;
};

export type CreateClassInput = {
  name: string;
  description?: string;
  instructorId: number;
  capacity: number;
};

export type AdminSchedule = {
  schedule_id: number;
  start_time: string;
  end_time: string;
  name: string;
  capacity: number;
  booked_count: number;
};

export type CreateScheduleInput = {
  classId: number;
  startTime: string;
  endTime: string;
  recurrenceRule?: string;
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

  listClasses: (opts?: Opts) => apiClient.get<{ classes: AdminClass[] }>("/api/classes", opts),
  createClass: (input: CreateClassInput) => apiClient.post<{ class: AdminClass }>("/api/classes", input),
  updateClassCapacity: (classId: number, capacity: number) =>
    apiClient.patch<void>(`/api/classes/${classId}/capacity`, { capacity }),
  archiveClass: (classId: number) => apiClient.delete<void>(`/api/classes/${classId}`),

  listSchedules: (opts?: Opts) => apiClient.get<{ schedules: AdminSchedule[] }>("/api/classes/schedules", opts),
  createSchedule: (input: CreateScheduleInput) =>
    apiClient.post<{ schedule: { id: number } }>("/api/classes/schedules", input),
};
