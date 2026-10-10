"""Turn a Cambridge syllabus PDF into citable chunks.

One chunk = one numbered syllabus item (e.g. "1.1.2 Resource allocation decisions") with its
topic, page and exact lines. The lines are what the source panel shows, and the cited
sentences are flagged later at answer time.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field

import pymupdf

# "1.1.2<tab> Title"  or  "1.1<tab>" (title on the next line)
HEADING_RE = re.compile(r"^(?P<num>\d+(?:\.\d+){0,2})\t\s*(?P<title>.*)$")
MARKER_RE = re.compile(r"^(?P<marker>[•–]?)\t$")
NOISE_RES = [
    re.compile(r"^Cambridge IGCSE .*syllabus for"),
    re.compile(r"^www\.cambridgeinternational\.org"),
    re.compile(r"^Back to contents page"),
    re.compile(r"^\d+$"),  # printed page number
]


@dataclass
class Line:
    marker: str  # "•", "–" or "" for a plain line
    text: str

    def render(self) -> str:
        return f"{self.marker} {self.text}" if self.marker else self.text


@dataclass
class Chunk:
    item: str  # "1.1.2"
    title: str
    topic: str  # "1"
    topic_title: str
    subtopic: str  # "1.1"
    subtopic_title: str
    page_start: int
    page_end: int
    lines: list[Line] = field(default_factory=list)

    def to_dict(self, doc: str, course_id: str) -> dict:
        d = asdict(self)
        d["lines"] = [ln.render() for ln in self.lines]
        path = " > ".join(x for x in (self.topic_title, self.subtopic_title) if x)
        d["text"] = "\n".join([path, f"{self.item} {self.title}", *d["lines"]])
        d["doc"] = doc
        d["course_id"] = course_id
        d["id"] = f"{course_id}:{self.item}"
        return d


def section_pages(pdf_path: str, section: str = "Subject content") -> list[tuple[int, str]]:
    """Pages (1-based number, text) of one syllabus section.

    Most pages name the section in their running header. The first page of a section
    carries a "3  Subject content" heading instead, so the page before the first header
    match is included when it has that heading.
    """
    heading = re.compile(rf"^\d+\s+{re.escape(section)}\s*$", re.IGNORECASE)
    pages: list[tuple[int, str]] = []
    with pymupdf.open(pdf_path) as doc:
        texts = [p.get_text() for p in doc]
    for i, text in enumerate(texts, start=1):
        header = text.splitlines()[0] if text.strip() else ""
        if section.lower() in header.lower():
            if not pages and i > 1 and any(heading.match(ln.strip()) for ln in texts[i - 2].splitlines()):
                pages.append((i - 1, texts[i - 2]))
            pages.append((i, text))
    return pages


def parse(pages: list[tuple[int, str]]) -> list[Chunk]:
    chunks: list[Chunk] = []
    titles: dict[str, str] = {}  # "1" / "1.1" -> title
    topic = subtopic = ""
    current: Chunk | None = None
    pending_heading: str | None = None
    pending_marker: str | None = None

    for page, text in pages:
        for raw in text.splitlines():
            line = raw.rstrip(" \r\n")  # keep tabs: they mark headings and bullets
            if not line.strip() or any(r.match(line) for r in NOISE_RES):
                continue

            m = MARKER_RE.match(line)
            if m:
                pending_marker = m.group("marker")
                continue

            if pending_heading:
                num, title = pending_heading, line.strip()
                pending_heading = None
            else:
                h = HEADING_RE.match(line)
                if h:
                    num, title = h.group("num"), h.group("title").strip()
                    if not title:
                        pending_heading = num
                        continue
                else:
                    num = title = ""

            if num:
                depth = num.count(".") + 1
                titles[num] = title
                if depth == 1:
                    topic, subtopic, current = num, "", None
                elif depth == 2:
                    subtopic, current = num, None
                else:
                    current = Chunk(
                        item=num,
                        title=title,
                        topic=topic,
                        topic_title=titles.get(topic, ""),
                        subtopic=subtopic,
                        subtopic_title=titles.get(subtopic, ""),
                        page_start=page,
                        page_end=page,
                    )
                    chunks.append(current)
                pending_marker = None
                continue

            # Body text: belongs to the current item, otherwise it is topic intro and is skipped.
            if current is None:
                pending_marker = None
                continue
            body = line.strip()
            if pending_marker is not None:
                current.lines.append(Line(pending_marker, body))
            elif current.lines and current.lines[-1].marker:
                current.lines[-1].text += " " + body  # wrapped bullet continues
            else:
                current.lines.append(Line("", body))
            pending_marker = None
            current.page_end = page

    return chunks
