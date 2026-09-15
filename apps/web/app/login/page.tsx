"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/ui/AuthShell";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // No backend yet — real auth will redirect based on the account's role.
    setTimeout(() => router.push("/member"), 500);
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

export default LoginPage;
