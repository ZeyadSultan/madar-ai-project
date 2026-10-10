"use client";

import { ChevronRight, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Block, Citation, Message } from "@/lib/chat";
import { AiMark } from "../Marks";

type Assistant = Extract<Message, { role: "assistant" }>;

export type OpenSource = { messageId: string; index: number } | null;

export function MessageList({
  messages,
  subjectName,
  openSource,
  onToggleSource,
  onFeedback,
  onRetry,
}: {
  messages: Message[];
  subjectName: string;
  openSource: OpenSource;
  onToggleSource: (messageId: string, index: number) => void;
  onFeedback: (messageId: string, value: -1 | 1) => void;
  onRetry: (messageId: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 pb-6 pt-5 tab:px-6 tab:pt-10">
      {messages.map((m) =>
        m.role === "user" ? (
          <UserMessage key={m.id} text={m.text} />
        ) : (
          <AssistantMessage
            key={m.id}
            m={m}
            subjectName={subjectName}
            openSource={openSource}
            onToggleSource={onToggleSource}
            onFeedback={onFeedback}
            onRetry={onRetry}
          />
        ),
      )}
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[88%] whitespace-pre-wrap rounded-xl border border-border bg-raised px-4 py-3 text-base leading-[1.6] text-heading tab:max-w-[80%]">
        {text}
      </p>
    </div>
  );
}

function AssistantMessage({
  m,
  subjectName,
  openSource,
  onToggleSource,
  onFeedback,
  onRetry,
}: {
  m: Assistant;
  subjectName: string;
  openSource: OpenSource;
  onToggleSource: (messageId: string, index: number) => void;
  onFeedback: (messageId: string, value: -1 | 1) => void;
  onRetry: (messageId: string) => void;
}) {
  const busy = m.status === "thinking" || m.status === "streaming";
  const done = m.status === "done";

  return (
    <div className="flex gap-3.5">
      <div className="pt-0.5">
        <AiMark size={24} animated={busy} />
      </div>
      <div className="min-w-0 flex-1">
        {m.status === "thinking" && (
          <p role="status" className="text-[15px] text-muted">
            Checking the {subjectName} syllabus
          </p>
        )}

        {m.status === "error" && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-warn-border bg-warn-bg px-4 py-3 text-warn-text"
          >
            <span>The answer didn&apos;t load.</span>
            <button
              onClick={() => onRetry(m.id)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-warn-border px-3 text-sm font-medium"
            >
              <RotateCcw size={16} strokeWidth={1.75} />
              Retry
            </button>
          </div>
        )}

        {m.outOfSyllabus && done ? (
          <>
            <p className="text-base leading-[1.7] text-body">
              That isn&apos;t covered in the {subjectName} syllabus I have.
            </p>
            <p className="mt-3 text-base leading-[1.7] text-body">
              Try a question about a topic in the syllabus.
            </p>
            <div className="mt-4 border-t border-border pt-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                Not in the syllabus
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {m.blocks.slice(0, m.shown).map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
          </div>
        )}

        {done && !m.outOfSyllabus && m.citations.length > 0 && (
          <div className="mt-5 border-t border-border pt-2">
            {m.citations.map((c, i) => {
              const open = openSource?.messageId === m.id && openSource.index === i;
              return (
                <button
                  key={i}
                  aria-pressed={open}
                  onClick={() => onToggleSource(m.id, i)}
                  className={`flex min-h-11 w-full items-center gap-1.5 rounded-lg px-2 text-start font-mono text-[10.5px] uppercase tracking-[0.12em] text-accent hover:bg-raised tab:min-h-[34px] ${
                    open ? "bg-raised" : ""
                  }`}
                >
                  <span className="min-w-0 truncate">{citationLabel(c)}</span>
                  <ChevronRight size={14} strokeWidth={1.75} className="shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {done && (
          <div className="mt-2 flex gap-1">
            <FeedbackButton
              label="Helpful"
              active={m.feedback === 1}
              onClick={() => onFeedback(m.id, 1)}
              icon={ThumbsUp}
            />
            <FeedbackButton
              label="Not helpful"
              active={m.feedback === -1}
              onClick={() => onFeedback(m.id, -1)}
              icon={ThumbsDown}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function citationLabel(c: Citation) {
  return `${c.doc} · Topic ${c.topic} · P.${c.page}`;
}

function FeedbackButton({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: typeof ThumbsUp;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex size-11 items-center justify-center rounded-lg hover:bg-raised tab:size-9 ${
        active ? "text-accent" : "text-muted"
      }`}
    >
      <Icon size={18} strokeWidth={1.75} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "p":
      return <p className="text-base leading-[1.7] text-body">{b.x}</p>;
    case "ul":
      return (
        <ul className="flex flex-col gap-3">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3 text-base leading-[1.7] text-body">
              <span className="mt-[12px] size-[5px] shrink-0 rounded-full bg-accent" />
              {it}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="flex flex-col gap-3">
          {b.items.map((it, i) => (
            <li key={it} className="flex gap-3 text-base leading-[1.7] text-body">
              <span className="w-5 shrink-0 pt-[3px] font-mono text-[13px] text-accent">{i + 1}.</span>
              {it}
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="bg-card">
                {b.head.map((h) => (
                  <th
                    key={h}
                    className="px-3.5 py-2.5 text-start font-mono text-[10.5px] font-normal uppercase tracking-[0.12em] text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  {r.map((cell, j) => (
                    <td key={j} className="px-3.5 py-2.5 text-sm leading-[1.5] text-body">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "f":
      return (
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p
            className={
              b.plain
                ? "font-serif text-lg font-semibold text-heading"
                : "font-serif text-[26px] font-semibold italic text-heading"
            }
          >
            {b.x}
          </p>
          {b.where && (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-border pt-3">
              {b.where.map(([sym, meaning]) => (
                <div key={sym} className="contents">
                  <dt className="font-serif text-lg italic text-accent">{sym}</dt>
                  <dd className="text-sm text-body">{meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      );
  }
}
