"use client";

import { ChevronDown, Menu, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ERROR_TRIGGER,
  QUICK,
  getSampleAnswer,
  type Conversation,
  type Message,
} from "@/lib/chat";
import { coursesFor, findCourse } from "@/lib/courses";
import { useUser } from "@/lib/store";
import { AiMark } from "../Marks";
import { SettingsModal } from "../SettingsModal";
import { Composer } from "./Composer";
import { MessageList, type OpenSource } from "./Messages";
import { Sidebar } from "./Sidebar";
import { SourcePanel } from "./SourcePanel";
import { SubjectMenu } from "./SubjectMenu";

type Assistant = Extract<Message, { role: "assistant" }>;

function buildAssistant(question: string, forceOk = false): Assistant {
  const fail = !forceOk && question.trim().toLowerCase() === ERROR_TRIGGER;
  const answer = fail ? null : getSampleAnswer(forceOk ? "What is inflation?" : question, "econ");
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    question,
    status: "thinking",
    blocks: answer?.blocks ?? [],
    shown: 0,
    citations: answer?.citations ?? [],
    outOfSyllabus: !fail && !answer,
    feedback: 0,
    fail,
  };
}

export function ChatApp({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { user, ready } = useUser();
  const course = findCourse(courseId)!;
  const subjectName = course.subject.name;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openSource, setOpenSource] = useState<OpenSource>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = useMemo(() => active?.messages ?? [], [active]);
  const last = messages[messages.length - 1];
  const pending =
    last?.role === "assistant" && (last.status === "thinking" || last.status === "streaming")
      ? last
      : null;

  useEffect(() => {
    if (ready && !user) router.replace("/auth/sign-in");
  }, [ready, user, router]);

  // Escape closes menus, the drawer and the source panel (the modal handles its own).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || settingsOpen) return;
      setSubjectMenuOpen(false);
      setDrawerOpen(false);
      setOpenSource(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  function patch(convId: string, msgId: string, change: Partial<Assistant>) {
    setConversations((cs) =>
      cs.map((c) =>
        c.id !== convId
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId && m.role === "assistant" ? { ...m, ...change } : m,
              ),
            },
      ),
    );
  }

  // Simulated answer: thinking 1.2s, then one block every 0.5s.
  useEffect(() => {
    if (!pending || !activeId) return;
    const t = setTimeout(
      () => {
        const total = pending.blocks.length;
        if (pending.status === "thinking") {
          if (pending.fail) patch(activeId, pending.id, { status: "error" });
          else if (total === 0) patch(activeId, pending.id, { status: "done" });
          else patch(activeId, pending.id, { status: "streaming", shown: 1 });
        } else if (pending.shown >= total) {
          patch(activeId, pending.id, { status: "done" });
        } else {
          patch(activeId, pending.id, { shown: pending.shown + 1 });
        }
      },
      pending.status === "thinking" ? 1200 : 500,
    );
    return () => clearTimeout(t);
  }, [pending, activeId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function send(text: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    const reply = buildAssistant(text);
    if (active) {
      setConversations((cs) =>
        cs.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, userMsg, reply] } : c)),
      );
    } else {
      const id = crypto.randomUUID();
      setConversations((cs) => [...cs, { id, courseId, title: text, messages: [userMsg, reply] }]);
      setActiveId(id);
    }
  }

  function retry(messageId: string) {
    if (!activeId) return;
    const m = messages.find((x) => x.id === messageId);
    if (m?.role !== "assistant") return;
    const fresh = buildAssistant(m.question, true);
    patch(activeId, messageId, { ...fresh, id: messageId });
  }

  function feedback(messageId: string, value: -1 | 1) {
    if (!activeId) return;
    const m = messages.find((x) => x.id === messageId);
    if (m?.role !== "assistant") return;
    patch(activeId, messageId, { feedback: m.feedback === value ? 0 : value });
  }

  function toggleSource(messageId: string, index: number) {
    setOpenSource((cur) =>
      cur?.messageId === messageId && cur.index === index ? null : { messageId, index },
    );
  }

  function newChat() {
    setActiveId(null);
    setOpenSource(null);
    setDrawerOpen(false);
  }

  function selectChat(id: string) {
    setActiveId(id);
    setOpenSource(null);
    setDrawerOpen(false);
  }

  if (!user) return null;

  const sourceMsg = messages.find((m) => m.id === openSource?.messageId);
  const sourceCitation =
    sourceMsg?.role === "assistant" && openSource ? sourceMsg.citations[openSource.index] : undefined;
  const chips = QUICK[course.subject.id] ?? [];
  const placeholder = `Ask about ${subjectName}`;

  return (
    <div className="flex h-dvh overflow-hidden bg-page">
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-[var(--scrim)] desk:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      <Sidebar
        user={user}
        subjectName={subjectName}
        conversations={conversations}
        activeId={activeId}
        collapsed={collapsed}
        drawerOpen={drawerOpen}
        onNewChat={newChat}
        onSelect={selectChat}
        onCollapse={setCollapsed}
        onOpenSubjectMenu={() => {
          setDrawerOpen(false);
          setSubjectMenuOpen(true);
        }}
        onOpenSettings={() => {
          setDrawerOpen(false);
          setSettingsOpen(true);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border px-2 tab:h-[60px] tab:px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-raised desk:hidden"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
          <div className="relative flex flex-1 justify-center tab:justify-start">
            <button
              onClick={() => setSubjectMenuOpen((o) => !o)}
              aria-label="Switch subject"
              aria-expanded={subjectMenuOpen}
              className="flex h-9 items-center gap-2 rounded-full border border-border-strong bg-raised px-3.5 text-sm font-medium text-accent"
            >
              <span className="size-[7px] rounded-full bg-cta" />
              {subjectName}
              <ChevronDown size={16} strokeWidth={1.75} />
            </button>
            {subjectMenuOpen && (
              <SubjectMenu
                courses={coursesFor(course.board.id, course.level.id)}
                currentId={courseId}
                onClose={() => setSubjectMenuOpen(false)}
              />
            )}
          </div>
          <button
            onClick={newChat}
            aria-label="New chat"
            className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-raised tab:hidden"
          >
            <Plus size={20} strokeWidth={1.75} />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col items-center justify-center px-4 pb-10 tab:px-6">
              <AiMark size={44} animated={false} />
              <h1 className="mt-4 text-center font-serif text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-heading tab:text-[40px]">
                {subjectName}
              </h1>
              <div className="mt-8 w-full">
                <Composer placeholder={placeholder} disabled={!!pending} onSend={send} />
              </div>
              <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
                {chips.map(([q]) => (
                  <li key={q}>
                    <button
                      onClick={() => send(q)}
                      className="min-h-11 rounded-full border border-border bg-card px-4 text-sm text-heading hover:border-border-strong hover:bg-raised"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <MessageList
              messages={messages}
              subjectName={subjectName}
              openSource={openSource}
              onToggleSource={toggleSource}
              onFeedback={feedback}
              onRetry={retry}
            />
          )}
        </div>

        {messages.length > 0 && (
          <div className="mx-auto w-full max-w-[760px] shrink-0 px-3 pb-2.5 tab:px-6 tab:pb-4">
            <Composer placeholder={placeholder} disabled={!!pending} onSend={send} />
          </div>
        )}
      </div>

      {sourceCitation && <SourcePanel citation={sourceCitation} onClose={() => setOpenSource(null)} />}
      {settingsOpen && <SettingsModal user={user} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
