"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { memberApi } from "@/lib/api/member";
import { ApiError } from "@/lib/api/client";

const CheckInButton = ({ alreadyCheckedIn }: { alreadyCheckedIn: boolean }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(alreadyCheckedIn);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    try {
      await memberApi.checkIn();
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't check in. Try again.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <span className="w-full rounded-sm border border-line px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-muted sm:w-auto">
        Checked In Today
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full rounded-sm bg-ink px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-panel transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Checking In…" : "Check In Today"}
      </button>
      {error ? <span className="text-xs font-semibold text-accent">{error}</span> : null}
    </div>
  );
};

export default CheckInButton;
