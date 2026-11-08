# Accessibility

> Governs what a person reads or perceives of the program and its repository, such as a document, a page, a screen or a program's output, wherever it is present, and the voice, case and punctuation of its copy; it leaves out what needs a control, a pointer or focus.

## Vocabulary

**Copy** is text the program's own code words for a person to read, on a screen, in a terminal, in an email or in a document.

## General

### link-names-its-destination · MUST

Every link's text says where the link leads. It says so read alone or with the sentence, item or cell that holds it, never as a bare word such as here or more. Exempt: a bare address where the address itself is what the reader needs.

| Why |
|---|
| readers scan links, and assistive technology lists them out of their sentence, where a bare word tells nothing — WCAG, Link Purpose (In Context). |

### headings-in-order · MUST

Every heading sits at most one level below the heading before it.

| Why |
|---|
| a reader who moves by headings, as assistive technology lets them, reads a skipped level as a missing section — the WHATWG Living Standard's rule on heading levels and the WAI's advice on headings. |

### document-has-one-title-heading · MUST

Every document or page a person reads has one top-level heading, its title. Exempt: a title its renderer takes from the document's metadata, and a file whose form a tool generates.

| Why |
|---|
| renderers, outlines and readers take the top-level heading as the document's name, and with none or two the document has no one name. |

### title-heading-comes-first · MUST

No heading of a document or page a person reads comes before its first top-level heading. Exempt: a file whose form a tool generates.

| Why |
|---|
| a heading above the title opens the outline and the table of contents with one part of the document, so a reader who lands on it takes that part for the whole. |

### heading-unique-among-its-siblings · MUST

No two headings that share a parent heading share their text.

| Why |
|---|
| two sibling headings with one name read alike in the outline and the table of contents, and a reader cannot tell which part each opens. |

### heading-never-faked-by-emphasis · MUST

Every line that titles a section is a heading, never a paragraph of bold or italic text.

| Why |
|---|
| emphasis has no level, so the section is missing from the outline, the table of contents and the anchors that assistive technology moves by — WCAG, Info and Relationships. |

### non-text-content-has-a-text-alternative · MUST

Every piece of non-text content has a text alternative. An image gives what it shows, a chart or a diagram its data or its finding, and a recording its transcript. Exempt: a decorative image, which has none and is hidden from assistive technology.

| Why |
|---|
| a person who cannot see an image loses what it says, and a decorative one left in the way is announced as noise — WCAG, Non-text Content. |

### meaning-never-carried-by-colour-alone · MUST

Every meaning a colour carries is carried by a word or a symbol too, never by the colour alone. The word or the symbol says the same with the colour gone.

| Why |
|---|
| a reader who cannot tell the colours apart, a monochrome screen and a log with its colour stripped lose whatever colour alone says — WCAG, Use of Color. |

## Copy

### text-addresses-the-reader-as-you · SHOULD

All copy addresses its reader as “you”, never as “the user”.

| Why |
|---|
| text that talks about “the user” talks past the person reading it. |

### text-takes-one-form-of-address · SHOULD

In a language with a formal and an informal “you”, all copy takes the one form the product chose.

| Why |
|---|
| two forms of address read as two products. |

### text-written-in-sentence-case · SHOULD

All copy is written in sentence case, with only the capitals its language gives it.

| Why |
|---|
| text set in several cases reads as several voices, and a translator carries whatever case the source shows into every language. |

### text-uses-the-locales-punctuation · SHOULD

All copy uses its language's typographic punctuation, never straight quotes, a hyphen for a dash or three dots. Such punctuation includes its quotation marks, such as `«…»` in Ukrainian, `„…”` in Polish and `“…”` in English; its apostrophe, such as `’` in English and `ʼ` in Ukrainian; its dashes, `–` for a range and the dash its language sets an aside with; and the ellipsis `…`. Exempt: code, a command line or a value the person pastes elsewhere.

| Why |
|---|
| typed punctuation reads as unfinished text, and one language's marks read as a mistake in another, which quotes in its own. |
