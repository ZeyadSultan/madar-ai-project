"""Find the chunks closest to a question (in memory; the database version comes later)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from .embedding import DEFAULT_MODEL, embed_query


def top_k(query: np.ndarray, matrix: np.ndarray, k: int = 5) -> list[tuple[int, float]]:
    """Indexes and cosine scores of the k best rows. Both sides must already be normalised."""
    scores = matrix @ query
    k = min(k, len(scores))
    best = np.argpartition(-scores, k - 1)[:k]
    best = best[np.argsort(-scores[best])]
    return [(int(i), float(scores[i])) for i in best]


def load_index(chunks_path: str, vectors_path: str) -> tuple[list[dict], np.ndarray]:
    chunks = [json.loads(line) for line in Path(chunks_path).read_text(encoding="utf-8").splitlines()]
    vectors = np.load(vectors_path)
    if len(chunks) != len(vectors):
        raise ValueError(f"{len(chunks)} chunks but {len(vectors)} vectors: re-run the embedding step")
    return chunks, vectors


def search(question: str, chunks: list[dict], vectors: np.ndarray, k: int = 5, model: str = DEFAULT_MODEL):
    return [(chunks[i], score) for i, score in top_k(embed_query(question, model), vectors, k)]
