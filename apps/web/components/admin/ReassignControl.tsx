"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminInstructor } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

type ReassignControlProps = {
  memberId: number;
  currentInstructorId: number | null;
  instructors: AdminInstructor[];
};

const ReassignControl = ({ memberId, currentInstructorId, instructors }: ReassignControlProps) => {
  const router = useRouter();
  const [selected, setSelected] = useState(currentInstructorId ? String(currentInstructorId) : "");
  const [pending, setPending] = useState(false);

  const handleReassign = async () => {
    if (!selected) return;
    setPending(true);
    try {
      await adminApi.reassignMember(memberId, Number(selected));
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't reassign. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="rounded-sm border border-line bg-panel px-2.5 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="" disabled>
          Choose instructor…
        </option>
        {instructors.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleReassign}
        disabled={pending || !selected || selected === String(currentInstructorId)}
        className="rounded-sm border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-line/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Assign"}
      </button>
    </div>
  );
};

export default ReassignControl;
