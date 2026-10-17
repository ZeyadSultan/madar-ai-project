"""Usage:
  uv run python -m api.retrieval embed [--chunks data/textbook-chunks.jsonl] [--model BAAI/bge-small-en-v1.5]
  uv run python -m api.retrieval ask "What happens if the price is above equilibrium?" [-k 5]
"""

import argparse
import json
import time
from pathlib import Path

import numpy as np

from .context import build_context
from .embedding import DEFAULT_MODEL, embed_passages
from .search import load_index, search


def vectors_path(chunks_path: str, model: str) -> str:
    return str(Path(chunks_path).with_suffix("")) + "." + model.split("/")[-1] + ".npy"


def cmd_embed(args) -> None:
    chunks = [json.loads(line) for line in Path(args.chunks).read_text(encoding="utf-8").splitlines()]
    start = time.time()
    vectors = embed_passages([c["text"] for c in chunks], args.model)
    out = vectors_path(args.chunks, args.model)
    np.save(out, vectors)
    print(f"{len(chunks)} chunks -> {vectors.shape} vectors in {time.time() - start:.0f}s -> {out}")


def cmd_ask(args) -> None:
    chunks, vectors = load_index(args.chunks, vectors_path(args.chunks, args.model))
    by_id = {c["id"]: c for c in chunks}
    for rank, (c, score) in enumerate(search(args.question, chunks, vectors, args.k, args.model), 1):
        ctx = build_context(c, by_id.get(c["prev_id"]), by_id.get(c["next_id"]))
        first = c["lines"][c["overlap"]] if c["overlap"] < len(c["lines"]) else c["lines"][0]
        print(f"#{rank}  score {score:.3f}  {c['id'].split(':', 1)[1]}  {c['section_title']}  (printed p.{c['page_start']}-{c['page_end']})")
        print(f"     {first[:150]}…")
        print(f"     [with neighbours: {len(' '.join(ctx['paragraphs']))} chars]")


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("embed", "ask"):
        p = sub.add_parser(name)
        p.add_argument("--chunks", default="data/textbook-chunks.jsonl")
        p.add_argument("--model", default=DEFAULT_MODEL)
        if name == "ask":
            p.add_argument("question")
            p.add_argument("-k", type=int, default=5)
    args = ap.parse_args()
    {"embed": cmd_embed, "ask": cmd_ask}[args.cmd](args)


if __name__ == "__main__":
    main()
