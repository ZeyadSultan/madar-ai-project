"""Usage:
  uv run python -m api.ingest <pdf> --course-id cambridge-igcse-econ --doc "Principles of Economics 3e"
"""

import argparse
import json
from pathlib import Path

from .textbook import parse_book


def main() -> None:
    ap = argparse.ArgumentParser(description="Parse a textbook PDF into JSONL chunks.")
    ap.add_argument("pdf")
    ap.add_argument("--course-id", required=True)
    ap.add_argument("--doc", required=True, help='Shown in citations, e.g. "Principles of Economics 3e"')
    ap.add_argument("--out", default="data/textbook-chunks.jsonl")
    args = ap.parse_args()

    chunks, stats = parse_book(args.pdf)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c.to_dict(args.doc, args.course_id), ensure_ascii=False) + "\n")
    print(f"{len(chunks)} chunks from {stats['sections']} sections ({stats['empty_sections']} empty) -> {out}")


if __name__ == "__main__":
    main()
