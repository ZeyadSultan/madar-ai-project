"""Usage:
  uv run python -m api.ingest <pdf> --kind syllabus --course-id cambridge-igcse-econ --doc "Economics syllabus"
  uv run python -m api.ingest <pdf> --kind textbook --course-id cambridge-igcse-econ --doc "Principles of Economics 3e"
"""

import argparse
import json
from pathlib import Path

from .syllabus import parse, section_pages
from .textbook import parse_book


def main() -> None:
    ap = argparse.ArgumentParser(description="Parse a course PDF into JSONL chunks.")
    ap.add_argument("pdf")
    ap.add_argument("--kind", choices=["syllabus", "textbook"], default="syllabus")
    ap.add_argument("--course-id", required=True)
    ap.add_argument("--doc", required=True, help='Shown in citations, e.g. "Economics syllabus"')
    ap.add_argument("--out", default=None, help="default: data/<kind>-chunks.jsonl")
    args = ap.parse_args()

    if args.kind == "syllabus":
        pages = section_pages(args.pdf)
        chunks = parse(pages)
        note = f"from pages {pages[0][0]}-{pages[-1][0]}"
    else:
        chunks, stats = parse_book(args.pdf)
        note = f"from {stats['sections']} sections ({stats['empty_sections']} empty)"

    out = Path(args.out or f"data/{args.kind}-chunks.jsonl")
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c.to_dict(args.doc, args.course_id), ensure_ascii=False) + "\n")
    print(f"{len(chunks)} chunks {note} -> {out}")


if __name__ == "__main__":
    main()
