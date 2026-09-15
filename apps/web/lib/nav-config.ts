import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Users,
  UserCog,
  Shuffle,
  CreditCard,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  Settings,
  Flame,
  Salad,
} from "lucide-react";

export type Role = "admin" | "member" | "instructor";

export type NavConfigItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

export const NAV_CONFIG: Record<Role, { roleLabel: string; items: NavConfigItem[] }> = {
  admin: {
    roleLabel: "Admin",
    items: [
      { label: "Home", icon: LayoutGrid, href: "/admin" },
      { label: "Members", icon: Users },
      { label: "Instructors", icon: UserCog },
      { label: "Assignments", icon: Shuffle },
      { label: "Plans", icon: CreditCard },
      { label: "Classes", icon: CalendarDays },
      { label: "Nutrition Review", icon: ClipboardCheck },
      { label: "Analytics", icon: BarChart3 },
      { label: "Settings", icon: Settings, href: "/admin/settings" },
    ],
  },
  member: {
    roleLabel: "Member",
    items: [
      { label: "Dashboard", icon: LayoutGrid, href: "/member" },
      { label: "My Instructor", icon: UserCog },
      { label: "Classes", icon: CalendarDays },
      { label: "Subscription", icon: CreditCard },
      { label: "Attendance", icon: Flame },
      { label: "Settings", icon: Settings, href: "/member/settings" },
    ],
  },
  instructor: {
    roleLabel: "Instructor",
    items: [
      { label: "Today", icon: LayoutGrid, href: "/instructor" },
      { label: "My Members", icon: Users },
      { label: "Classes", icon: CalendarDays },
      { label: "Nutrition Plans", icon: Salad },
      { label: "Settings", icon: Settings, href: "/instructor/settings" },
    ],
  },
};
