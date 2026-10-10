"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { adminApi, type AdminPlan } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const INTERVALS = ["monthly", "annually"] as const;

const PlanEditForm = ({ plan, onDone }: { plan: AdminPlan; onDone: () => void }) => {
  const router = useRouter();
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState((plan.price_cents / 100).toFixed(2));
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>(plan.interval);
  const [features, setFeatures] = useState(plan.features.join("\n"));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const priceCents = Math.round(Number(price) * 100);
    if (!name.trim() || !priceCents || priceCents < 0) {
      setFormError("Fill in a name and a valid price.");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.updatePlan(plan.id, {
        name,
        priceCents,
        interval,
        features: features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      });
      router.refresh();
      onDone();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't update the plan. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 border-b border-line px-1 py-5 last:border-b-0"
    >
      {formError ? (
        <p className="rounded-sm border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm text-accent">
          {formError}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" name="name" value={name} onChange={setName} required />
        <FormField label="Price (NGN)" name="price" type="number" value={price} onChange={setPrice} required />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Interval</span>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value as (typeof INTERVALS)[number])}
          className="w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {INTERVALS.map((i) => (
            <option key={i} value={i}>
              {i[0].toUpperCase() + i.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
          Features <span className="normal-case text-muted/70">(one per line)</span>
        </span>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          rows={3}
          className="w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save Changes"}
        </Button>
        <button
          type="button"
          onClick={onDone}
          disabled={submitting}
          className="rounded-sm border border-line px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-ink transition-colors hover:bg-line/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PlanEditForm;
