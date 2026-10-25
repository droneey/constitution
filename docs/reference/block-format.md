# Block format

> How a block, its chapters and its rules are written, for the Constitution and for a pack alike.

## A block is a folder

```text
blocks/<layer>/<id>/        the layer is its folder
├── <id>.md                 the passport
├── foundation/             when the block has rules on it
│   ├── <chapter>.md        a chapter of the axis
│   └── with/<other>.md     a seam with another block
├── architecture/           the same form
│   ├── <chapter>.md
│   └── with/<other>.md
└── workflow/
    └── <chapter>.md
```

The passport holds the front matter, which covers every axis of the block, the title, one line of what the block is, its setup and, for an implementation, its Requirements; it holds no rule and never names the files that hold the rest, except core's, which lists its chapters in the order they are read. Every rule lives in a chapter of its axis. Every axis has one form: `foundation/`, which every project follows, and `architecture/` and `workflow/`, which a project may leave out, each a folder of chapters and seams, there only when it holds one; a block with no rules is its passport alone. No file inside an axis is named after the block: its id names only the passport. A chapter is one file of one subject, named for it, and a rule's statement opens with the thing it governs. A seam, `<axis>/with/<other>.md`, is titled as the other block's passport, since its folder already names its own block. It holds a rule that loses its meaning without either block, and sits with the block whose behaviour the rule constrains; its partner is of the holder's layer or a more general one, never core, and never a block the holder requires or extends, or one that requires or extends it, directly or through another. [Where a rule goes](../../packages/constitution/blocks/core/foundation/placement.md) decides a rule's layer, axis and chapter.

## Naming a chapter

A chapter is named in lowercase kebab case for its subject, in its block's own terms, never after the block: `components`, `screens`, `consent`, `messages`, `retries`. Rules of one subject stay in one chapter, and unrelated subjects never share a vague one such as `general` or `misc`.

A language and a platform mirror core: a chapter of theirs that refines a chapter of core on its axis takes that chapter's name, so a language's errors sit in `errors.md`, and a rule of theirs that tightens a rule of core sits in the chapter titled like its parent's. A subject no chapter of core names, such as CSS's cascade, takes a short name of its own. [Core's passport](../../packages/constitution/blocks/core/core.md) lists core's chapters, axis by axis, in the order they are read.

## The form of a chapter

A chapter and a seam share one form:

```md
# Errors

> Governs how the library's failures reach the program.

## General

### errors-carry-their-cause · MUST

…

## Retries

### retry-only-idempotent-calls · MUST

…

## Requirements for implementation

### error-type-exported · MUST

…
```

1. It opens with its title, `# <Name>`, and a quote of what it governs, `> Governs …`.
2. It holds at least one rule.
3. Every rule sits under a `##` section that names a part of the file's subject.
4. No section is named like the file's title.
5. The section of the rules about the whole subject is `General`, the first section when the file has one.
6. `Requirements for implementation`, the rules the file asks of any library that does its job, is the last section when the file has one.

## The passport's front matter

The passport opens with every field, in this order:

```yaml
---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, queries, mutations.
requires: [_react, remote-data]
extends: null
abstract: false
languages: []
governs: ["**/*.hooks.ts", "**/root/providers/**", "**/cache.utils.ts"]
---
```

| Field | Holds |
|---|---|
| `id` | the block's id, its folder's name |
| `summary` | one sentence of at most 70 characters, ending with a full stop |
| `requires` | the blocks it needs: of the layers above, or the host it runs on, and the language of each configuration file it governs, unless a block it requires brings it |
| `extends` | an abstract implementation it is a kind of, or `null` |
| `abstract` | `true` for a base other blocks extend; its id starts with `_` |
| `languages` | for a tool, the language blocks whose files its presets cover, `[]` for one that covers no language's files |
| `governs` | the globs of the files it governs; a domain and a platform govern `**`, a language only its files' extensions, never a manifest or a tool's configuration, which the tool's block governs |

Then come the title, `# <Name>`, and one line of what the block is, as a quote: `> **TanStack Query**, the project's only cache of server data.` Plain paragraphs after it name in bold what else the block owns — ``One **`QueryClient`** holds the cache`` — and give the block's setup — how its tool or library is configured: its preset parts, templates, configuration files and exclusions. An implementation closes its passport with its [Requirements](#requirements). That is the whole passport.

## Terms

A term is defined once, in bold, in the rule or the passport that says what it is; every other mention is plain. Bold is a definition only outside inline code and code fences, so `**/root/**` in backticks defines nothing, and bold is never used for emphasis.

| Written | Term | Kind |
|---|---|---|
| `**binding unit**` | `binding unit` | a concept: lower-case words |
| `**Bounded context.**` opening a sentence | `bounded context` | a concept, its capital the sentence's: a lead-in ends in `.` or `:`, which the term drops |
| `**TanStack Start**` | `TanStack Start` | a brand, as written |
| ``**`widgets/`**`` | `widgets/` | a folder, which ends in `/` |
| ``**`.stories`**`` | `.stories` | a suffix, which starts with `.` |
| ``**`renovate.json`**`` | `renovate.json` | a file, a name with an extension |
| ``**`createServerFn`**`` | `createServerFn` | an API, a command or a package, any other code span |

A term's owner is the block of the file that defines it, and its axis that file's axis: a passport and `foundation/` are foundation's, and a seam takes the axis of its folder. A brand the block is named after, and the files, commands and APIs of its tool, are defined in its passport, in the line of what it is or the setup after it; a concept, a folder or a suffix in the rule, or the opening paragraph of the chapter, that says what it is. [Terms](terms.md) lists every one.

## A rule

```md
### data-view-shows-every-state · MUST

Every data view shows loading, error and content, and the empty or not-found state its data can have.

| Why |
|---|
| an empty screen cannot otherwise be told from a slow one. |
```

- **The heading** is a third-level heading: the slug, unique in the Constitution, and the level. A second-level heading opens a section that groups rules and is no rule.
- **The level** means what [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) gives it, in capitals: `MUST` where a breach is plainly wrong and answered yes or no, most often by a tool; `SHOULD` where it takes judgement or has reasonable exceptions; `MAY` for a permitted choice.
- **The statement** says what holds, opening with the thing it governs.
- **The Why** says what goes wrong without it.

A rule that tightens another names it after an arrow: `### query-result-returned-as-status-union → data-result-is-union-by-status · MUST`. It tightens one rule of another block, never looser than it.

## Requirements

A domain, a platform or core may list, in a chapter under a heading `Requirements for implementation`, the rules it asks of any library that does its job. An implementation answers them in its passport, which describes the block whole, in a `## Requirements` table, last:

| Requirement | How | Met |
|---|---|---|
| `cache-shares-one-read-per-key` | reads with one key share one query and one request | yes |

`yes` meets the rule as written; `partly` meets its purpose or part of it, and `no` cannot meet it. A `partly` or `no` row names in backticks the rule of its own block that covers the rest, so a project that takes the block follows that rule instead, with no override.

## What the check refuses

`constitution blocks check`, and `constitution check` with it, fails on:

- a file outside a block folder, a stray file inside one, a file of an axis named after its block, or two blocks with one id;
- a passport that holds a rule, and a Requirements table anywhere but an implementation's passport;
- a front matter that lacks a field, adds one, lists them out of order, breaks a field's form, or fills one its layer leaves empty;
- a `requires` that points down, or sideways where the layer allows no peer, an `extends` of anything but an abstract implementation, and a cycle between implementations;
- a block that governs a file of a language it does not require, directly or through the blocks it requires or extends;
- a link or a slug that names another block anywhere but the front matter, a `with/` name or a heading's arrow;
- an abstract block without an heir, or one that names its heirs;
- a term defined twice; a term of the architecture or of the workflow used in a chapter or a seam of another axis — a passport speaks of the whole block, every axis at once; a term used in a file whose block cannot reach its owner — core's terms are every block's; a folder or a suffix written in backticks without its `/` or its `.`, where its owner is in reach; and bold that is neither plain words nor one code span;
- a rule without a statement or a Why, a slug used twice, and a heading or a table that misses the format;
- a rule that tightens a rule of its own block, or of an axis it may not reach, at a level looser than that rule's or equal to it;
- a seam named after its own block, after no block or after core, after a block of a layer its block may not pair with, or after a block along a dependency — one its block requires or extends, or one that requires or extends its block, directly or through another — and a seam titled otherwise than the other block's passport;
- a chapter or a seam that does not open with its title and its Governs line, holds no rule, keeps a rule outside a `##` section, names a section like its title, or puts a section before `General` or after `Requirements for implementation`;
- a rule of a language's or a platform's chapter that tightens a rule of core outside the chapter titled like its parent's;
- a list of core's chapters, in core's passport, that leaves one out, names a file that is no chapter of core, or names one twice;
- a malformed Requirements row, or a `partly` or `no` that names no rule of its own block;
- a preset part named after no block, a binding whose rule, part or setting does not hold;
- a tool with preset parts and no template that takes them, a template outside a folder `templates/project/<scope>/<block>/` of a block;
- a file over 500 lines, and a link to a missing file.

After the findings, it advises, without failing, on rules of sibling blocks similar enough to move one layer up.
