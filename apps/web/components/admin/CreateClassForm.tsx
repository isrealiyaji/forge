"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { adminApi, type AdminInstructor } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

const CreateClassForm = ({ instructors }: { instructors: AdminInstructor[] }) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState(instructors[0] ? String(instructors[0].id) : "");
  const [capacity, setCapacity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const capacityNum = Number(capacity);
    if (!name.trim() || !instructorId || !capacityNum || capacityNum < 1) {
      setFormError("Fill in a name, an instructor, and a valid capacity.");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createClass({
        name,
        description: description.trim() || undefined,
        instructorId: Number(instructorId),
        capacity: capacityNum,
      });
      setName("");
      setDescription("");
      setCapacity("");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (instructors.length === 0) {
    return <p className="text-sm text-muted">Add an instructor before creating a class.</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? (
        <p className="rounded-sm border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm text-accent">
          {formError}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          placeholder="Evening HIIT"
          required
        />
        <FormField
          label="Capacity"
          name="capacity"
          type="number"
          value={capacity}
          onChange={setCapacity}
          placeholder="16"
          required
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Instructor</span>
        <select
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          className="w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </label>

      <FormField
        label="Description"
        name="description"
        value={description}
        onChange={setDescription}
        placeholder="45 minutes, six nights a week."
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating…" : "Create Class"}
      </Button>
    </form>
  );
};

export default CreateClassForm;
