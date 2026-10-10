"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/lib/store";

type Errors = { email?: string; password?: string };

export function AuthForm({
  mode,
  next,
  signedOut,
}: {
  mode: "sign-in" | "sign-up";
  next?: string;
  signedOut: boolean;
}) {
  const router = useRouter();
  const { signIn } = useUser();
  const isUp = mode === "sign-up";
  const [errors, setErrors] = useState<Errors>({});

  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
  const otherHref = `/auth/${isUp ? "sign-in" : "sign-up"}${suffix}`;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const firstName = String(data.get("firstName") ?? "").trim();

    const next_: Errors = {};
    if (!/\S+@\S+\.\S+/.test(email)) next_.email = "Enter a valid email address.";
    if (!isUp && !password) next_.password = "Enter your password.";
    if (isUp && password.length < 8) next_.password = "Use at least 8 characters.";
    setErrors(next_);
    if (next_.email || next_.password) return;

    // Prototype: no real auth yet. The backend step replaces this.
    signIn({ email, firstName: firstName || undefined });
    router.push(next ?? "/subjects");
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex w-full max-w-[400px] flex-col gap-5 rounded-xl border border-border bg-panel px-5 py-6 tab:p-8"
    >
      <h1 className="font-serif text-[30px] font-semibold text-heading">
        {isUp ? "Create account" : "Sign in"}
      </h1>

      {signedOut && !isUp && (
        <p
          role="status"
          className="rounded-lg border border-border-strong bg-raised px-4 py-3 text-sm text-accent"
        >
          You&apos;ve been signed out. Sign in to continue.
        </p>
      )}

      {isUp && (
        <Field label="First name (optional)" name="firstName" autoComplete="given-name" />
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={errors.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={isUp ? "new-password" : "current-password"}
        error={errors.password}
        aside={
          !isUp && (
            <span className="text-[13px] text-accent">Forgot password?</span>
          )
        }
      />

      <button
        type="submit"
        className="h-12 w-full rounded-lg bg-action text-[15px] font-semibold text-on-action hover:brightness-110"
      >
        {isUp ? "Create account" : "Sign in"}
      </button>

      <p className="text-sm text-muted">
        {isUp ? "Already have an account? " : "New to Madar AI? "}
        <Link href={otherHref} className="text-accent underline-offset-2 hover:underline">
          {isUp ? "Sign in" : "Create account"}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
  aside,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  aside?: React.ReactNode;
}) {
  const errId = `${name}-err`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-heading">
          {label}
        </label>
        {aside}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={`h-12 rounded-lg border bg-page px-3.5 text-base text-heading outline-none focus:border-accent ${
          error ? "border-warn-border" : "border-border"
        }`}
      />
      {error && (
        <p id={errId} className="text-[13px] text-warn-text">
          {error}
        </p>
      )}
    </div>
  );
}
