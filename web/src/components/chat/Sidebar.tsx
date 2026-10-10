"use client";

import { ChevronDown, PanelLeft, Plus } from "lucide-react";
import type { Conversation } from "@/lib/chat";
import { initial, type User } from "@/lib/store";
import { Mark } from "../Marks";

type Props = {
  user: User;
  subjectName: string;
  conversations: Conversation[];
  activeId: string | null;
  collapsed: boolean;
  drawerOpen: boolean;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onCollapse: (collapsed: boolean) => void;
  onOpenSubjectMenu: () => void;
  onOpenSettings: () => void;
};

export function Sidebar(p: Props) {
  return (
    <>
      {/* Full sidebar: a drawer below 1100px, docked at 1100px and up */}
      <aside
        aria-label="Chats"
        className={`fixed inset-y-0 start-0 z-40 flex w-[300px] max-w-[86%] flex-col border-e border-border bg-panel transition-transform ${
          p.drawerOpen ? "translate-x-0" : "-translate-x-full"
        } desk:static desk:z-auto desk:w-[280px] desk:max-w-none desk:translate-x-0 ${
          p.collapsed ? "desk:hidden" : ""
        }`}
      >
        <div className="flex h-[60px] shrink-0 items-center gap-2.5 ps-4 pe-2">
          <Mark size={24} />
          <span className="flex-1 text-[17px] font-semibold text-heading">Madar AI</span>
          <button
            onClick={() => p.onCollapse(true)}
            aria-label="Collapse sidebar"
            className="hidden size-11 items-center justify-center rounded-lg text-muted hover:bg-raised desk:flex"
          >
            <PanelLeft size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-3 pb-4">
          <button
            onClick={p.onNewChat}
            className="flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-heading hover:bg-raised"
          >
            <Plus size={18} strokeWidth={1.75} />
            New chat
          </button>
          <div>
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Subject</p>
            <button
              onClick={p.onOpenSubjectMenu}
              aria-label="Switch subject"
              className="flex h-11 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-sm text-heading hover:border-border-strong"
            >
              {p.subjectName}
              <ChevronDown size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto border-t border-border px-3 py-4">
          {p.conversations.length > 0 && (
            <>
              <p className="mb-2 px-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Today</p>
              <ul className="flex flex-col gap-1">
                {[...p.conversations].reverse().map((c) => {
                  const active = c.id === p.activeId;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => p.onSelect(c.id)}
                        aria-current={active ? "true" : undefined}
                        className={`flex min-h-11 w-full flex-col justify-center rounded-lg px-2.5 py-2 text-start hover:bg-raised ${
                          active ? "bg-raised" : ""
                        }`}
                      >
                        <span className={`w-full truncate text-sm ${active ? "text-heading" : "text-body"}`}>
                          {c.title}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          {p.subjectName}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>

        <button
          onClick={p.onOpenSettings}
          className="flex items-center gap-3 border-t border-border px-4 py-3 text-start hover:bg-raised"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-raised text-[13px] font-semibold text-accent">
            {initial(p.user)}
          </span>
          <span className="min-w-0">
            {p.user.firstName && (
              <span className="block truncate text-sm font-medium text-heading">{p.user.firstName}</span>
            )}
            <span className="block truncate text-xs text-muted">{p.user.email}</span>
          </span>
        </button>
      </aside>

      {/* Collapsed rail (1100px and up) */}
      {p.collapsed && (
        <div className="hidden w-16 shrink-0 flex-col items-center gap-1 border-e border-border bg-panel py-3 desk:flex">
          <div className="flex h-11 items-center">
            <Mark size={24} />
          </div>
          <RailButton label="Expand sidebar" onClick={() => p.onCollapse(false)}>
            <PanelLeft size={20} strokeWidth={1.75} />
          </RailButton>
          <RailButton label="New chat" onClick={p.onNewChat}>
            <Plus size={20} strokeWidth={1.75} />
          </RailButton>
          <div className="flex-1" />
          <button
            onClick={p.onOpenSettings}
            aria-label="Settings"
            className="flex size-9 items-center justify-center rounded-full border border-border-strong bg-raised text-[13px] font-semibold text-accent"
          >
            {initial(p.user)}
          </button>
        </div>
      )}
    </>
  );
}

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-raised"
    >
      {children}
    </button>
  );
}
