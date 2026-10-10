import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChatApp } from "@/components/chat/ChatApp";
import { findCourse } from "@/lib/courses";

export default function ChatPage({ params }: { params: Promise<{ course: string }> }) {
  return (
    <Suspense>
      <ChatRoute params={params} />
    </Suspense>
  );
}

async function ChatRoute({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  const c = findCourse(course);
  if (!c || !c.live) notFound();
  // key resets all chat state when the student switches course
  return <ChatApp key={c.id} courseId={c.id} />;
}
