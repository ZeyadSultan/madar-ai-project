"use client";

import { ArrowUp } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

export function Composer({
  placeholder,
  disabled,
  onSend,
}: {
  placeholder: string;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && text.trim().length > 0;

  // Auto-grow the textarea up to 168px.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [text]);

  function send() {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 ps-4 focus-within:border-accent">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="max-h-[168px] min-h-10 flex-1 resize-none self-center bg-transparent py-2 text-base leading-[1.5] text-heading outline-none focus-visible:outline-none placeholder:text-muted"
        />
        <button
          onClick={send}
          disabled={!canSend}
          aria-label="Send"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-action text-on-action disabled:bg-raised disabled:text-muted tab:size-10"
        >
          <ArrowUp size={20} strokeWidth={2} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        Madar AI can make mistakes. Check the source.
      </p>
    </div>
  );
}
