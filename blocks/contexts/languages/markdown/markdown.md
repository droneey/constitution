---
id: markdown
summary: "Markdown documents: headings, links, images and code blocks."
requires: []
extends: null
abstract: false
languages: []
dictionary: [Markdown, CommonMark]
governs: ["**/*.md"]
---

# Markdown

> Markdown, the format of a repository's readmes, agent files and documents, read as plain text as often as it is rendered by a forge, an editor or a site. CommonMark specifies it, and GitHub Flavored Markdown adds the tables, task lists, strikethrough and autolinks most forges render.

## Code

### document-written-in-commonmark-and-gfm · SHOULD
A document uses CommonMark and the extensions of GitHub Flavored Markdown — tables, task lists, strikethrough, autolinks — and another renderer's syntax only in a site that renderer builds.

| Why | Tags |
|---|---|
| a document is read in the forge, in editors and by agents, and syntax only one renderer knows shows as stray marks everywhere else. | [] |

### raw-html-only-where-markdown-has-no-form · SHOULD
A document writes raw HTML only for what Markdown has no syntax for, such as `<details>` or `<kbd>`; an agent's instruction file may also hold the tags its agent reads, such as `<example>`.

| Why | Tags |
|---|---|
| raw HTML is noise in the plain text people and agents read, and a renderer that strips it loses the content inside. | [] |

## Security

### outside-markdown-rendered-without-raw-html-or-script-links → outside-input-reaches-interpreters-as-parameters · MUST
Markdown from outside the program is rendered with its raw HTML escaped or sanitised and its link and image destinations limited to safe schemes, so no `javascript:`, `vbscript:` or `data:` link survives.

| Why | Tags |
|---|---|
| CommonMark passes raw HTML and any link destination through to the page, so whoever wrote the text runs script in the reader's session. | [security] |

## Layout

### markdown-file-ends-in-md → format-has-one-extension · SHOULD
A Markdown file ends in `.md`, never `.markdown` or `.mdown`.

| Why | Tags |
|---|---|
| one extension lets every glob, renderer and reader find every document, and `.md` is the one forges, editors and tools expect. | [] |

## Headings

### document-has-one-title-heading · MUST
A document read as a page has one first-level heading, its title, before any other heading; a file only a tool or an agent reads, or whose form a tool generates, needs none.

| Why | Tags |
|---|---|
| renderers, outlines and readers take the first-level heading as the document's name, and with two the document has no one name. | [] |

### heading-level-never-skipped · MUST
A heading is at most one level deeper than the heading before it: a `###` follows a `##` or a `###`, never a `#` — save in a file whose heading levels a tool or a schema fixes.

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

## Links and images

### repository-link-is-a-path · SHOULD
A link to a file of the same repository is a path, relative to the document or to the repository's root, never a full URL on the forge.

| Why | Tags |
|---|---|
| a path works on every branch, fork, clone and mirror, while a full URL points at one branch on one host and goes stale with it. | [] |

### repository-link-resolves · MUST
A link to a file of the repository leads to a file that exists, and its fragment to a heading that exists in that file.

| Why | Tags |
|---|---|
| a broken link sends the reader nowhere just when they need the page, and a moved file or a renamed heading breaks links far from the change. | [] |

### link-text-names-its-target · SHOULD
A link's text says where it leads, never `here`, `this`, `link` or the bare address.

| Why | Tags |
|---|---|
| readers scan links, and a screen reader lists them out of their sentence, where `here` tells nothing. | [a11y] |

### image-has-alt-text · MUST
An image carries alt text that says what it shows, or empty alt text where it only decorates.

| Why | Tags |
|---|---|
| a reader who cannot see the image, or whose renderer cannot show it, reads the alt text in its place. | [a11y] |

## Code blocks

### code-block-names-its-language · SHOULD
A code block is fenced, and its info string names its language: `ts`, `sh`, `text` for plain output.

| Why | Tags |
|---|---|
| the language decides how the block is highlighted and checked, and tells a reader or an agent what it is; an indented block can name none. | [] |
