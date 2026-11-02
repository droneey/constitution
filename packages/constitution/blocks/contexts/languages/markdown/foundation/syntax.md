# Syntax

> Governs the dialect, raw HTML and fenced code blocks.

## General

### document-written-in-commonmark-and-gfm · SHOULD

A document uses CommonMark and the extensions of GitHub Flavored Markdown. The extensions are tables, task lists, strikethrough and autolinks, and another renderer's syntax appears only in a site that renderer builds.

| Why |
|---|
| a document is read in the forge, in editors and by agents, and syntax only one renderer knows shows as stray marks everywhere else — CommonMark and GitHub Flavored Markdown. |

### raw-html-only-where-markdown-has-no-form · SHOULD

A document writes raw HTML only for what Markdown has no syntax for. Such things include `<details>` and `<kbd>`, and an agent's instruction file may also hold the tags its agent reads, such as `<example>`.

| Why |
|---|
| raw HTML is noise in the plain text people and agents read, and a renderer that strips it loses the content inside. |

### code-block-names-its-language · SHOULD

A code block is fenced and names its language. Its info string names it: `ts`, `sh`, `text` for plain output.

| Why |
|---|
| a block without its language is neither highlighted nor checked as one, and a reader or an agent must guess what it holds; an indented block can name none. |
