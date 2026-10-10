# Madar — Brand Kit

Give this file (and the `logo/` folder) to Claude Design. It is the source of truth for the Madar brand and its sub-product, Madar AI.

## 1. Brand
- **Name:** Madar — مدار (Arabic: "orbit"; also reads as "course"). Same name in English and Arabic.
- **What it is:** an IGCSE course marketplace. Independent teachers publish courses; students and parents find, preview and pay for them.
- **Personality:** calm, trustworthy, academic, warm. Not playful or gamified. No emoji.
- **Tone of voice:** plain and specific. Short sentences. State facts ("Money is held until lesson one"), don't hype. Address parents and students directly.
- **Simplicity rule:** keep every flow and screen as simple as possible. Don't add descriptions, tips or helper text unless they're essential.

## 2. Logo — "Open Orbit"
An open half-orbit (arc) with one terracotta point travelling on it, i.e. the student on their course.
- Files: `madar-logo-dark-bg.svg`, `madar-logo-light-bg.svg`, `madar-mark-dark-bg.svg`, `madar-mark-light-bg.svg`.
- Construction: a circle stroke at ~11% of the mark's width, showing only the top-right half and rotated 35°. A solid dot (≈27% of the mark width) sits at 3 o'clock on the arc.
- Wordmark: "Madar" in Source Serif 4 SemiBold, letter-spacing +0.01em, set to the right of the mark with a gap of about 40% of the mark width.
- On dark backgrounds: arc #8FE0CF, dot #E27A4E, word #FFFFFF. On light backgrounds: arc #0F5C52, dot #D97048, word #221F1C.
- Don't: fill the circle, close the arc, change the dot colour, add gradients or shadows, or set the wordmark in another font.

## 3. Colour — dark mode (primary)
| Role | Hex |
|---|---|
| Canvas (page) | #041714 |
| Deep (insets, inputs) | #0B241F |
| Surface (cards) | #0F312C |
| Raised / hover | #17403A |
| Divider | #1E4A44 |
| Border | #245049 |
| Border strong | #327068 |
| **Primary action (teal)** | #34A38C · hover #3FBCA2 · text on it #04231E |
| Teal light (links, accents, logo arc) | #8FE0CF |
| **Warm accent (terracotta)** — main CTAs, key numbers, eyebrow labels | #E27A4E · hover #EE8B5F · text on it #FFFFFF |
| Heading text | #FFFFFF |
| Body text | #F3F9F7 / #C2D9D4 |
| Secondary text | #B7CFC9 |
| Muted text | #8FAAA4 |
| Success | text #93E0AC · bg #0F3322 · border #276B41 |
| Warning | text #E0AE55 · bg #33280F · border #6B5427 |

**Light mode (print, documents, light surfaces):** paper #FBF7F1 · ink #221F1C · muted #635C54 · line #E8E0D5 · deep teal #0F5C52 · teal #2E8B7A · terracotta #D97048 · peach #F3C4AE.

Use: teal = doing things (buttons, selected states, progress). Terracotta = the one thing to look at (primary CTA, headline stat, section eyebrow). Use it sparingly, about once per view.

## 4. Typography
- **Headings:** Source Serif 4, weight 600, letter-spacing −0.02em on large sizes. Display 48–64px, H1 36–42px, H2 26–30px, card title 18–22px.
- **UI & body:** IBM Plex Sans 400/500/600. Body 15–17px, line-height 1.65–1.75.
- **Arabic:** IBM Plex Sans Arabic (same weights). Full RTL mirroring.
- **Labels / eyebrows / data:** IBM Plex Mono, 10.5–12px, UPPERCASE, letter-spacing 0.1–0.14em.
- Google Fonts: Source Serif 4, IBM Plex Sans, IBM Plex Sans Arabic, IBM Plex Mono.

## 5. Shape & components
- Radius: buttons & inputs 8px · cards 12px · chips & pills 999px.
- Buttons: 15px/500 text, padding 14–15px × 18–26px. Primary = terracotta (#E27A4E) for the main CTA; teal (#34A38C) for secondary actions; ghost = transparent with a #245049 border.
- Inputs: bg #041714, border #245049, focus border #34A38C, text #F3F9F7.
- Cards: #0F312C with a 1px #245049 border. No heavy shadows. Separate sections with 1px #1E4A44 dividers.
- Chips (selectable): pill shape. Unselected = #0F312C bg / #245049 border / #F3F9F7 text. Selected = #1E4A44 bg / #34A38C border / #8FE0CF text.
- Layout: generous spacing (gaps of 20–28px), max content width 1080–1200px, flex/grid layouts that wrap.

## 6. Madar AI (sub-product)
Madar AI is a course companion built into each course. It answers only from the student's enrolled course materials, gives hints (not answers) on open assignments, and cites the lesson timestamp it used. **Indigo is reserved for Madar AI only.** Never use it anywhere else.
- Mark: `madar-ai-mark.svg`. It's a brighter relative of the Open Orbit: an outer ring with an indigo leading arc, a faint inner orbit with a small satellite, and a glowing core. In the product the outer ring spins slowly (6s), the inner ring counter-spins (9s) and the core pulses (2.6s). Turn all motion off when reduced-motion is on.
- Name: always "Madar AI" (in IBM Plex Sans 500/600 in the UI, or Source Serif 4 600 as a title). Launcher label: "Ask Madar AI".

| Role | Hex |
|---|---|
| AI page / chat bg | #0B1029 |
| AI panel | #0E1533 · card #111838 |
| AI chip / pill bg | #1A2350 |
| AI border | #2A3363 · strong #3A4586 |
| AI accent (ring, labels) | #8B97FF |
| AI core | #A8B2FF · light #C3CAFF |
| AI button | #5F6CF0 · text #FFFFFF |
| AI heading text | #EAF0FF |
| AI body text | #D5DAF7 |
| AI muted text | #9AA3D0 |

- Citations: IBM Plex Mono 10.5px uppercase in #8B97FF above a 1px #2A3363 divider, e.g. "UNIT 3 · LESSON 2 · 14:32".
- Voice: helpful tutor, not an oracle. It says "here's a hint" and "from Lesson 4" and never presents itself as the teacher.

## 7. Trust language (use consistently)
- "Free orientation session before the course starts" (live, recorded if missed).
- "Money held until 24 hours after lesson one."
- "Reviews only from students who finished the course."
- Card payment only.
