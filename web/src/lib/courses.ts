import { SUBJECTS, type SubjectId } from "./subjects";

export const BOARDS = [
  { id: "cambridge", name: "Cambridge" },
  { id: "edexcel", name: "Pearson Edexcel" },
  { id: "oxfordaqa", name: "OxfordAQA" },
] as const;

export const LEVELS = [
  { id: "igcse", name: "IGCSE" },
  { id: "o-level", name: "O Level" },
  { id: "a-level", name: "AS & A Level" },
] as const;

export type BoardId = (typeof BOARDS)[number]["id"];
export type LevelId = (typeof LEVELS)[number]["id"];

// Which levels each board offers.
const OFFERED: Record<BoardId, LevelId[]> = {
  cambridge: ["igcse", "o-level", "a-level"],
  edexcel: ["igcse", "a-level"],
  oxfordaqa: ["igcse", "a-level"],
};

// Courses that have syllabus/book content loaded. Everything else is "coming soon".
const LIVE = new Set(["cambridge-igcse-econ"]);

export type Course = {
  id: string;
  board: (typeof BOARDS)[number];
  level: (typeof LEVELS)[number];
  subject: { id: SubjectId; name: string };
  live: boolean;
};

export function levelsFor(board: BoardId) {
  return LEVELS.filter((l) => OFFERED[board].includes(l.id));
}

export function coursesFor(board: BoardId, level: LevelId): Course[] {
  const b = BOARDS.find((x) => x.id === board);
  const l = LEVELS.find((x) => x.id === level);
  if (!b || !l || !OFFERED[board].includes(level)) return [];
  return SUBJECTS.map((s) => {
    const id = `${board}-${level}-${s.id}`;
    return { id, board: b, level: l, subject: s, live: LIVE.has(id) };
  });
}

export function findCourse(id: string): Course | undefined {
  for (const b of BOARDS) {
    for (const l of levelsFor(b.id)) {
      const c = coursesFor(b.id, l.id).find((x) => x.id === id);
      if (c) return c;
    }
  }
}

export function examLabel(board: BoardId, level: LevelId) {
  const b = BOARDS.find((x) => x.id === board)?.name;
  const l = LEVELS.find((x) => x.id === level)?.name;
  return `${b} · ${l}`;
}

export function liveCourses(): Course[] {
  const out: Course[] = [];
  for (const b of BOARDS) {
    for (const l of levelsFor(b.id)) {
      out.push(...coursesFor(b.id, l.id).filter((c) => c.live));
    }
  }
  return out;
}
