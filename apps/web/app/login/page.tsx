"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const ROLE_HOME: Record<string, string> = { admin: "/admin", member: "/member", instructor: "/instructor" };

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const { user } = await authApi.login({ email, password });
      const next = searchParams.get("next");
      router.push(next || ROLE_HOME[user.role] || "/");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign In"
      subtitle="Welcome back to Forge Athletic Club."
      footer={
        <>
          New here?{" "}
          <a href="/register" className="font-semibold text-ink-inverse hover:opacity-80">
            Create an account
          </a>
        </>
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
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded-sm border-line accent-accent"
            />
            Remember me
          </label>
          <a href="/forgot-password" className="font-semibold text-accent hover:opacity-80">
            Forgot password?
          </a>
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Signing In…" : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
};

const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginForm />
  </Suspense>
);

export default LoginPage;
