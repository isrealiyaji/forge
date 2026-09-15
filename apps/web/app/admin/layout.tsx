import type { ReactNode } from "react";
import AppShell from "@/components/ui/AppShell";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AppShell role="admin" personName="Stephen A.">
      {children}
    </AppShell>
  );
};

export default AdminLayout;
