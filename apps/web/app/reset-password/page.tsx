"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"password" | "confirmPassword", string>>;

const ResetPasswordForm = () => {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {};
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
      await authApi.resetPassword({ token, password });
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid Link" subtitle="This password reset link is missing or malformed.">
        <a href="/forgot-password" className="w-full">
          <Button className="w-full">Request a New Link</Button>
        </a>
      </AuthShell>
    );
  }

  if (submitted) {
    return (
      <AuthShell title="Password Updated" subtitle="You can now sign in with your new password.">
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
    <AuthShell title="Reset Password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError ? (
          <p className="rounded-sm border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm text-accent">
            {formError}
          </p>
        ) : null}
        <FormField
          label="New Password"
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
          label="Confirm New Password"
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
          {submitting ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </AuthShell>
  );
};

const ResetPasswordPage = () => (
  <Suspense fallback={null}>
    <ResetPasswordForm />
  </Suspense>
);

export default ResetPasswordPage;
