"""Turn an OpenStax textbook PDF into citable chunks.

The PDF has an outline (chapters and sections with page numbers), and each text block on a
page is one paragraph. One chunk = a few consecutive paragraphs from one section, with the
chapter, section and PRINTED page numbers (what a student sees in their copy of the book).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

import pymupdf

Block = tuple[float, str]  # (y position of the block's top edge, raw text)

TOP_BAND = 40.0  # running header (carries the printed page number)
BOTTOM_BAND = 750.0  # "Access for free at openstax.org"
SECTION_RE = re.compile(r"^(\d+)\.(\d+)\s+(.+)$")
CHAPTER_RE = re.compile(r"^Chapter\s+(\d+)\s+(.+)$")
# Running headers look like "10     1 • Welcome to Economics!"  or  "3.2 • Shifts in Demand     55"
PAGE_LEFT_RE = re.compile(r"^(\d+)\s{2,}.+ • .+$")
PAGE_RIGHT_RE = re.compile(r"^.+ • .+\s{2,}(\d+)$")


@dataclass
class BookChunk:
    chapter: str  # "3"
    chapter_title: str
    section: str  # "3.2"
    section_title: str
    page_start: int  # printed page numbers
    page_end: int
    paragraphs: list[str] = field(default_factory=list)
    index: int = 0  # position within the section
    overlap: int = 0  # leading paragraphs repeated from the previous chunk
    section_count: int = 1  # how many chunks the whole section has

    def chunk_id(self, course_id: str, index: int) -> str:
        return f"{course_id}:{self.section}:{index:03d}"

    def to_dict(self, doc: str, course_id: str) -> dict:
        return {
            "id": self.chunk_id(course_id, self.index),
            "prev_id": self.chunk_id(course_id, self.index - 1) if self.index > 0 else None,
            "next_id": (
                self.chunk_id(course_id, self.index + 1) if self.index < self.section_count - 1 else None
            ),
            "course_id": course_id,
            "doc": doc,
            "chapter": self.chapter,
            "chapter_title": self.chapter_title,
            "section": self.section,
            "section_title": self.section_title,
            "page_start": self.page_start,
            "page_end": self.page_end,
            "lines": self.paragraphs,
            "overlap": self.overlap,
            "text": "\n".join(
                [f"{self.chapter_title} > {self.section} {self.section_title}", *self.paragraphs]
            ),
        }


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def clean_block(text: str) -> str:
    """Join the wrapped lines of one block into a single paragraph."""
    out = ""
    for line in (ln.strip() for ln in text.splitlines()):
        if not line:
            continue
        out += line if not out or out.endswith("-") else " " + line
    return out


def printed_page(blocks: list[Block]) -> int | None:
    """The printed page number, read from the running header or footer block."""
    for y, text in blocks:
        if y < TOP_BAND or y > BOTTOM_BAND:
            flat = text.strip().replace("\n", " ")
            for rx in (PAGE_LEFT_RE, PAGE_RIGHT_RE):
                m = rx.match(flat)
                if m:
                    return int(m.group(1))
    return None


def body_paragraphs(blocks: list[Block]) -> list[str]:
    """Paragraphs of a page without the running header and footer."""
    paras = (clean_block(t) for y, t in blocks if TOP_BAND <= y <= BOTTOM_BAND)
    return [p for p in paras if p]


def slice_section(
    pages: dict[int, list[Block]],
    start: int,
    end: int,
    heading: str,
    next_heading: str | None,
) -> list[tuple[int, str]]:
    """(pdf_page, paragraph) pairs of one section.

    A section can start and end in the middle of a page, so the first page is cut at this
    section's heading block and the last page at the next heading block.
    """
    out: list[tuple[int, str]] = []
    h, nh = norm(heading), norm(next_heading) if next_heading else None
    for p in range(start, end + 1):
        paras = body_paragraphs(pages.get(p, []))
        if p == start:
            idx = next((i for i, x in enumerate(paras) if norm(x).startswith(h)), None)
            if idx is not None:
                paras = paras[idx + 1 :]
        if p == end and nh:
            idx = next((i for i, x in enumerate(paras) if norm(x).startswith(nh)), None)
            if idx is not None:
                paras = paras[:idx]
            elif end > start:
                paras = []  # the next heading is at the very top of its page
        out += [(p, x) for x in paras]
    return out


# A paragraph that does not end like a finished sentence (a heading, "...:" before a list,
# a caption or sentence cut by a page break) belongs with the paragraph after it.
SENTENCE_END_RE = re.compile(r"[.!?\"”’')\]…]\s*$")


def is_open(paragraph: str) -> bool:
    return not SENTENCE_END_RE.search(paragraph)


def must_stay_with_next(paragraph: str) -> bool:
    """A lead-in ("...:") or a short heading is useless without what follows it."""
    return paragraph.rstrip().endswith(":") or (is_open(paragraph) and len(paragraph) <= 80)


def to_units(
    paras: list[tuple[int, str]], printed: dict[int, int], max_chars: int
) -> list[list[tuple[int, str]]]:
    """Glue unfinished paragraphs to the next one. A unit is a list of (printed_page, text).

    Lead-ins and headings are always glued (up to 2 x max_chars); other unfinished
    paragraphs, such as a split caption, are glued only while the unit stays within max_chars.
    """
    units: list[list[tuple[int, str]]] = []
    for pdf_page, text in paras:
        item = (printed.get(pdf_page, pdf_page), text)
        if units and is_open(units[-1][-1][1]):
            limit = 2 * max_chars if must_stay_with_next(units[-1][-1][1]) else max_chars
            if unit_size(units[-1]) + len(text) <= limit:
                units[-1].append(item)
                continue
        units.append([item])
    return units


def unit_size(unit: list[tuple[int, str]]) -> int:
    return sum(len(t) for _, t in unit)


def pack(
    paras: list[tuple[int, str]],
    printed: dict[int, int],
    max_chars: int = 1000,
    overlap_chars: int = 300,
) -> list[dict]:
    """Group paragraphs into chunks of about max_chars.

    Units (see to_units) are never split. Each chunk after the first starts with the last unit
    of the previous chunk (if it is small), so a thought cut at the boundary appears in both.
    Returns dicts with: first, last (printed pages), paragraphs, overlap (repeated paragraphs).
    """
    chunks: list[dict] = []
    cur: list[list[tuple[int, str]]] = []
    carried = 0  # units at the start of `cur` that are repeated from the previous chunk

    def finish() -> None:
        flat = [item for u in cur for item in u]
        repeated = sum(len(u) for u in cur[:carried])
        chunks.append(
            {
                "first": flat[0][0],
                "last": flat[-1][0],
                "paragraphs": [t for _, t in flat],
                "overlap": repeated,
            }
        )

    for unit in to_units(paras, printed, max_chars):
        size = sum(unit_size(u) for u in cur)
        if len(cur) > carried and size + unit_size(unit) > max_chars:
            finish()
            tail = cur[-1]
            cur = [tail] if unit_size(tail) <= overlap_chars else []
            carried = len(cur)
        cur.append(unit)
    if len(cur) > carried:
        finish()
    return chunks


def parse_book(pdf_path: str, max_chars: int = 1000) -> tuple[list[BookChunk], dict]:
    with pymupdf.open(pdf_path) as doc:
        toc = doc.get_toc()
        pages = {
            i: [(b[1], b[4]) for b in page.get_text("blocks") if b[6] == 0]
            for i, page in enumerate(doc, start=1)
        }
    last_page = max(pages)

    # printed page number per pdf page; fill gaps from the previous page
    printed: dict[int, int] = {}
    for p in range(1, last_page + 1):
        n = printed_page(pages[p])
        if n is None and p - 1 in printed:
            n = printed[p - 1] + 1
        if n is not None:
            printed[p] = n

    chunks: list[BookChunk] = []
    stats = {"sections": 0, "empty_sections": 0}
    chapter = chapter_title = ""
    top_level = [(i, lvl, title, pg) for i, (lvl, title, pg) in enumerate(toc) if lvl <= 2]
    for pos, (i, lvl, title, pg) in enumerate(top_level):
        m = CHAPTER_RE.match(title)
        if lvl == 1 and m:
            chapter, chapter_title = m.group(1), m.group(2)
            continue
        s = SECTION_RE.match(title)
        if lvl != 2 or not s or s.group(1) != chapter:
            continue
        nxt = top_level[pos + 1] if pos + 1 < len(top_level) else None
        end = nxt[3] if nxt else last_page
        paras = slice_section(pages, pg, end, title, nxt[2] if nxt else None)
        stats["sections"] += 1
        if not paras:
            stats["empty_sections"] += 1
        packed = pack(paras, printed, max_chars)
        for k, c in enumerate(packed):
            chunks.append(
                BookChunk(
                    chapter=chapter,
                    chapter_title=chapter_title,
                    section=f"{s.group(1)}.{s.group(2)}",
                    section_title=s.group(3),
                    page_start=c["first"],
                    page_end=c["last"],
                    paragraphs=c["paragraphs"],
                    index=k,
                    overlap=c["overlap"],
                    section_count=len(packed),
                )
            )
    return chunks, stats
