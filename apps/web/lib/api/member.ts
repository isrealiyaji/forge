import { apiClient, ApiError } from "./client";

export type MemberProfile = {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  timezone: string | null;
  member_id: number;
  dob: string | null;
  current_streak: number;
  longest_streak: number;
  last_checkin_local_date: string | null;
};

export type MemberInstructor = {
  id: number;
  name: string;
  specialty: string | null;
};

export type MemberSubscription = {
  id: number;
  status: "active" | "past_due" | "cancelled";
  current_period_end: string | null;
  plan_name: string;
} | null;

export type MemberBooking = {
  booking_id: number;
  status: "booked" | "waitlisted";
  schedule_id: number;
  start_time: string;
  end_time: string;
  class_name: string;
  instructor_name: string | null;
};

export type AttendanceEntry = { checked_in_at: string; method: "qr" | "manual" };

type Opts = { cookie?: string };

export const memberApi = {
  me: (opts?: Opts) => apiClient.get<{ member: MemberProfile }>("/api/members/me", opts),

  myInstructor: async (opts?: Opts): Promise<MemberInstructor | null> => {
    try {
      const { instructor } = await apiClient.get<{ instructor: MemberInstructor }>(
        "/api/members/me/instructor",
        opts,
      );
      return instructor;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  mySubscription: (opts?: Opts) =>
    apiClient.get<{ subscription: MemberSubscription }>("/api/subscriptions/me", opts),

  myBookings: (opts?: Opts) => apiClient.get<{ bookings: MemberBooking[] }>("/api/bookings", opts),

  attendanceHistory: (opts?: Opts) => apiClient.get<{ entries: AttendanceEntry[] }>("/api/attendance", opts),

  checkIn: () =>
    apiClient.post<{ alreadyCheckedIn: boolean; streak: number; longestStreak: number }>(
      "/api/attendance/check-in",
    ),
};
