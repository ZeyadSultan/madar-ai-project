"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { SettingsModal } from "@/components/SettingsModal";
import { BOARDS, coursesFor, examLabel, levelsFor, type BoardId } from "@/lib/courses";
import { initial, useExam, useUser } from "@/lib/store";

export default function SubjectsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [exam, setExam] = useExam();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const [board, setBoard] = useState<BoardId | null>(null);

  useEffect(() => {
    if (!user) router.replace("/auth/sign-in");
  }, [user, router]);

  if (!user) return null;

  const picking = !exam || changing;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 tab:px-6 desk:px-8">
        <Brand size={24} />
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          className="flex size-[34px] items-center justify-center rounded-full border border-border-strong bg-raised text-[13px] font-semibold text-accent"
        >
          {initial(user)}
        </button>
      </header>

      <main className="mx-auto w-full max-w-[1080px] px-4 pb-12 pt-7 tab:px-8 tab:pb-[72px] tab:pt-14">
        {picking ? (
          <ExamPicker
            board={board}
            onBoard={setBoard}
            onBack={() => setBoard(null)}
            onPick={(level) => {
              setExam({ board: board!, level });
              setChanging(false);
              setBoard(null);
            }}
            onCancel={exam ? () => { setChanging(false); setBoard(null); } : undefined}
          />
        ) : (
          <>
            <h1 className="font-serif text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-heading tab:text-[40px]">
              Choose a subject
            </h1>
            <p className="mt-3 flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
                {examLabel(exam.board, exam.level)}
              </span>
              <button
                onClick={() => setChanging(true)}
                className="text-sm text-muted underline-offset-2 hover:text-heading hover:underline"
              >
                Change exam
              </button>
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3 tab:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] tab:gap-4">
              {coursesFor(exam.board, exam.level).map((c, i) => (
                <li key={c.id}>
                  <CourseCard
                    index={i + 1}
                    name={c.subject.name}
                    live={c.live}
                    href={`/chat/${c.id}`}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      {settingsOpen && <SettingsModal user={user} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

const cardBase =
  "flex min-h-[100px] flex-col justify-between rounded-xl border border-border bg-card px-5 py-[18px] tab:min-h-[124px]";

function CourseCard({
  index,
  name,
  live,
  href,
}: {
  index: number;
  name: string;
  live: boolean;
  href: string;
}) {
  const top = (
    <span className="flex items-center justify-between font-mono text-[11px] text-muted">
      {String(index).padStart(2, "0")}
      {!live && <span className="uppercase tracking-[0.12em]">Coming soon</span>}
    </span>
  );
  const title = (
    <span className="font-serif text-lg font-semibold text-heading tab:text-xl">{name}</span>
  );
  if (!live) {
    return (
      <div aria-disabled="true" className={`${cardBase} opacity-60`}>
        {top}
        {title}
      </div>
    );
  }
  return (
    <Link href={href} className={`${cardBase} hover:border-border-strong hover:bg-raised`}>
      {top}
      {title}
    </Link>
  );
}

function ExamPicker({
  board,
  onBoard,
  onBack,
  onPick,
  onCancel,
}: {
  board: BoardId | null;
  onBoard: (b: BoardId) => void;
  onBack: () => void;
  onPick: (level: ReturnType<typeof levelsFor>[number]["id"]) => void;
  onCancel?: () => void;
}) {
  const boardName = BOARDS.find((b) => b.id === board)?.name;
  return (
    <>
      <h1 className="font-serif text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-heading tab:text-[40px]">
        {board ? "Choose your level" : "Choose your exam"}
      </h1>
      <p className="mt-3 flex items-center gap-3 text-sm text-muted">
        {board ? boardName : "Exam board"}
        {board ? (
          <button onClick={onBack} className="underline-offset-2 hover:text-heading hover:underline">
            Back
          </button>
        ) : (
          onCancel && (
            <button onClick={onCancel} className="underline-offset-2 hover:text-heading hover:underline">
              Cancel
            </button>
          )
        )}
      </p>
      <ul className="mt-8 grid gap-3 tab:grid-cols-3 tab:gap-4">
        {(board ? levelsFor(board) : BOARDS).map((item, i) => (
          <li key={item.id}>
            <button
              onClick={() => (board ? onPick(item.id as never) : onBoard(item.id as BoardId))}
              className={`${cardBase} w-full text-left hover:border-border-strong hover:bg-raised`}
            >
              <span className="font-mono text-[11px] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-serif text-lg font-semibold text-heading tab:text-xl">
                {item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
