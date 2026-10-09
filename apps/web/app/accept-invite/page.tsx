"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"name" | "password" | "confirmPassword", string>>;

const AcceptInviteForm = () => {
  const token = useSearchParams().get("token");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate() || !token) return;
    setSubmitting(true);
    try {
      await authApi.acceptInvite({ token, name, password });
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid Invite" subtitle="This invite link is missing or malformed. Ask an admin to resend it.">
        <a href="/" className="w-full">
          <Button variant="secondary" className="w-full">
            Back to Home
          </Button>
        </a>
      </AuthShell>
    );
  }

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
    <AuthShell title="Activate Your Account" subtitle="Set a password to finish joining Forge Athletic Club.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError ? (
          <p className="rounded-sm border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm text-accent">
            {formError}
          </p>
        ) : null}
        <FormField
          label="Full Name"
          name="name"
          value={name}
          onChange={setName}
          placeholder="Your full name"
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

const AcceptInvitePage = () => (
  <Suspense fallback={null}>
    <AcceptInviteForm />
  </Suspense>
);

export default AcceptInvitePage;
