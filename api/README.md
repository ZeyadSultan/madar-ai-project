# Madar AI: api

Python backend. For now it contains the **ingestion** step: turning course PDFs (a syllabus and a
textbook) into small, labelled, citable **chunks**. Search, embeddings and the answer API come next.

## Setup and commands

Python 3.12 and dependencies are managed with [uv](https://docs.astral.sh/uv/).

```bash
cd api
uv run pytest                     # run the tests

# syllabus -> data/syllabus-chunks.jsonl
uv run python -m api.ingest ../syllabus/<syllabus>.pdf --kind syllabus \
  --course-id cambridge-igcse-econ --doc "Economics syllabus"

# textbook -> data/textbook-chunks.jsonl
uv run python -m api.ingest ../content/openstax/principles-of-economics-3e.pdf --kind textbook \
  --course-id cambridge-igcse-econ --doc "Principles of Economics 3e"
```

The source PDFs (`syllabus/`, `content/`) and the generated chunks (`api/data/`) are copyrighted or
derived from copyrighted material, so they are git-ignored. Never commit them.

## Why chunks

The app must answer only from the course material and cite the page. The book is far too large to
send to an LLM on every question, so we cut it into chunks, find the few that match a question,
and give only those to the LLM. An embedding model and the LLM only ever see chunks, so what is
inside a chunk decides how good the answers are. A search compares the question with each chunk
**separately**, so a chunk must make sense on its own.

## Textbook chunking rules

Code: `src/api/ingest/textbook.py` (`to_units`, `pack`, `parse_book`).

### Cleaning (per section)

1. Use only the section's own text: cut at its heading and at the next section's heading
   (the sections come from the PDF outline).
2. Remove the running page header and footer (top and bottom strip of the page).
3. Join the wrapped lines of each text block into one paragraph.

### Phase 1: glue paragraphs into units (`to_units`)

A paragraph is **unfinished** if it does not end with `. ! ? " ) ] …`

4. An unfinished paragraph is glued to the next paragraph, repeatedly, until a finished paragraph
   closes the unit.
5. A **lead-in** (ends with `:`) or a **short heading** (unfinished and 80 characters or fewer) is
   always glued, even if the unit goes over 1,000 characters (up to 2,000).
6. Any other unfinished paragraph (a split sentence or caption) is glued only if the unit stays
   within 1,000 characters.
7. A unit is never split again.

### Phase 2: fill chunks (`pack`)

8. Take the units in order and add them to the current chunk.
9. Before adding a unit: if `current size + unit size > 1,000`, close the current chunk and start
   a new one. Otherwise add it.
10. A chunk always gets at least one new unit, so a single unit larger than 1,000 becomes a chunk
    on its own and is never split.

### Phase 3: overlap (when a chunk closes)

11. Look at the **last unit** of the chunk that just closed.
12. If it is **300 characters or fewer**, copy it to the start of the next chunk.
13. If it is more than 300, copy nothing.
14. The number of leading copied paragraphs is stored as `overlap`, so they can be skipped later.

### Boundaries and labels

15. Chunks never cross a section: each section is chunked separately.
16. Each chunk gets: chapter, section, printed page range, order number, and `prev_id` / `next_id`.
17. The text to search is the chapter and section name on the first line, then the paragraphs.

### The numbers that control everything

| Setting | Value | Rule |
|---|---|---|
| Target chunk size | 1,000 characters | 6, 9 |
| Maximum for lead-ins and headings | 2,000 characters | 5 |
| "Short heading" length | 80 characters | 5 |
| Copy the last unit only if it is | 300 characters or fewer | 12 |

One sentence: *glue unfinished paragraphs to what follows, fill chunks with those groups until the
next one would pass 1,000 characters, and when a chunk closes, copy its last group to the next
chunk if that group is 300 characters or fewer.*

## Examples

### The start of section 1.1: 12 paragraphs become 5 units, then chunks

Sizes are in characters.

```
P1  19  LEARNING OBJECTIVES                                   (heading: unfinished)
P2  48  By the end of this section, you will be able to:      (lead-in: unfinished)
P3 154  • Discuss the importance of studying economics …      (unfinished)
P4 753  Economics is the study of how humans make decisions…  (finished)
P5 485  Think about it this way: In 2015 …                    (finished)
P6  20  Introduction to FRED                                  (heading: unfinished)
P7 639  Data is very important … in the following categories: (lead-in: unfinished)
P8 517  • Money, Banking & Finance • Population, …             (finished)
P9 108  For more information … videos on                      (split sentence)
P10 40  YouTube starting with this introduction.              (finished)
P11 103 FIGURE 1.2 Scarcity of Resources … scarcity of        (split caption)
P12 99  resources is real. (Credit: …)                        (finished)
```

Phase 1 (gluing):

```
U1 = P1+P2+P3+P4     974
U2 = P5              485
U3 = P6+P7+P8       1176   (over 1,000 on purpose: a lead-in stays with its list)
U4 = P9+P10          148
U5 = P11+P12         202
```

Phase 2 (packing, limit 1,000):

```
chunk 0 = U1            974   adding U2: 974 + 485 = 1459 > 1000, close
chunk 1 = U2            485   adding U3: 485 + 1176 = 1661 > 1000, close
chunk 2 = U3           1176   adding U4: 1176 + 148 = 1324 > 1000, close
chunk 3 = U4 + U5 …     350   still filling
```

None of these closes copied anything, because each last unit was larger than 300.

### When the overlap applies: chunks 3.1:016 and 3.1:017

```
chunk 3.1:016   unit 330 "In Figure 3.4, the equilibrium price is $1.40…"
                unit 297 "The word “equilibrium” means “balance.” …"        total 627
                next unit is 445: 627 + 445 = 1072 > 1000   -> close
                last unit is 297 <= 300                      -> COPY it

chunk 3.1:017   unit 297 "The word “equilibrium” means “balance.” …"   (repeated)
                unit 445 "Imagine, for example, that the price … above the equilibrium price …"   total 742
                next unit is 524: 742 + 524 = 1266 > 1000   -> close
                last unit is 445 > 300                       -> no copy
```

Why the copy helps: a student asks "What happens if the price is above equilibrium?". The answer
is in chunk 017, which uses the word "equilibrium". Without the copy, chunk 017 never says what it
means (the definition is in chunk 016). With the copy it is complete on its own.

The code does not know the copied paragraph "completes" the next one. It is a cheap bet that the
last small paragraph before a border is related to what follows. Whether the copies improve search
results will be measured later; if they do not, they will be removed.

### Small decision table

| Current chunk | Next unit | Sum | Decision |
|---|---|---|---|
| 500 | 600 | 1,100 | Close. 500 > 300, so no copy. Next chunk = [600]. |
| 500 | 500 | 1,000 | Fits (the check is "more than 1,000"). Chunk becomes 1,000. |
| 500 | 400 | 900 | Fits. Chunk becomes 900. |
| 280 | 800 | 1,080 | Close. 280 ≤ 300, so it is copied. Next chunk = [280 copy, 800] = 1,080. |
| 250 | 900 | 1,150 | Close. 250 ≤ 300, so it is copied. Next chunk = [250 copy, 900] = 1,150. |

A chunk that starts with a copy can therefore already be near or over 1,000. That is allowed: the
size check only runs once a chunk holds at least one new unit.

## Known limits

- A chunk can still end with a lead-in whose list is in the next chunk (1 in 2,473 today).
- Tables and figure captions are plain text inside paragraphs.
- The chapter introduction text before section 1 is skipped.
- The sizes (1,000 / 300 / 80) are reasoned starting values, to be tuned with an evaluation set.

## Output format (`data/textbook-chunks.jsonl`)

One JSON object per line:

| Field | Meaning |
|---|---|
| `id` | `<course_id>:<section>:<order>`, for example `cambridge-igcse-econ:3.1:017` |
| `prev_id`, `next_id` | Neighbouring chunks in the same section (or `null`) |
| `chapter`, `chapter_title`, `section`, `section_title` | Where the chunk sits in the book |
| `page_start`, `page_end` | **Printed** page numbers (what a student sees), not PDF page numbers |
| `lines` | The paragraphs, shown in the source panel |
| `overlap` | How many of the first `lines` are copies from the previous chunk |
| `text` | Section path + paragraphs: this is what gets embedded and searched |

At answer time `src/api/retrieval/context.py` merges a matched chunk with its neighbours and drops
the duplicated overlap paragraphs before the text is sent to the LLM.
