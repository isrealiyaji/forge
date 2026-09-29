import type { ReactNode } from "react";
import AppShell from "@/components/ui/AppShell";
import { requireRole } from "@/lib/auth/session";

const MemberLayout = async ({ children }: { children: ReactNode }) => {
  const user = await requireRole("member");
  return (
    <AppShell role="member" personName={user.name}>
      {children}
    </AppShell>
  );
};

export default MemberLayout;
