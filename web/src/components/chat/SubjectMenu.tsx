"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/lib/courses";

export function SubjectMenu({
  courses,
  currentId,
  onClose,
}: {
  courses: Course[];
  currentId: string;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--scrim)] tab:bg-transparent" onClick={onClose} />
      <div
        role="menu"
        aria-label="Subject"
        className="fixed inset-x-0 top-0 z-50 max-h-[90%] overflow-y-auto rounded-b-xl border border-border bg-card p-2 tab:absolute tab:inset-x-auto tab:top-full tab:mt-2 tab:w-[300px] tab:rounded-xl"
      >
        <div className="flex items-center justify-between px-3 pb-1 pt-2">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Subject</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-raised tab:hidden"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        <ul>
          {courses.map((c) => {
            const current = c.id === currentId;
            const base = "flex h-11 w-full items-center justify-between rounded-lg px-3 text-sm";
            return (
              <li key={c.id}>
                {c.live ? (
                  <Link
                    href={`/chat/${c.id}`}
                    onClick={onClose}
                    aria-current={current ? "true" : undefined}
                    className={`${base} ${current ? "bg-raised text-accent" : "text-heading hover:bg-raised"}`}
                  >
                    {c.subject.name}
                    {current && <Check size={16} strokeWidth={1.75} />}
                  </Link>
                ) : (
                  <span aria-disabled="true" className={`${base} text-muted opacity-70`}>
                    {c.subject.name}
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em]">Soon</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="px-3 pb-2 pt-3 text-xs text-muted">Switching subject starts a new chat.</p>
      </div>
    </>
  );
}
