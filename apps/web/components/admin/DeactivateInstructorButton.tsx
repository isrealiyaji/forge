"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const DeactivateInstructorButton = ({ instructorId, name }: { instructorId: number; name: string }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!window.confirm(`Deactivate ${name}? Their members will be unassigned and need reassigning.`)) {
      return;
    }
    setPending(true);
    try {
      await adminApi.deactivateInstructor(instructorId);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't deactivate. Try again.");
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-sm border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-line/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Deactivating…" : "Deactivate"}
    </button>
  );
};

export default DeactivateInstructorButton;
