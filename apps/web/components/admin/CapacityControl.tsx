"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const CapacityControl = ({ classId, capacity }: { classId: number; capacity: number }) => {
  const router = useRouter();
  const [value, setValue] = useState(String(capacity));
  const [pending, setPending] = useState(false);

  const handleSave = async () => {
    const next = Number(value);
    if (!next || next < 1 || next === capacity) return;
    setPending(true);
    try {
      await adminApi.updateClassCapacity(classId, next);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't update capacity. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-sm border border-line bg-panel px-2 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={pending || Number(value) === capacity}
        className="rounded-sm border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-line/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
};

export default CapacityControl;
