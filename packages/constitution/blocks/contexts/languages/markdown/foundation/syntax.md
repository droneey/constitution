# Syntax

> Governs the dialect, raw HTML and fenced code blocks.

## General

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

### code-block-names-its-language · SHOULD

A code block is fenced, and its info string names its language: `ts`, `sh`, `text` for plain output.

| Why | Tags |
|---|---|
| the language decides how the block is highlighted and checked, and tells a reader or an agent what it is; an indented block can name none. | [] |
