"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { initial, useTheme, useUser, type User } from "@/lib/store";

export function SettingsModal({ user, onClose }: { user: User; onClose: () => void }) {
  const router = useRouter();
  const [theme, setTheme] = useTheme();
  const { signOut } = useUser();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSignOut() {
    signOut();
    router.push("/auth/sign-in?signedout=1");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--scrim)] tab:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-t-xl border border-border bg-panel tab:rounded-xl"
      >
        <div className="flex items-center justify-between px-6 pb-4 pt-5">
          <h2 id="settings-title" className="font-serif text-2xl font-semibold leading-[1.2] text-heading">
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-raised"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <Section label="Appearance">
          <div className="flex gap-2">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                aria-pressed={theme === t}
                onClick={() => setTheme(t)}
                className={`h-11 rounded-full border px-5 text-sm ${
                  theme === t
                    ? "border-accent bg-raised text-accent"
                    : "border-border bg-card text-heading hover:border-border-strong"
                }`}
              >
                {t === "dark" ? "Dark" : "Light"}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Language">
          <div className="flex gap-2">
            <button
              aria-pressed="true"
              className="h-11 rounded-full border border-accent bg-raised px-5 text-sm text-accent"
            >
              English
            </button>
            <button
              disabled
              title="Coming later"
              className="h-11 cursor-not-allowed rounded-full border border-border bg-card px-5 text-sm text-muted opacity-60"
            >
              العربية
            </button>
          </div>
        </Section>

        <Section label="Account">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-raised text-sm font-semibold text-accent">
              {initial(user)}
            </span>
            <div className="min-w-0 flex-1">
              {user.firstName && (
                <p className="truncate text-sm font-medium text-heading">{user.firstName}</p>
              )}
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="h-11 rounded-lg border border-border px-4 text-sm font-medium text-heading hover:bg-raised"
            >
              Sign out
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border px-6 py-5">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {label}
      </h3>
      {children}
    </section>
  );
}
