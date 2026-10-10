from api.ingest.textbook import body_paragraphs, clean_block, pack, printed_page, slice_section

HEADER_EVEN = (24.0, "10     1 • Welcome to Economics!\n")
HEADER_ODD = (24.0, "3.2 • Shifts in Demand and Supply     55\n")
FOOTER = (758.0, "Access for free at openstax.org\n")


def test_clean_block_joins_wrapped_lines():
    assert clean_block("Economics is the study of \nhow humans decide.\n") == "Economics is the study of how humans decide."
    assert clean_block("the long-\nrun effect") == "the long-run effect"


def test_printed_page_from_either_header_style():
    assert printed_page([HEADER_EVEN, (100.0, "text"), FOOTER]) == 10
    assert printed_page([HEADER_ODD, (100.0, "text"), FOOTER]) == 55
    assert printed_page([(100.0, "no header here")]) is None


def test_body_drops_header_and_footer():
    assert body_paragraphs([HEADER_EVEN, (100.0, "Body one."), (200.0, "Body two."), FOOTER]) == [
        "Body one.",
        "Body two.",
    ]


PAGES = {
    5: [(60.0, "tail of the previous section."), (100.0, "1.1 What Is Economics?\n"), (120.0, "First paragraph."), (140.0, "Second paragraph.")],
    6: [(60.0, "Third paragraph."), (100.0, "1.2 Microeconomics\n"), (120.0, "belongs to the next section.")],
}


def test_slice_section_cuts_at_both_headings():
    got = slice_section(PAGES, 5, 6, "1.1 What Is Economics?", "1.2 Microeconomics")
    assert got == [(5, "First paragraph."), (5, "Second paragraph."), (6, "Third paragraph.")]


def test_slice_section_next_heading_at_top_of_page_drops_that_page():
    pages = {1: [(100.0, "2.1 Title"), (120.0, "Body.")], 2: [(60.0, "2.2 Next"), (80.0, "Other.")]}
    assert slice_section(pages, 1, 2, "2.1 Title", "2.2 Next") == [(1, "Body.")]


def test_pack_groups_by_size_and_maps_printed_pages():
    paras = [(5, "a" * 600 + "."), (5, "b" * 600 + "."), (6, "c" * 600 + ".")]
    chunks = pack(paras, {5: 10, 6: 11}, max_chars=1300, overlap_chars=0)
    assert [(c["first"], c["last"], len(c["paragraphs"])) for c in chunks] == [(10, 10, 2), (11, 11, 1)]


def test_paragraph_ending_in_colon_stays_with_its_list():
    paras = [(5, "x" * 700 + "."), (5, "The categories are:"), (5, "• one • two • three")]
    chunks = pack(paras, {5: 1}, max_chars=900, overlap_chars=0)
    # the lead-in sentence and its list are never separated
    assert any(c["paragraphs"][-2:] == ["The categories are:", "• one • two • three"] for c in chunks)


def test_heading_stays_with_the_text_that_follows():
    paras = [(5, "a" * 800 + "."), (5, "LEARNING OBJECTIVES"), (5, "By the end you will know.")]
    chunks = pack(paras, {5: 1}, max_chars=900, overlap_chars=0)
    assert not any(c["paragraphs"][-1] == "LEARNING OBJECTIVES" for c in chunks)


def test_overlap_repeats_last_paragraph_in_next_chunk():
    paras = [(5, "a" * 600 + "."), (5, "b" * 600 + "."), (5, "c" * 600 + ".")]
    chunks = pack(paras, {5: 1}, max_chars=1300, overlap_chars=700)
    assert chunks[0]["paragraphs"][-1] == chunks[1]["paragraphs"][0]
    assert chunks[0]["overlap"] == 0 and chunks[1]["overlap"] == 1


def test_big_last_paragraph_is_not_repeated():
    paras = [(5, "a" * 600 + "."), (5, "b" * 900 + "."), (5, "c" * 600 + ".")]
    chunks = pack(paras, {5: 1}, max_chars=1000, overlap_chars=500)
    assert all(c["overlap"] == 0 for c in chunks)


def test_lead_in_is_glued_even_when_the_pair_exceeds_the_normal_limit():
    paras = [(5, "x" * 300 + "."), (5, "Here are the categories:"), (5, "• " + "y" * 800)]
    chunks = pack(paras, {5: 1}, max_chars=900, overlap_chars=0)
    last = chunks[-1]["paragraphs"]
    assert last[-2] == "Here are the categories:" and last[-1].startswith("• y")
