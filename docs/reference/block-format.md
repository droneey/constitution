# Block format

> How a block, its chapters and its rules are written, for the Constitution and for a pack alike.

## A block is a folder

```text
blocks/<layer>/<id>/        the layer is its folder
├── <id>.md                 the card
├── <chapter>.md            a chapter of the base
├── with/
│   └── <other>.md          a seam with another block
├── architecture/
│   ├── <id>.md             the axis's main chapter
│   └── with/<other>.md
└── workflow/
    └── <id>.md             the axis's main chapter
```

The card holds the front matter, the summary and the rules of the block's main chapter; every other chapter holds one topic. A chapter is named for what its rules govern, and a rule's statement opens with that thing. [Where a rule goes](../../packages/constitution/blocks/core/placement.md) decides a rule's layer, axis and chapter.

## The card's front matter

The card opens with every field, in this order:

```yaml
---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, queries, mutations.
requires: [_react, remote-data]
extends: null
abstract: false
languages: []
dictionary: [TanStack Query, QueryClient, useQuery, useSuspenseQuery, useMutation]
governs: ["**/*.hooks.ts", "**/root/providers/**", "**/cache.utils.ts"]
---
```

| Field | Holds |
|---|---|
| `id` | the block's id, its folder's name |
| `summary` | one sentence of at most 70 characters, ending with a full stop |
| `requires` | the blocks it needs: of the layers above, or the host it runs on |
| `extends` | an abstract implementation it is a kind of, or `null` |
| `abstract` | `true` for a base other blocks extend; its id starts with `_` |
| `languages` | for a tool, the language blocks whose files its presets cover |
| `dictionary` | the brands, words and file names only this block and the blocks that depend on it may write |
| `governs` | the globs of the files it governs; a domain and a platform govern `**` |

Then come the title, `# <Name>`, and one line of what the block is, as a quote: `> The project's only cache of server data.`

## A rule

```md
### data-view-shows-every-state · MUST

Every data view shows loading, error and content, and the empty or not-found state its data can have.

| Why | Tags |
|---|---|
| an empty screen cannot otherwise be told from a slow one. | [ux, a11y] |
```

- **The heading** is a third-level heading: the slug, unique in the Constitution, and the level. A second-level heading opens a section that groups rules and is no rule.
- **The level** means what [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) gives it, in capitals: `MUST` where a breach is plainly wrong and answered yes or no, most often by a tool; `SHOULD` where it takes judgement or has reasonable exceptions; `MAY` for a permitted choice.
- **The statement** says what holds, opening with the thing it governs.
- **The Why** says what goes wrong without it.
- **The Tags** are lenses, `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux`, or `[]`.

A rule that tightens another names it after an arrow: `### query-result-returned-as-status-union → data-result-is-union-by-status · MUST`. It tightens one rule of another block, never looser than it, and takes its tags.

## Requirements

A domain, a platform or core may list, under a heading `Requirements for implementation`, the rules it asks of any library that does its job. An implementation's card answers them in a table:

| Requirement | How | Met |
|---|---|---|
| `cache-shares-one-read-per-key` | reads with one key share one query and one request | yes |

`yes` meets the rule as written; `partly` meets its purpose or part of it, and `no` cannot meet it. A `partly` or `no` row names in backticks the rule of its own block that covers the rest, so a project that takes the block follows that rule instead, with no override.

## What the check refuses

`blocks-check` fails on:

- a file outside a block folder, a stray file inside one, or two blocks with one id;
- a front matter that lacks a field, adds one, lists them out of order, breaks a field's form, or fills one its layer leaves empty;
- a `requires` that points down, or sideways where the layer allows no peer, an `extends` of anything but an abstract implementation, and a cycle between implementations;
- a link or a slug that names another block anywhere but the front matter, a `with/` name or a heading's arrow;
- an abstract block without an heir, or one that names its heirs;
- a word of a block's `dictionary` outside that block and the blocks that depend on it, and a word of `vocabulary.yaml` outside its axis;
- a rule without a statement, a Why or a known tag, a slug used twice, and a heading or a table that misses the format;
- a rule that tightens a rule of its own block, or of an axis it may not reach, at a level looser than that rule's or equal to it;
- a malformed Requirements row, or a `partly` or `no` that names no rule of its own block;
- a preset part named after no block, a binding whose rule, part or setting does not hold;
- a file over 500 lines, and a link to a missing file.

After the findings, it advises, without failing, on rules of sibling blocks similar enough to move one layer up.
