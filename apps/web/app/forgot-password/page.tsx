"use client";

import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
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
        subtitle={`If an account exists for ${email}, we've sent a link to reset your password.`}
      >
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <MailCheck size={40} className="text-accent" strokeWidth={1.5} />
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => authApi.forgotPassword(email)}>
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
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <a href="/login" className="font-semibold text-ink-inverse hover:opacity-80">
          Back to Sign In
        </a>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError ? (
          <p className="rounded-sm border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm text-accent">
            {formError}
          </p>
        ) : null}
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
