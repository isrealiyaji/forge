"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const DeactivateMemberButton = ({ memberId, name }: { memberId: number; name: string }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!window.confirm(`Deactivate ${name}? They'll lose access and be unassigned from their instructor.`)) {
      return;
    }
    setPending(true);
    try {
      await adminApi.deactivateMember(memberId);
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

export default DeactivateMemberButton;
