"""Build the text that is sent to the LLM for one matched chunk.

Search finds a small chunk. The answer step also fetches the chunk before and after it
(prev_id / next_id), so a thought that was cut at a chunk boundary is complete, and drops
the paragraphs that chunk overlap would otherwise send twice.
"""

from __future__ import annotations


def build_context(matched: dict, prev: dict | None = None, next_: dict | None = None) -> dict:
    """Merge prev + matched + next into one passage.

    Returns:
      paragraphs: the passage, without duplicated overlap paragraphs
      matched_paragraphs: the matched chunk's own paragraphs (what the source panel highlights)
      page_start / page_end: printed pages covered by the passage
      cite: printed pages of the matched chunk only (what the citation shows)
    """
    paragraphs: list[str] = []
    if prev:
        paragraphs += prev["lines"]
    # the matched chunk repeats the previous chunk's last paragraph(s): skip them when prev is here
    own = matched["lines"][matched["overlap"] :] if prev else matched["lines"]
    paragraphs += own
    if next_:
        paragraphs += next_["lines"][next_["overlap"] :]  # always repeats the matched chunk's tail

    chunks = [c for c in (prev, matched, next_) if c]
    return {
        "paragraphs": paragraphs,
        "matched_paragraphs": matched["lines"][matched["overlap"] :],
        "page_start": min(c["page_start"] for c in chunks),
        "page_end": max(c["page_end"] for c in chunks),
        "cite": (matched["page_start"], matched["page_end"]),
    }
