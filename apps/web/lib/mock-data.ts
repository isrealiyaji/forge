// Static placeholder data for FE wiring — no API calls yet.

export const adminActionQueue = [
  {
    id: "aq-1",
    title: "Amara Osei — nutrition plan v2",
    meta: "Proposed by Coach Delali · 2 hours ago",
    tone: "alert" as const,
    statusLabel: "Needs Review",
    keyStat: "Round 2",
  },
  {
    id: "aq-2",
    title: "Femi Adeyemi — subscription past due",
    meta: "Grace period ends in 1 day",
    tone: "alert" as const,
    statusLabel: "Past Due",
    keyStat: "Day 2 of 3",
  },
  {
    id: "aq-3",
    title: "Evening HIIT · 6:00 PM — waitlist",
    meta: "Capacity 16 · 3 waiting",
    tone: "neutral" as const,
    statusLabel: "Waitlisted",
    keyStat: "3 waiting",
  },
  {
    id: "aq-4",
    title: "Grace Mensah — nutrition plan v1",
    meta: "Proposed by Coach Tunde · yesterday",
    tone: "alert" as const,
    statusLabel: "Needs Review",
    keyStat: "Round 1",
  },
  {
    id: "aq-5",
    title: "Kwame Boateng — subscription past due",
    meta: "Grace period ends today",
    tone: "alert" as const,
    statusLabel: "Past Due",
    keyStat: "Day 3 of 3",
  },
];

export const adminStats = {
  activeMembers: 214,
  instructors: 9,
  classesThisWeek: 38,
  avgAssignmentLoad: 23,
  assignmentCap: 25,
};

export const adminRecentMembers = [
  { id: "m-1", title: "Amara Osei", meta: "Joined Aug 2025 · Coach Delali", tone: "good" as const, statusLabel: "Active", keyStat: "14 streak" },
  { id: "m-2", title: "Femi Adeyemi", meta: "Joined Mar 2025 · Coach Tunde", tone: "alert" as const, statusLabel: "Past Due", keyStat: "0 streak" },
  { id: "m-3", title: "Grace Mensah", meta: "Joined Jun 2025 · Coach Tunde", tone: "good" as const, statusLabel: "Active", keyStat: "31 streak" },
  { id: "m-4", title: "Kwame Boateng", meta: "Joined Jan 2025 · Coach Delali", tone: "alert" as const, statusLabel: "Past Due", keyStat: "6 streak" },
  { id: "m-5", title: "Ngozi Chukwu", meta: "Joined Sep 2025 · Coach Delali", tone: "neutral" as const, statusLabel: "New", keyStat: "1 streak" },
];

export const adminProfile = {
  name: "Stephen A.",
  email: "stephen@forgeathletic.club",
  phone: "+234 801 234 5678",
};

export const pendingInvites = [
  { id: "inv-1", title: "chiamaka.eze@forgeathletic.club", meta: "Invited 2 days ago", tone: "neutral" as const, statusLabel: "Pending", keyStat: "Instructor" },
  { id: "inv-2", title: "tunde.bakare@forgeathletic.club", meta: "Invited 5 days ago", tone: "neutral" as const, statusLabel: "Pending", keyStat: "Instructor" },
];

export const memberProfile = {
  name: "Amara Osei",
  email: "amara.osei@example.com",
  phone: "+234 802 345 6789",
  dob: "1996-04-12",
  timezone: "Africa/Lagos",
  streak: 14,
  longestStreak: 22,
  weekPattern: [true, true, true, true, true, false, true],
  instructor: { name: "Coach Delali Mensah", specialty: "Strength & Conditioning" },
  subscription: { plan: "Performance Monthly", status: "good" as const, statusLabel: "Active", renews: "Oct 14" },
  nextClass: { name: "Evening HIIT", time: "Today · 6:00 PM", spotsLeft: 4 },
  upcomingClasses: [
    { id: "c-1", title: "Evening HIIT", meta: "Today · 6:00 PM · Coach Delali", tone: "good" as const, statusLabel: "Booked", keyStat: "6:00 PM" },
    { id: "c-2", title: "Mobility Flow", meta: "Wed · 7:30 AM · Coach Tunde", tone: "neutral" as const, statusLabel: "Waitlisted", keyStat: "7:30 AM" },
    { id: "c-3", title: "Strength Fundamentals", meta: "Fri · 6:00 PM · Coach Delali", tone: "good" as const, statusLabel: "Booked", keyStat: "6:00 PM" },
  ],
};

export const instructorToday = {
  name: "Coach Delali Mensah",
  email: "delali.mensah@forgeathletic.club",
  phone: "+234 803 456 7890",
  specialty: "Strength & Conditioning",
  bio: "9 years coaching strength and conditioning, formerly with the national athletics program.",
  sessionsToday: [
    { id: "s-1", title: "Evening HIIT", meta: "6:00 PM · Studio A", tone: "good" as const, statusLabel: "16 Booked", keyStat: "6:00 PM" },
    { id: "s-2", title: "Strength Fundamentals", meta: "7:15 PM · Weight Room", tone: "good" as const, statusLabel: "11 Booked", keyStat: "7:15 PM" },
  ],
  rosterCount: 23,
  assignmentCap: 25,
  pendingNutritionDrafts: [
    { id: "n-1", title: "Amara Osei", meta: "Rejected — add post-workout protein target", tone: "alert" as const, statusLabel: "Revise", keyStat: "Round 2" },
    { id: "n-2", title: "Kwame Boateng", meta: "Awaiting admin review", tone: "neutral" as const, statusLabel: "Pending", keyStat: "Round 1" },
  ],
  roster: [
    { id: "r-1", title: "Amara Osei", meta: "Strength & Conditioning · 14 day streak", tone: "good" as const, statusLabel: "Active", keyStat: "14 streak" },
    { id: "r-2", title: "Kwame Boateng", meta: "Strength & Conditioning · 6 day streak", tone: "alert" as const, statusLabel: "Past Due", keyStat: "6 streak" },
    { id: "r-3", title: "Ngozi Chukwu", meta: "General Fitness · 1 day streak", tone: "neutral" as const, statusLabel: "New", keyStat: "1 streak" },
  ],
};
