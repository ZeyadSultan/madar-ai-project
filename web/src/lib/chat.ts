// Chat types and SAMPLE data. Placeholders only: the real answers come from the backend later.

export type Block =
  | { t: "p"; x: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "f"; x: string; plain?: boolean; where?: [string, string][] };

export type Citation = {
  doc: string; // e.g. "Economics syllabus"
  topic: string;
  title: string;
  page: number;
  lines: { text: string; cited: boolean }[];
};

export type Answer = { blocks: Block[]; citations: Citation[] };

export type Message =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      question: string;
      status: "thinking" | "streaming" | "done" | "error";
      blocks: Block[];
      shown: number; // how many blocks are visible while streaming
      citations: Citation[];
      outOfSyllabus: boolean;
      feedback: -1 | 0 | 1;
      fail?: boolean; // sample-only: shows the error state once
    };

export type Conversation = {
  id: string;
  courseId: string;
  title: string;
  messages: Message[];
};

const lines = (rows: [string, 0 | 1][]) => rows.map(([text, c]) => ({ text, cited: c === 1 }));

const DOC = "Economics syllabus";

const INFL: Citation = {
  doc: DOC,
  topic: "2.3",
  title: "Inflation and deflation",
  page: 12,
  lines: lines([
    ["Candidates should be able to:", 0],
    ["Define inflation as a sustained rise in the general price level, and deflation as a sustained fall in the general price level.", 1],
    ["Describe how a consumer prices index (CPI) is used to measure inflation.", 1],
    ["Explain the causes of inflation: demand-pull and cost-push.", 0],
    ["Discuss the consequences of inflation for consumers, workers, savers, lenders and firms.", 0],
  ]),
};

const INFL_CAUSE: Citation = {
  doc: DOC,
  topic: "2.3",
  title: "Inflation and deflation",
  page: 12,
  lines: lines([
    ["Candidates should be able to:", 0],
    ["Define inflation as a sustained rise in the general price level.", 0],
    ["Explain the causes of inflation: demand-pull and cost-push.", 1],
    ["Discuss the consequences of inflation for consumers, workers, savers, lenders and firms.", 0],
  ]),
};

const MON: Citation = {
  doc: DOC,
  topic: "2.5",
  title: "Monetary policy",
  page: 14,
  lines: lines([
    ["Candidates should be able to:", 0],
    ["Define monetary policy as changes in interest rates, the money supply and foreign exchange rates.", 0],
    ["Analyse how changes in interest rates affect consumer spending, borrowing and saving.", 1],
  ]),
};

const PED: Citation = {
  doc: DOC,
  topic: "3.4",
  title: "Price elasticity of demand",
  page: 16,
  lines: lines([
    ["Candidates should be able to:", 0],
    ["Define price elasticity of demand (PED).", 0],
    ["Calculate PED using the formula: percentage change in quantity demanded divided by percentage change in price.", 1],
    ["Interpret PED values and explain the relationship between PED and total spending on a product.", 1],
  ]),
};

const ANSWERS: Record<string, Answer> = {
  infl: {
    blocks: [
      { t: "p", x: "Inflation is a sustained rise in the general price level in an economy over time." },
      { t: "p", x: "When prices rise, each unit of money buys fewer goods and services. This is a fall in the purchasing power of money." },
      { t: "p", x: "It is usually measured with a consumer prices index (CPI), which tracks the price of a typical basket of goods bought by households." },
    ],
    citations: [INFL],
  },
  causes: {
    blocks: [
      { t: "p", x: "From Topic 2.3, inflation has two main causes." },
      {
        t: "ul",
        items: [
          "Demand-pull: total demand grows faster than the economy can produce goods and services, so prices are pulled up.",
          "Cost-push: firms’ costs rise, for example wages or imported raw materials, and firms pass them on as higher prices.",
        ],
      },
      { t: "p", x: "From Topic 2.5, a fall in interest rates can add to demand-pull inflation. Borrowing becomes cheaper, so households spend more." },
    ],
    citations: [INFL_CAUSE, MON],
  },
  ped: {
    blocks: [
      { t: "p", x: "Price elasticity of demand (PED) measures how much the quantity demanded responds to a change in price." },
      { t: "f", x: "PED = % change in quantity demanded ÷ % change in price", plain: true },
      { t: "p", x: "Example: the price rises by 10% and quantity demanded falls by 20%. PED = −20 ÷ 10 = −2, so demand is price elastic." },
      {
        t: "table",
        head: ["PED, ignoring the sign", "Demand is", "If price rises, total revenue"],
        rows: [
          ["Greater than 1", "Price elastic", "Falls"],
          ["Less than 1", "Price inelastic", "Rises"],
          ["Equal to 1", "Unitary", "Stays the same"],
        ],
      },
    ],
    citations: [PED],
  },
};

// Example question chips per subject id (only Economics has sample content).
export const QUICK: Record<string, [string, keyof typeof ANSWERS][]> = {
  econ: [
    ["What is inflation?", "infl"],
    ["What causes inflation?", "causes"],
    ["How is price elasticity of demand calculated?", "ped"],
  ],
};

const norm = (x: string) => x.toLowerCase().trim().replace(/[?.!\s]+$/, "");

/** Returns a sample answer, or null when the question is "not in the syllabus". */
export function getSampleAnswer(text: string, subjectId: string): Answer | null {
  if (subjectId !== "econ") return null;
  const n = norm(text);
  const hit = (QUICK.econ ?? []).find(([q]) => norm(q) === n);
  if (hit) return ANSWERS[hit[1]];
  if (/inflation/.test(n)) return ANSWERS[/caus|why/.test(n) ? "causes" : "infl"];
  if (/elastic/.test(n)) return ANSWERS.ped;
  return null;
}

/** Typing this exact phrase shows the error state, so it can be reviewed. */
export const ERROR_TRIGGER = "test error";
