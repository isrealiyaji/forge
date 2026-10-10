"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { memberApi } from "@/lib/api/member";
import { ApiError } from "@/lib/api/client";

const CancelSubscriptionButton = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!window.confirm("Cancel your subscription? You'll keep access until the current period ends.")) return;
    setPending(true);
    try {
      await memberApi.cancelSubscription();
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't cancel. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-bold uppercase tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Cancelling…" : "Cancel Subscription"}
    </button>
  );
};

export default CancelSubscriptionButton;
