from api.ingest.syllabus import parse

# Synthetic page text that mimics the layout of a Cambridge syllabus page.
PAGE_A = (
    "Cambridge IGCSE Economics 0455 syllabus for 2027, 2028 and 2029.  Subject content \n"
    "11\n"
    "www.cambridgeinternational.org/igcse\n"
    "Back to contents page\n"
    "1\t\nThe example topic\n"
    "This topic introduces some ideas.\n"
    "1.1\t\nThe first subtopic\n"
    "1.1.1\t First item\n"
    "•\t\nfirst bullet that wraps onto\n"
    "a second line\n"
    "•\t\nexamples in the context of:\n"
    "–\t\nconsumers\n"
    "1.1.2\t Second item\n"
    "\t\nA plain sentence about the item:\n"
    "•\t\nonly bullet\n"
)
PAGE_B = (
    "Cambridge IGCSE Economics 0455 syllabus for 2027, 2028 and 2029.  Subject content \n"
    "12\n"
    "1.2\t\nThe second subtopic\n"
    "1.2.1\t Third item\n"
    "•\t\nbullet on the next page\n"
)


def test_one_chunk_per_numbered_item():
    chunks = parse([(11, PAGE_A), (12, PAGE_B)])
    assert [c.item for c in chunks] == ["1.1.1", "1.1.2", "1.2.1"]


def test_headings_and_pages():
    first, _, third = parse([(11, PAGE_A), (12, PAGE_B)])
    assert (first.topic, first.topic_title) == ("1", "The example topic")
    assert (first.subtopic, first.subtopic_title) == ("1.1", "The first subtopic")
    assert first.page_start == 11
    assert (third.subtopic, third.page_start) == ("1.2", 12)


def test_lines_bullets_and_wrapping():
    first, second, _ = parse([(11, PAGE_A), (12, PAGE_B)])
    assert [ln.render() for ln in first.lines] == [
        "• first bullet that wraps onto a second line",
        "• examples in the context of:",
        "– consumers",
    ]
    assert [ln.render() for ln in second.lines] == [
        "A plain sentence about the item:",
        "• only bullet",
    ]


def test_header_footer_and_topic_intro_are_dropped():
    text = " ".join(c.to_dict("d", "c")["text"] for c in parse([(11, PAGE_A)]))
    assert "www.cambridgeinternational" not in text
    assert "Back to contents" not in text
    assert "introduces some ideas" not in text


def test_text_carries_topic_path_for_retrieval():
    chunk = parse([(11, PAGE_A)])[0].to_dict("Example syllabus", "course-x")
    assert chunk["text"].startswith("The example topic > The first subtopic\n1.1.1 First item")
    assert chunk["id"] == "course-x:1.1.1"
