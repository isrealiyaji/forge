"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const ReviewPlanButtons = ({ planId }: { planId: number }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const approve = async () => {
    setPending(true);
    try {
      await adminApi.reviewNutritionPlan(planId, true);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't approve. Try again.");
      setPending(false);
    }
  };

  const reject = async () => {
    const reason = window.prompt("Reason for rejecting this plan (shown to the instructor):");
    if (reason === null) return;
    setPending(true);
    try {
      await adminApi.reviewNutritionPlan(planId, false, reason);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't reject. Try again.");
      setPending(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={reject} disabled={pending}>
        Reject
      </Button>
      <Button onClick={approve} disabled={pending}>
        {pending ? "Saving…" : "Approve"}
      </Button>
    </div>
  );
};

export default ReviewPlanButtons;
