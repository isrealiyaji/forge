"use client";

import { useState } from "react";
import RosterRow from "@/components/ui/RosterRow";
import TogglePlanButton from "./TogglePlanButton";
import PlanEditForm from "./PlanEditForm";
import type { AdminPlan } from "@/lib/api/admin";

const formatPrice = (cents: number, interval: string) => `₦${(cents / 100).toLocaleString()} / ${interval}`;

const PlanRow = ({ plan }: { plan: AdminPlan }) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <PlanEditForm plan={plan} onDone={() => setEditing(false)} />;
  }

  return (
    <RosterRow
      title={plan.name}
      meta={plan.features.length > 0 ? plan.features.join(" · ") : "No features listed"}
      tone={plan.is_active ? "good" : "neutral"}
      statusLabel={plan.is_active ? "Active" : "Inactive"}
      keyStat={formatPrice(plan.price_cents, plan.interval)}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-sm border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-line/10"
          >
            Edit
          </button>
          <TogglePlanButton planId={plan.id} isActive={plan.is_active} />
        </div>
      }
    />
  );
};

export default PlanRow;
