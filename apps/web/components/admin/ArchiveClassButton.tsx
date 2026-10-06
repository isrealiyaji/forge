"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const ArchiveClassButton = ({ classId, name }: { classId: number; name: string }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!window.confirm(`Archive ${name}? Its schedules and bookings will stay, but it won't be bookable anymore.`)) {
      return;
    }
    setPending(true);
    try {
      await adminApi.archiveClass(classId);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't archive. Try again.");
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
      {pending ? "Archiving…" : "Archive"}
    </button>
  );
};

export default ArchiveClassButton;
