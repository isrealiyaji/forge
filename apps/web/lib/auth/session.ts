import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authApi, type SessionUser } from "@/lib/api/auth";
import type { Role } from "@/lib/nav-config";

const ROLE_HOME: Record<Role, string> = { admin: "/admin", member: "/member", instructor: "/instructor" };

export const getSession = async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    const { user } = await authApi.me(cookieHeader);
    return user;
  } catch {
    return null;
  }
};

export const requireRole = async (role: Role): Promise<SessionUser> => {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(ROLE_HOME[user.role]);
  return user;
};
