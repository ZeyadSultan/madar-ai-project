import Link from "next/link";
import { AiMark } from "@/components/Marks";
import { Brand } from "@/components/Brand";
import { liveCourses } from "@/lib/courses";
import { SUBJECTS } from "@/lib/subjects";

const STATEMENTS = [
  "Answers come only from the syllabus.",
  "Every answer shows its source.",
  "If it isn't in the syllabus, Madar AI says so.",
];

export default function Landing() {
  const live = liveCourses();
  const liveSubjects = new Set(live.map((c) => c.subject.id));
  const soon = SUBJECTS.filter((s) => !liveSubjects.has(s.id)).map((s) => s.name);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 tab:px-6 desk:px-8">
      <header className="flex h-[76px] items-center justify-between">
        <Brand />
        <Link
          href="/auth/sign-in"
          className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-[15px] font-medium text-heading hover:bg-raised"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1">
        <section className="grid items-center gap-10 pb-24 pt-[72px] desk:grid-cols-[1.4fr_1fr]">
          <div className="order-2 desk:order-1">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-cta">
              IGCSE study assistant
            </p>
            <h1 className="mt-4 font-serif text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-heading tab:text-[52px] desk:text-[64px]">
              Ask anything in your syllabus.
            </h1>
            <Link
              href="/auth/sign-up"
              className="mt-8 inline-flex h-[52px] items-center rounded-lg bg-cta px-[26px] text-base font-semibold text-on-cta hover:brightness-110"
            >
              Start asking
            </Link>
          </div>
          <div className="order-1 flex justify-center desk:order-2 desk:justify-end">
            <div className="hidden desk:block">
              <AiMark size={260} />
            </div>
            <div className="hidden tab:block desk:hidden">
              <AiMark size={200} />
            </div>
            <div className="tab:hidden">
              <AiMark size={120} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 tab:grid-cols-3">
          {STATEMENTS.map((text, i) => (
            <div key={text} className="border-t border-border pt-4">
              <p className="font-mono text-xs text-cta">0{i + 1}</p>
              <p className="mt-3 font-serif text-xl font-semibold leading-[1.35] text-heading tab:text-[22px]">
                {text}
              </p>
            </div>
          ))}
        </section>

        <section className="py-[72px]">
          <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Available now
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {live.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/auth/sign-up?next=/chat/${c.id}`}
                  className="inline-flex h-11 items-center gap-3 rounded-full border border-border bg-card px-[18px] text-[15px] text-heading hover:border-border-strong hover:bg-raised"
                >
                  {c.subject.name}
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-accent">
                    {c.board.name} · {c.level.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Coming soon
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {soon.map((name) => (
              <li
                key={name}
                className="inline-flex h-11 items-center rounded-full border border-dashed border-border px-[18px] text-[15px] text-muted"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-muted">
            More exam boards and levels are on the way: Pearson Edexcel, OxfordAQA, O Level and AS &amp; A Level.
          </p>
        </section>
      </main>

      <footer className="flex flex-col gap-3 border-t border-border py-7 tab:flex-row tab:items-center tab:justify-between">
        <p className="text-[13px] text-muted">Not affiliated with any exam board.</p>
        <p className="flex items-center gap-3 text-[13px] text-muted">
          A Madar product
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/madar-logo-dark-bg.svg" alt="Madar" height={20} className="logo-dark h-5 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/madar-logo-light-bg.svg" alt="Madar" height={20} className="logo-light h-5 w-auto" />
        </p>
      </footer>
    </div>
  );
}
