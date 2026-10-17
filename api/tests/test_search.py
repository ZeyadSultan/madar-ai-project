import numpy as np

from api.retrieval.embedding import normalise
from api.retrieval.search import top_k


def test_normalise_gives_unit_length_rows():
    v = normalise(np.array([[3.0, 4.0], [0.0, 0.0]], dtype=np.float32))
    assert np.allclose(np.linalg.norm(v[0]), 1.0)
    assert np.allclose(v[1], 0.0)  # a zero vector stays zero instead of dividing by zero


def test_top_k_orders_by_cosine_score():
    matrix = normalise(np.array([[1, 0], [0, 1], [1, 1]], dtype=np.float32))
    query = normalise(np.array([[1, 0.1]], dtype=np.float32))[0]
    assert [i for i, _ in top_k(query, matrix, k=3)] == [0, 2, 1]


def test_top_k_never_asks_for_more_than_exist():
    matrix = normalise(np.array([[1, 0], [0, 1]], dtype=np.float32))
    assert len(top_k(np.array([1.0, 0.0], dtype=np.float32), matrix, k=10)) == 2
