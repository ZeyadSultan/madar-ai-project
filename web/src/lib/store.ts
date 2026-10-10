"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { BoardId, LevelId } from "./courses";

// Tiny localStorage-backed store. Prototype only: real auth replaces the user part.

const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode); state just won't persist
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function useStored(key: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const set = useCallback((v: string | null) => write(key, v), [key]);
  return [raw, set] as const;
}

export type Theme = "dark" | "light";

export function useTheme() {
  const [raw, set] = useStored("madar.theme");
  const theme: Theme = raw === "light" ? "light" : "dark";
  const setTheme = useCallback(
    (t: Theme) => {
      document.documentElement.dataset.theme = t;
      set(t);
    },
    [set],
  );
  return [theme, setTheme] as const;
}

export type User = { email: string; firstName?: string };

export function useUser() {
  const [raw, set] = useStored("madar.user");
  const user = useMemo<User | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }, [raw]);
  const signIn = useCallback((u: User) => set(JSON.stringify(u)), [set]);
  const signOut = useCallback(() => set(null), [set]);
  return { user, signIn, signOut };
}

export function initial(user: User) {
  return (user.firstName?.trim()[0] ?? user.email[0] ?? "?").toUpperCase();
}

export type Exam = { board: BoardId; level: LevelId };

export function useExam() {
  const [raw, set] = useStored("madar.exam");
  const exam = useMemo<Exam | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Exam;
    } catch {
      return null;
    }
  }, [raw]);
  const setExam = useCallback((e: Exam | null) => set(e ? JSON.stringify(e) : null), [set]);
  return [exam, setExam] as const;
}
