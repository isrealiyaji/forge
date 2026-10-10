"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { memberApi } from "@/lib/api/member";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10;

// Paystack confirms payment via webhook, not the browser redirect — so the
// subscription may not be active yet the instant we land back here. Poll
// briefly rather than telling the member it failed.
const CheckoutStatusBanner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isComplete = searchParams.get("checkout") === "complete";
  const [state, setState] = useState<"polling" | "active" | "timeout">("polling");

  useEffect(() => {
    if (!isComplete) return;
    let attempts = 0;
    let cancelled = false;

    const poll = async () => {
      attempts += 1;
      const { subscription } = await memberApi.mySubscription().catch(() => ({ subscription: null }));
      if (cancelled) return;
      if (subscription?.status === "active") {
        setState("active");
        router.refresh();
        return;
      }
      if (attempts >= MAX_POLLS) {
        setState("timeout");
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [isComplete, router]);

  if (!isComplete) return null;

  return (
    <div className="mb-8 border border-accent/30 bg-accent/10 px-5 py-4">
      {state === "polling" ? (
        <p className="text-sm font-semibold text-accent">Confirming your payment with Paystack…</p>
      ) : state === "active" ? (
        <p className="text-sm font-semibold text-accent">Payment confirmed — your subscription is active.</p>
      ) : (
        <p className="text-sm font-semibold text-accent">
          Still confirming — this can take a minute. Refresh the page shortly if your plan doesn&apos;t update.
        </p>
      )}
    </div>
  );
};

export default CheckoutStatusBanner;
