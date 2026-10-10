"""Usage: uv run python -m api.ingest <pdf> --course-id cambridge-igcse-econ --doc "Economics syllabus"."""

import argparse
import json
from pathlib import Path

from .syllabus import parse, section_pages


def main() -> None:
    ap = argparse.ArgumentParser(description="Parse a Cambridge syllabus PDF into JSONL chunks.")
    ap.add_argument("pdf")
    ap.add_argument("--course-id", required=True)
    ap.add_argument("--doc", required=True, help='Shown in citations, e.g. "Economics syllabus"')
    ap.add_argument("--out", default="data/chunks.jsonl")
    args = ap.parse_args()

    pages = section_pages(args.pdf)
    chunks = parse(pages)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c.to_dict(args.doc, args.course_id), ensure_ascii=False) + "\n")

    first, last = pages[0][0], pages[-1][0]
    print(f"{len(chunks)} chunks from pages {first}-{last} -> {out}")


if __name__ == "__main__":
    main()
