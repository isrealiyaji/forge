"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const TogglePlanButton = ({ planId, isActive }: { planId: number; isActive: boolean }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      await adminApi.setPlanActive(planId, !isActive);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't update the plan. Try again.");
    } finally {
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
      {pending ? "Saving…" : isActive ? "Deactivate" : "Activate"}
    </button>
  );
};

export default TogglePlanButton;
