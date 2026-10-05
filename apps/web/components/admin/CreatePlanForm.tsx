"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const INTERVALS = ["monthly", "quarterly", "annual"] as const;

const CreatePlanForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>("monthly");
  const [paystackPlanCode, setPaystackPlanCode] = useState("");
  const [features, setFeatures] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const priceCents = Math.round(Number(price) * 100);
    if (!name.trim() || !paystackPlanCode.trim() || !priceCents || priceCents < 0) {
      setFormError("Fill in a name, a valid price, and a Paystack plan code.");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createPlan({
        name,
        priceCents,
        interval,
        paystackPlanCode,
        features: features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      });
      setName("");
      setPrice("");
      setPaystackPlanCode("");
      setFeatures("");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? (
        <p className="rounded-sm border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm text-accent">
          {formError}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" name="name" value={name} onChange={setName} placeholder="Performance" required />
        <FormField
          label="Price (USD)"
          name="price"
          type="number"
          value={price}
          onChange={setPrice}
          placeholder="25.00"
          required
        />
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

      <FormField
        label="Paystack Plan Code"
        name="paystackPlanCode"
        value={paystackPlanCode}
        onChange={setPaystackPlanCode}
        placeholder="plan_performance_monthly"
        hint="Once Paystack is connected, this must match a real plan code there."
        required
      />

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
          Features <span className="normal-case text-muted/70">(one per line)</span>
        </span>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          rows={3}
          placeholder={"Full class schedule access\nAssigned coach"}
          className="w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating…" : "Create Plan"}
      </Button>
    </form>
  );
};

export default CreatePlanForm;
