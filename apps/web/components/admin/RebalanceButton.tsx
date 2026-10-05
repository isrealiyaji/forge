"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const RebalanceButton = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!window.confirm("Rebalance every non-manually-pinned assignment across active instructors?")) return;
    setPending(true);
    try {
      const { rebalancedCount } = await adminApi.rebalance();
      window.alert(`Rebalanced ${rebalancedCount} member${rebalancedCount === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't rebalance. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleClick} disabled={pending}>
      {pending ? "Rebalancing…" : "Rebalance All"}
    </Button>
  );
};

export default RebalanceButton;
