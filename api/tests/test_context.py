from api.retrieval.context import build_context


def chunk(lines, overlap=0, pages=(1, 1)):
    return {"lines": lines, "overlap": overlap, "page_start": pages[0], "page_end": pages[1]}


PREV = chunk(["p1", "p2"], pages=(10, 10))
MATCH = chunk(["p2", "p3", "p4"], overlap=1, pages=(10, 11))  # repeats p2 from PREV
NEXT = chunk(["p4", "p5"], overlap=1, pages=(11, 12))  # repeats p4 from MATCH


def test_duplicates_from_overlap_are_sent_once():
    ctx = build_context(MATCH, PREV, NEXT)
    assert ctx["paragraphs"] == ["p1", "p2", "p3", "p4", "p5"]


def test_without_neighbours_the_chunk_is_returned_as_is():
    assert build_context(MATCH)["paragraphs"] == ["p2", "p3", "p4"]


def test_only_next_neighbour():
    assert build_context(MATCH, None, NEXT)["paragraphs"] == ["p2", "p3", "p4", "p5"]


def test_highlight_and_citation_use_only_the_matched_chunk():
    ctx = build_context(MATCH, PREV, NEXT)
    assert ctx["matched_paragraphs"] == ["p3", "p4"]
    assert ctx["cite"] == (10, 11)
    assert (ctx["page_start"], ctx["page_end"]) == (10, 12)
