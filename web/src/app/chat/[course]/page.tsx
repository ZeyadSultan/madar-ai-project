import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Brand } from "@/components/Brand";
import { examLabel, findCourse } from "@/lib/courses";

// Placeholder: the chat screen is built in a later stage.
export default function ChatPage({ params }: { params: Promise<{ course: string }> }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 items-center border-b border-border px-4 tab:px-8">
        <Brand size={24} />
      </header>
      <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <Suspense>
          <ChatContent params={params} />
        </Suspense>
        <p className="text-muted">The chat is coming in the next stage.</p>
        <Link href="/subjects" className="text-accent hover:underline">
          Back to subjects
        </Link>
      </main>
    </div>
  );
}

async function ChatContent({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  const c = findCourse(course);
  if (!c || !c.live) notFound();
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
        {examLabel(c.board.id, c.level.id)}
      </p>
      <h1 className="font-serif text-[40px] font-semibold tracking-[-0.02em] text-heading">
        {c.subject.name}
      </h1>
    </>
  );
}
