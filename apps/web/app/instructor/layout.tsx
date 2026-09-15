import type { ReactNode } from "react";
import AppShell from "@/components/ui/AppShell";
import { instructorToday } from "@/lib/mock-data";

const InstructorLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AppShell role="instructor" personName={instructorToday.name}>
      {children}
    </AppShell>
  );
};

export default InstructorLayout;
