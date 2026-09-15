"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck } from "lucide-react";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";

type Errors = Partial<Record<"password" | "confirmPassword", string>>;

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {};
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // No backend yet — this will verify the reset token and update the password.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

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

export default ResetPasswordPage;
