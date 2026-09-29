import type { ReactNode } from "react";
import AppShell from "@/components/ui/AppShell";
import { requireRole } from "@/lib/auth/session";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const user = await requireRole("admin");
  return (
    <AppShell role="admin" personName={user.name}>
      {children}
    </AppShell>
  );
};

export default AdminLayout;
