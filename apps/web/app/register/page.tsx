"use client";

import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>;

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (!email.trim()) next.email = "Enter your email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authApi.register({ name, email, password });
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthShell
        title="Check Your Email"
        subtitle={`We've sent a verification link to ${email}. Click it to activate your account.`}
      >
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <MailCheck size={40} className="text-accent" strokeWidth={1.5} />
          <p className="text-sm text-muted">
            Didn&apos;t get it? Check spam, or resend below.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => authApi.resendVerification(email)}>
              Resend Email
            </Button>
            <a href="/login" className="flex-1">
              <Button className="w-full">Back to Sign In</Button>
            </a>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Join Forge Athletic Club."
      footer={
        <>
          Already a member?{" "}
          <a href="/login" className="font-semibold text-ink-inverse hover:opacity-80">
            Sign in
          </a>
        </>
      }
    >
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
          placeholder="Amara Osei"
          autoComplete="name"
          error={errors.name}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
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
          {submitting ? "Creating Account…" : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
