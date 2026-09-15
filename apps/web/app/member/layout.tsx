import type { ReactNode } from "react";
import AppShell from "@/components/ui/AppShell";
import { memberProfile } from "@/lib/mock-data";

const MemberLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AppShell role="member" personName={memberProfile.name}>
      {children}
    </AppShell>
  );
};

export default MemberLayout;
