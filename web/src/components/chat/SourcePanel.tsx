"use client";

import { X } from "lucide-react";
import type { Citation } from "@/lib/chat";

export function SourcePanel({ citation, onClose }: { citation: Citation; onClose: () => void }) {
  return (
    <>
      {/* Scrim for the overlay (tablet) and bottom sheet (mobile) layouts */}
      <div className="fixed inset-0 z-40 bg-[var(--scrim)] desk:hidden" onClick={onClose} />
      <aside
        aria-label="Source"
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[82%] flex-col overflow-y-auto rounded-t-xl border border-border bg-panel tab:inset-x-auto tab:bottom-0 tab:end-0 tab:top-0 tab:max-h-none tab:w-[400px] tab:rounded-none tab:border-y-0 tab:border-e-0 desk:static desk:z-auto desk:shrink-0 desk:self-stretch"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border-strong tab:hidden" />
        <div className="flex h-14 shrink-0 items-center justify-between ps-5 pe-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Source</span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-raised"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 pb-8 pt-[22px]">
          <h2 className="font-serif text-2xl font-semibold leading-[1.2] text-heading">{citation.doc}</h2>

          <dl className="flex flex-col gap-3">
            <Row label="Topic" value={`${citation.topic}  ${citation.title}`} />
            <Row label="Page" value={String(citation.page)} />
          </dl>

          <div>
            <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Excerpt</p>
            <div className="rounded-xl border border-border bg-card px-5 py-[18px]">
              <p className="text-sm font-semibold text-heading">
                {citation.topic} {citation.title}
              </p>
              <div className="mt-3 flex flex-col gap-1.5 text-[15px] leading-[1.75]" dir="ltr">
                {citation.lines.map((l, i) =>
                  l.cited ? (
                    <p key={i}>
                      <mark className="bg-hl text-heading [box-shadow:inset_0_-2px_0_var(--cta)]">
                        {l.text}
                      </mark>
                    </p>
                  ) : (
                    <p key={i} className="text-muted">
                      {l.text}
                    </p>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1 text-[15px] text-heading">{value}</dd>
    </div>
  );
}
