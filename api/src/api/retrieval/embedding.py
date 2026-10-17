"""Turn text into vectors with a local model (fastembed). No API key, nothing leaves the machine."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding

DEFAULT_MODEL = "BAAI/bge-small-en-v1.5"
# Keep the model inside the project (git-ignored): the default is a temp folder macOS may clean up.
MODEL_CACHE = Path(__file__).resolve().parents[3] / ".cache" / "fastembed"
# BGE models work better when a short search question is marked as one.
QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


@lru_cache(maxsize=2)
def get_model(name: str = DEFAULT_MODEL) -> TextEmbedding:
    return TextEmbedding(model_name=name, cache_dir=str(MODEL_CACHE))


def embed_passages(texts: list[str], model: str = DEFAULT_MODEL, batch_size: int = 32) -> np.ndarray:
    """One row per text, each row length-normalised so a dot product equals cosine similarity."""
    vectors = np.array(list(get_model(model).embed(texts, batch_size=batch_size)), dtype=np.float32)
    return normalise(vectors)


def embed_query(question: str, model: str = DEFAULT_MODEL) -> np.ndarray:
    vector = np.array(list(get_model(model).embed([QUERY_PREFIX + question])), dtype=np.float32)
    return normalise(vector)[0]


def normalise(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=-1, keepdims=True)
    return vectors / np.where(norms == 0, 1, norms)
