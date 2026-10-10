"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { memberApi } from "@/lib/api/member";
import { ApiError } from "@/lib/api/client";

// Full-page redirect to Paystack's hosted checkout — payment happens on
// their domain, never ours. They bounce back to callback_url on completion.
const SubscribeButton = ({
  planId,
  label = "Subscribe",
  mode = "checkout",
}: {
  planId: number;
  label?: string;
  mode?: "checkout" | "upgrade";
}) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    try {
      const { authorizationUrl } = await (mode === "upgrade" ? memberApi.upgrade(planId) : memberApi.checkout(planId));
      window.location.href = authorizationUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start checkout. Try again.");
      setPending(false);
    }
  };

  return (
    <div>
      <Button type="button" onClick={handleClick} disabled={pending} className="w-full">
        {pending ? "Redirecting…" : label}
      </Button>
      {error ? <p className="mt-2 text-xs font-semibold text-accent">{error}</p> : null}
    </div>
  );
};

export default SubscribeButton;
