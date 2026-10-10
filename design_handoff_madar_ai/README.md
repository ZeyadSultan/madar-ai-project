# Handoff: Madar AI — IGCSE study assistant (website)

## Overview
Madar AI is a chat website for IGCSE students (14–16). The student picks a subject, asks questions, and gets answers **only from that subject's syllabus**, each ending with a citation to the syllabus passage. If the answer isn't in the syllabus, Madar AI says so. No marketplace, payments, teachers, parents, social features or gamification.

Core flow: Landing → Sign in / Sign up → Subject picker → Chat (ask, thinking, answer + citation) → Source panel (syllabus excerpt).

## About the design files
The files in `design/` are **design references built in HTML** (prototypes of look and behaviour), not production code. Recreate them in the target stack (recommended if none exists: Next.js + React + TypeScript + CSS variables/Tailwind). Open `design/Madar AI Prototype.dc.html` in a browser for the working prototype (keep `support.js` and `assets/` beside it). The single source of truth for UI, copy, states and sample content is the prototype file: its template markup (inline styles = exact values) and its `<script>` logic (copy strings, sample data, state machine).

## Fidelity
**High-fidelity.** Final colours, type, spacing, copy and interactions. Recreate pixel-accurately.

Scope now: **English only**, **dark (default) + light mode**. The prototype still contains Arabic/RTL support (Settings → Language); treat it as parked/future. If built later: `dir="rtl"` on root, logical CSS properties, mirror chevrons and panel docking, IBM Plex Sans Arabic for all Arabic (no uppercase, no letter-spacing), syllabus excerpts stay English LTR, `dir="auto"` on user-generated text.

## Design tokens

### Colour — theme variables (exact names used in the prototype)
Chosen palette: **1c — Indigo night with Madar accents** (dark). Light mode uses the Madar light palette.

| Token | Dark (default, 1c) | Light | Use |
|---|---|---|---|
| `--page` | #0B1029 | #FBF7F1 | Page / chat background |
| `--panel` | #0E1533 | #F4EEE5 | Sidebar, source panel, sheets, modal |
| `--card` | #111838 | #FFFFFF | Cards, composer, formula block, menus |
| `--raised` | #1A2350 | #EFE7DA | Chips, user bubble, active rows, hover |
| `--border` | #2A3363 | #E8E0D5 | 1px borders, dividers, citation rule |
| `--border-strong` | #3A4586 | #D3C6B4 | Hover / emphasised borders, grabber |
| `--accent` | #8FE0CF | #0F5C52 | Citations, labels, focus ring, selected chips, links |
| `--action` | #E27A4E | #0F5C52 | Buttons: send, sign in, create account |
| `--on-action` | #FFFFFF | #FFFFFF | Text/icons on `--action` |
| `--cta` | #E27A4E | #D97048 | "Start asking", landing eyebrow + numerals, subject-chip dot, excerpt underline, mark core |
| `--on-cta` | #FFFFFF | #FFFFFF | Text on CTA |
| `--heading` | #EAF0FF | #221F1C | Headings, student message text |
| `--body` | #D5DAF7 | #3B3631 | Body / answer text |
| `--muted` | #9AA3D0 | #635C54 | Labels, meta, disclaimer, placeholders |
| `--hl` | #2A3363 | #F8DCCD | Highlight background for cited sentences |
| `--warn-bg / -border / -text` | #33280F / #6B5427 / #E0AE55 | #FBF1DC / #E2C68A / #7A5410 | Errors & failed answer |
| `--scrim` | rgba(11,16,41,.72) | rgba(34,31,28,.4) | Overlays |
| `--mark-ring / --mark-inner` | rgba(143,224,207,.35 / .45) | rgba(15,92,82,.28 / .40) | Animated mark rings |

Light-mode values not in the brand kit (`--panel`, `--raised`, `--border-strong`, `--body`, `--hl`, warning set) were derived to harmonise with kit light colours (paper #FBF7F1, ink #221F1C, muted #635C54, line #E8E0D5, deep teal #0F5C52, terracotta #D97048, peach #F3C4AE). Success (rarely used): dark text #93E0AC / bg #0F3322 / border #276B41.

In 1c dark, all buttons are terracotta with white text (≈3.2:1 — keep labels 15–16px semibold or review). Teal light (#8FE0CF) is for citations, labels, focus and selection. In light mode buttons switch to deep teal #0F5C52 for AA contrast.

### Typography (Google Fonts: Source Serif 4, IBM Plex Sans, IBM Plex Mono, IBM Plex Sans Arabic)
| Style | Spec |
|---|---|
| Display (landing h1) | Source Serif 4 600, 64px desktop / 52 tablet / 40 mobile, lh 1.05, ls −0.02em |
| H1 (subject picker, empty-state subject) | Source Serif 4 600, 40px (mobile 30–32), lh 1.15–1.2, ls −0.02em |
| Auth title | Source Serif 4 600, 30px |
| H2 panel / modal title | Source Serif 4 600, 24px, lh 1.2 |
| Card title | Source Serif 4 600, 20px (mobile 18) |
| Landing statements | Source Serif 4 600, 22px (mobile 20), lh 1.35 |
| Answer body | IBM Plex Sans 400, 16px, lh 1.7 |
| UI | IBM Plex Sans 400–600, 14–15px, lh 1.5 |
| Formula | Source Serif 4 italic 26px (plain-text formula: roman 18px); "where" symbols italic 18px `--accent`-light, meanings 14px |
| Small / disclaimer | IBM Plex Sans 12px, `--muted` |
| Citation / labels / eyebrows | IBM Plex Mono 400, 10.5px (labels 10.5–12px), UPPERCASE, ls 0.12em |

### Spacing (4px base)
4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 72, 96. Message gap 32; card padding 18–20 × 20; panel padding 20–24; landing sections 72–96.

### Radius / borders / shadows
Buttons & inputs 8px · cards, panels, bubbles, menus, alerts 12px · chips, avatars 999px · mobile sheets 12px on the open edge. 1px borders, **no shadows**. Focus: `outline: 2px solid var(--accent); outline-offset: 2px` (`:focus-visible`). Min touch target 44px (desktop icon buttons 36px, citation rows 34px; tablet/mobile all 44px).

### Breakpoints
Desktop ≥1100px · Tablet 700–1099px · Mobile <700px. Design widths 1440 / 768 / 390.

## Screens

### 1. Landing (`screen=landing`)
Max width 1200, side padding 32/24/16. Header 76px: Madar mark 28px + "Madar AI" (Plex Sans 600 17px `--heading`) at start; at end ghost "Sign in" button (44px, 1px `--border`, 8px radius, 15/500). Hero grid `1.4fr 1fr` (mobile 1 col, mark first), padding 72px 0 96px: eyebrow "IGCSE study assistant" (mono 12px `--cta`), h1 "Ask anything in your syllabus.", CTA **"Start asking"** (52px tall, 15×26 padding, `--cta` bg, white 16/600, hover brightness 1.1). End column: animated mark 260px (200 tablet, 120 mobile). Statements: 3-col grid gap 24, each with 1px top border, numeral "01–03" (mono 12px `--cta`) and statement: "Answers come only from the syllabus." / "Every answer shows its source." / "If it isn't in the syllabus, Madar AI says so." Subjects: label "SUBJECTS" (mono 12 `--muted`), wrapping pill buttons (44px, padding 0 18, `--card` bg, `--border`, hover `--raised` + `--border-strong`); clicking one starts sign-up then opens that subject's chat. Footer (top border, padding 28/32): "Not affiliated with any exam board." (13px `--muted`) at start; "A Madar product" + Madar logo lockup 20px tall at end.

### 2. Sign in / Sign up (`screen=auth`)
Header with mark + name (links to landing). Centered card max 400px, `--panel` bg, 1px border, 12px radius, padding 32 (mobile 24×20), gap 20. Title "Sign in" / "Create account". Sign-up only: "First name (optional)". Fields: Email, Password (sign-in shows "Forgot password?" link at end of label row). Inputs 48px, padding 0 14, `--page` bg, 1px `--border`, focus border `--accent`, 16px text. Submit full-width 48px `--action` / `--on-action` 15/600. Footer line: "New to Madar AI?" + "Create account" (or "Already have an account?" + "Sign in"), link-style `--accent`.
Validation on submit: email must match `\S+@\S+\.\S+` → "Enter a valid email address."; sign-in password empty → "Enter your password."; sign-up password < 8 → "Use at least 8 characters." Error: border `--warn-border`, message 13px `--warn-text` below field, `aria-invalid`.
Signed-out state: status box above fields, `--raised` bg, `--border-strong`, `--accent` text: "You've been signed out. Sign in to continue."
"Start asking" → sign-up; header "Sign in" → sign-in. Success → subject picker (or straight into the subject chosen on landing).

### 3. Subject picker (`screen=subjects`)
Header 64px with bottom border; mark + name; avatar button (34px circle, `--raised`, 1px `--border-strong`, initial in `--accent` 13/600) opens Settings. Content max 1080, padding 56 32 72 (mobile 28 16 48). H1 "Choose a subject". Grid `repeat(auto-fill, minmax(200px,1fr))` gap 16 (mobile 2 cols, gap 12). Card button: min-height 124 (mobile 100), padding 18×20, `--card`, 1px `--border`, radius 12, column space-between: mono index "01"–"10" (11px `--muted`) top, subject name (serif 20) bottom; hover `--raised` + `--border-strong`. Subjects: Mathematics, Physics, Chemistry, Biology, Economics, Business Studies, English, Computer Science, Geography, History. Click → new empty chat for that subject.

### 4. Chat (`screen=chat`) — main screen
**Desktop:** row = sidebar 280px | conversation (flex 1) | source panel 400px (on demand).
**Sidebar** (`--panel`, end border): top row 60px: mark 24 + "Madar AI" + collapse icon button (44). "New chat" ghost button (44px, plus icon). Label "SUBJECT" + switcher button (44px, `--card`, current subject + chevron) → opens subject menu. Conversation list (top border, scrolls): group labels "TODAY" / "EARLIER" (mono 10.5 `--muted`); items: full-width 44px+ buttons, padding 8×10, radius 8, title 14px one line ellipsis (`--body`; active `--heading` on `--raised`), subject below (mono 10px `--muted`). Account row at bottom (top border): 32px initial avatar + name 14/500 + email 12px muted → Settings. Collapsed state: 64px rail with mark, expand, new chat, avatar.
**Header** 60px (mobile 56), bottom border: subject chip (36px, padding 0 14, `--raised`, 1px `--border-strong`, `--accent` text 14/500, 7px `--cta` dot before the name, chevron after) → subject menu. Tablet: menu button at start opens sidebar as drawer. Mobile: menu | centred chip | new-chat icon.
**Conversation column** max 760, padding 40 24 32 (mobile 20 16 24), message gap 32, auto-scroll to bottom on new content.
- Student message: aligned to reading start, max 80% (mobile 88%), padding 12×16, `--raised` bg, 1px `--border`, radius 12, `--heading` 16/1.6, pre-wrap.
- Madar AI answer: no bubble. Row: 24px mark (static when done, animated while thinking/streaming) + content column gap 14. Blocks: paragraph (16/1.7 `--body`); bullet list (5px `--accent` dot, gap 12); numbered list (mono 13px `--accent` "1."); table (wrapper 1px border radius 12, header cells mono 10.5 uppercase `--muted` on `--card`, cells 14/1.5 padding 10×14, 1px row rules); formula block (`--card`, 1px border, radius 12, padding 16×20, formula serif italic 26, optional "where" definition grid separated by 1px rule).
- Citation line(s): after the answer, 1px `--border` rule then one button per passage stacked, mono 10.5 uppercase ls 0.12em `--accent`, e.g. `ECONOMICS SYLLABUS · TOPIC 2.3 · P.12`, small chevron after; hover/active bg `--raised`. Click toggles that source in the panel.
- Feedback: thumbs up / thumbs down icon buttons (36px; 44 touch), `--muted`, selected = `--accent` with filled icon, toggleable. Nothing else under answers.
- Thinking: answer row with animated mark + "Checking the {Subject} syllabus" (15px `--muted`, role=status); then blocks stream in one by one; citations and feedback appear only when complete.
- Out of syllabus: "That isn't covered in the {Subject} syllabus I have." / "Try a question about a topic in the syllabus." then 1px rule + mono muted "NOT IN THE SYLLABUS" (no citation).
- Error: alert (role=alert) `--warn-bg`, 1px `--warn-border`, radius 12, padding 12×16: "The answer didn't load." + "Retry" button (outline `--warn-border`, `--warn-text`, retry icon). Retry re-runs the answer.
**Empty state:** column centred: mark 44 + subject name (serif 40) above the composer; below the composer three example question chips (pill, 44px, `--card`, 1px border, 14px) — click sends that question.
**Composer** (pinned bottom, max 760, padding 0 24 16; mobile 0 12 10): container `--card`, 1px `--border` (focused `--accent`), radius 12, padding 8 / start 16; auto-growing textarea 16/1.5 up to 168px, placeholder "Ask about {Subject}"; send button 40px (44 touch) radius 8, arrow-up icon, enabled `--action`/`--on-action`, disabled `--raised`/`--muted`. Enter sends, Shift+Enter newline, disabled while an answer is in progress. Under it: "Madar AI can make mistakes. Check the source." (12px muted, centred).
**Subject menu:** desktop/tablet popover (300px, `--card`, 1px border, radius 12, padding 8) below header; mobile = top sheet full width with scrim and close button. Label "SUBJECT", 10 rows (44px; current row `--raised` + `--accent` text + check icon), footnote "Switching subject starts a new chat." Choosing a subject always starts a new chat.

### 5. Source panel
Desktop: docked right, 400px, `--panel`, start border. Tablet: overlay at end edge with scrim. Mobile: bottom sheet (max-height 82%, radius 12 12 0 0, grabber 40×4 `--border-strong`, scrim). Header 56px: "SOURCE" (mono 11 `--accent`) + close (44). Body padding 22 20 32, gap 20: document name "{Subject} syllabus" (serif 24); definition list TOPIC → "2.3  Inflation and deflation", PAGE → "12" (labels mono 10.5 muted, values 15px `--heading`); "EXCERPT" label; excerpt card (`--card`, 1px border, radius 12, padding 18×20): topic heading 14/600, then syllabus lines 15/1.75 — non-cited lines `--muted`, cited lines wrapped in `<mark>` with `--hl` background, `--heading` text, 2px inset bottom underline in `--cta`. Show only the excerpt, never the whole document. Escape or scrim closes.

### 6. Settings (modal)
Scrim + dialog max 440px (`--panel`, 1px border, radius 12; mobile anchored bottom). Header "Settings" (serif 24) + close. Sections separated by 1px rules: "APPEARANCE" (Dark / Light pills), "LANGUAGE" (English / العربية — parked), "ACCOUNT" (40px initial avatar, name, email, ghost "Sign out"). Sign out → sign-in screen with signed-out notice.

### Mobile specifics
Chat is full screen; sidebar becomes a drawer from the start edge (300px, max 86%, scrim); subject switcher is a top sheet; source is a bottom sheet; settings modal anchored to bottom.

## Interactions & behaviour
- Madar mark motion (thinking/streaming + landing hero): outer ring rotates 360° in 6s linear infinite; inner ring + satellite counter-rotates 9s; core pulses scale 1→0.78→1, opacity 1→0.72, 2.6s ease-in-out. Built from `assets/madar-ai-mark.svg` geometry recoloured with `--accent` / `--mark-*` / `--cta` core (see `aiMark()` in the prototype). `prefers-reduced-motion: reduce` → no animation anywhere.
- Prototype timing (simulated): thinking 1.2s, then one block every 0.5s. Real build: stream tokens from the API; show citations when the response completes.
- A new chat appears in history only after its first question; title = first question. Opening a history item loads it; switching subject or "New chat" creates a fresh empty chat.
- Only one source open at a time; clicking the open citation closes it.
- Escape closes menus, drawer, modal and source panel.

## State (suggested)
`theme ('dark'|'light', persisted; default dark)`, `user {firstName?, email}`, `conversations[{id, subjectId, group/date, messages[]}]`, `activeConversationId`, `message {id, role:'user'|'assistant', text | blocks[], citations[{subjectId, topic, title, page, excerptLines[{text, cited:boolean}]}], status:'thinking'|'streaming'|'done'|'error', outOfSyllabus:boolean, feedback:-1|0|1}`, `openSource {messageId, citationIndex} | null`, UI flags (sidebarCollapsed, drawerOpen, subjectMenuOpen, settingsOpen), composer draft.
API needs: auth (email + password, optional first name), list/create conversations, send question for a subject → streamed answer + citations or out-of-syllabus flag, feedback endpoint. Answers must come only from the uploaded syllabus for that subject (retrieval over syllabus documents), returning topic, page and exact excerpt lines with the cited sentences flagged.

## Voice & copy rules
Address the student as "you". Plain, short sentences. Use "From Topic 2.3", "That isn't in the syllabus". Say "answers come from the syllabus". Never "trained on", "guaranteed", never claim to always be correct, never present as a teacher or exam board. No emoji, no gamification, no exam-board logos, initials-only avatars (first initial; fallback first letter of email). All exact UI strings are in the `T.en` object in the prototype script; sample Q&A, citations and excerpts are in `C`, `ANS`, `QUICK` (fictional placeholders).

## Accessibility
WCAG AA text contrast (note: white on terracotta CTA ≈3.2:1 — brand-mandated; keep 16px semibold or review). Visible `:focus-visible` ring. 44px touch targets on touch layouts. `aria-pressed` on citation and feedback buttons, `role=status` for thinking, `role=alert` for errors, dialogs labelled, `aria-current` on active conversation/subject.

## Assets (`design/assets/`, from the Madar brand kit — do not redraw)
- `madar-mark-dark-bg.svg`, `madar-mark-light-bg.svg` — product mark (dark / light theme)
- `madar-logo-dark-bg.svg`, `madar-logo-light-bg.svg` — "Madar" lockup for the footer ("A Madar product")
- `madar-ai-mark.svg` — geometry source for the animated thinking mark
Icons are simple 24px stroke icons (1.75–2px, round caps): plus, chevron, menu, close, arrow-up (send), thumbs up/down, retry, sidebar panel, check — use Lucide equivalents.

## Files
- `design/Madar Logo and Palettes.dc.html` — logo colours and the final 1c palette (dark + light) with sample screens.
- `design/Madar AI Prototype.dc.html` — clickable prototype, all screens and states, dark/light (Settings → Appearance). Tweak props: `theme`, `screen`, `preset` (empty, thinking, one, two, formula, table, outside, error, long, signedout), `subject`, `sourceOpen`, `collapsed`.
- `design/Madar AI Screens.dc.html` — every screen/state at 1440, 768, 390, plus light mode and the assumptions list (renders the prototype in fixed frames).
- `design/Madar AI Foundations.dc.html` — colour, type, spacing, radius and component sheet (1c dark reference; tokens table above is authoritative).
- `brand/MADAR-BRAND.md` — original brand kit. Marketplace content in it is out of scope.
