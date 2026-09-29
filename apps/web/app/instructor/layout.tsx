import type { ReactNode } from "react";
import AppShell from "@/components/ui/AppShell";
import { requireRole } from "@/lib/auth/session";

const InstructorLayout = async ({ children }: { children: ReactNode }) => {
  const user = await requireRole("instructor");
  return (
    <AppShell role="instructor" personName={user.name}>
      {children}
    </AppShell>
  );
};

export default InstructorLayout;
