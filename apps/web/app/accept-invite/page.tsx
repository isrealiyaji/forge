"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck } from "lucide-react";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";

// In production, the invited email and role come from the invite token in the URL.
const INVITE = { email: "chiamaka.eze@forgeathletic.club", role: "Instructor" };

type Errors = Partial<Record<"name" | "password" | "confirmPassword", string>>;

const AcceptInvitePage = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // No backend yet — this will consume the invite token and activate the account.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <AuthShell title="You're In" subtitle="Your account is active. Sign in to get started.">
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <CircleCheck size={40} className="text-accent" strokeWidth={1.5} />
          <a href="/login" className="w-full">
            <Button className="w-full">Continue to Sign In</Button>
          </a>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Activate Your Account"
      subtitle={`Set a password for ${INVITE.email} to finish joining Forge Athletic Club.`}
      eyebrowBadge={`Invited as ${INVITE.role}`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          label="Full Name"
          name="name"
          value={name}
          onChange={setName}
          placeholder="Chiamaka Eze"
          autoComplete="name"
          error={errors.name}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password}
          hint="At least 8 characters."
          required
        />
        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Activating…" : "Activate Account"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default AcceptInvitePage;
