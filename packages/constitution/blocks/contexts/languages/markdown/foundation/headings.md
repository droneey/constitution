# Headings

> Governs a document's headings: its title, their levels and their names.

## General

### document-has-one-title-heading · MUST

A document read as a page has one first-level heading, its title, before any other heading; a file only a tool or an agent reads, or whose form a tool generates, needs none.

| Why | Tags |
|---|---|
| renderers, outlines and readers take the first-level heading as the document's name, and with two the document has no one name. | [] |

### heading-level-never-skipped · MUST

A heading is at most one level deeper than the heading before it: a `###` follows a `##` or any deeper heading, never a `#` — save in a file whose heading levels a tool or a schema fixes.

| Why | Tags |
|---|---|
| the levels are the document's outline, which a reader, a screen reader and a table of contents follow, and a skipped level reads as a missing section. | [] |

### heading-unique-among-its-siblings · SHOULD

No two headings under one parent heading share their text.

| Why | Tags |
|---|---|
| two sibling headings with one name read alike in the outline and the table of contents, and a reader cannot tell which part each opens. | [] |

### heading-never-faked-by-emphasis · SHOULD

A line that titles a section is a heading, never a paragraph of bold or italic text.

| Why | Tags |
|---|---|
| emphasis has no level, so the section is missing from the outline, the table of contents and the anchors. | [] |
