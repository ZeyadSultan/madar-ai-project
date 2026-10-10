export const SUBJECTS = [
  { id: "math", name: "Mathematics" },
  { id: "phys", name: "Physics" },
  { id: "chem", name: "Chemistry" },
  { id: "bio", name: "Biology" },
  { id: "econ", name: "Economics" },
  { id: "bus", name: "Business Studies" },
  { id: "eng", name: "English" },
  { id: "cs", name: "Computer Science" },
  { id: "geo", name: "Geography" },
  { id: "hist", name: "History" },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]["id"];

export function findSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id);
}
