"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ kind: "loading", message: "" });

    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { data, error } = await fn;

    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }

    // Sign-up with email confirmation on: no session yet.
    if (mode === "signup" && !data.session) {
      setStatus({
        kind: "info",
        message: "Check your email to confirm your account, then sign in.",
      });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="lg:hidden mb-8 text-sm tracking-wide text-muted">
        TrackWise
      </div>

      <h2 className="font-display text-2xl">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {mode === "signin"
          ? "Sign in to pick up your job search."
          : "Start tracking applications in a minute."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            placeholder="At least 6 characters"
          />
        </div>

        {status.kind === "error" && (
          <p className="text-sm text-stage-rejected">{status.message}</p>
        )}
        {status.kind === "info" && (
          <p className="text-sm text-accent">{status.message}</p>
        )}

        <button
          type="submit"
          disabled={status.kind === "loading"}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {status.kind === "loading"
            ? "Working…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {mode === "signin" ? "New here? " : "Already have an account? "}
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setStatus({ kind: "idle", message: "" });
          }}
          className="text-accent hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
