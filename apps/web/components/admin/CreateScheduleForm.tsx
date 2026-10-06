"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { adminApi, type AdminClass } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const inputClass =
  "w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-accent";

const CreateScheduleForm = ({ classes }: { classes: AdminClass[] }) => {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0] ? String(classes[0].id) : "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!classId || !startTime || !endTime) {
      setFormError("Choose a class and a start/end time.");
      return;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      setFormError("End time must be after the start time.");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createSchedule({
        classId: Number(classId),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      setStartTime("");
      setEndTime("");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (classes.length === 0) {
    return <p className="text-sm text-muted">Create a class before scheduling a session.</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? (
        <p className="rounded-sm border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm text-accent">
          {formError}
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Class</span>
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Start Time</span>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">End Time</span>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Scheduling…" : "Schedule Class"}
      </Button>
    </form>
  );
};

export default CreateScheduleForm;
