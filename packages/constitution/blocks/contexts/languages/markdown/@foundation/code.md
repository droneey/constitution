# Code

> Governs any Markdown no other chapter governs: the dialect a document is written in, its raw markup and its code blocks.

## Syntax

### document-uses-only-gfm-syntax · SHOULD

Every document uses only the syntax the GitHub Flavored Markdown (GFM) specification defines: CommonMark's, with tables, task lists, strikethrough and autolinks. It uses nothing a renderer adds beyond the specification, such as alerts, footnotes or math. Exempt: a document a site's own renderer turns into pages, which may use that renderer's syntax, and the metadata a tool reads from a file, such as front matter or an attribute in braces, written in that tool's form.

#### Why

A document is read in the forge, in editors and by agents, and syntax only one renderer knows shows as stray marks everywhere else — CommonMark and the GitHub Flavored Markdown specification.

#### Examples

```md title="Avoid"
> [!WARNING]
> A refund cannot be undone.

Refunds reach the card in 5 to 10 days.[^bank]

[^bank]: Some banks take longer.
```

```md title="Prefer"
> **Warning:** a refund cannot be undone.

Refunds reach the card in 5 to 10 days; some banks take longer.
```

### raw-markup-only-where-markdown-has-no-form · MUST

Every document holds raw markup, a tag or a comment, only for what Markdown has no syntax for. Such markup includes `<details>`, `<kbd>` and a comment a tool reads, such as a marker around a generated section. Exempt: an agent's instruction file, which may hold the tags its agent reads, such as `<example>`.

#### Why

Raw markup is noise in the plain text people and agents read, a renderer that strips a tag loses the content inside, and a note left in a comment is hidden from the rendered page while the plain text still shows it.

#### Examples

```md title="Avoid"
## <a id="refunds"></a>Refunds

Refunds reach the card in <b>5 to 10 days</b>.<br>
<!-- check this with finance -->
```

```md title="Prefer"
## Refunds

Refunds reach the card in **5 to 10 days**.

<details>
<summary>Refunds to a closed card</summary>

The bank returns them to the account the card belonged to.

</details>
```

## Code blocks

### code-fence-names-its-language · MUST

Every code block is fenced and names its language in its info string, such as `ts`, `sh` or `text` for plain output.

#### Why

A block without its language is neither highlighted nor checked as one, and a reader or an agent guesses what it holds; an indented block can name none.

#### Examples

````md title="Avoid"
Run the migrations:

```
bun run db:migrate
```
````

````md title="Prefer"
Run the migrations:

```sh
bun run db:migrate
```
````
