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

[Where a rule goes](../../packages/constitution/blocks/core/@foundation/placement.md) places the passport, the axes, the chapters and the seams: `block-root-holds-its-passport-beside-its-axes`, `rule-placed-on-the-axis-its-readers-share`, `rule-placed-in-the-chapter-named-for-it`, `rule-placed-in-a-seam-only-when-it-needs-both-blocks` and `seam-held-by-the-block-whose-behaviour-it-constrains`. Beside them, the passport's front matter covers every axis of the block, and the passport never names the files that hold the rest, except core's, which lists its chapters in the order they are read; a block with no rules is its passport alone, and its id names only the passport. A seam, `<axis>/with/<other>.md`, is titled as the other block's passport, since its folder already names its own block.

## Naming a chapter

A chapter is named in lowercase kebab case for its subject, in its block's own terms, as `rule-placed-in-the-chapter-named-for-it` asks: `components`, `screens`, `consent`, `messages`, `retries`. A language and a platform name theirs after core's, as `context-chapters-follow-cores` asks, so a language's errors sit in `errors.md`, and CSS's cascade takes a short name of its own. [Core's passport](../../packages/constitution/blocks/core/core.md) lists core's chapters, axis by axis, in the order they are read.

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

Its title, its `> Governs …` line and its sections are those `rule-sits-in-a-section-of-its-file` asks for; `Requirements for implementation` holds the rules the file asks of any library that does its job.

## The passport's front matter

The passport opens with every field, in this order:

```yaml
---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, queries, mutations.
requires: [react, integrations/remote-data]
extends: null
abstract: false
languages: []
governs: ["**/*.hooks.ts", "**/root/**", "**/bindings/shared/cache.ts"]
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

Then come the title, `# <Name>`, and one line of what the block is, as a quote: `> **TanStack Query**, the cache of server data.` Plain paragraphs after it name in bold what else the block owns — ``One **`QueryClient`** holds the cache`` — and give the block's setup — how its tool or library is configured: its preset entries, templates, configuration files and exclusions. An implementation closes its passport with its [Requirements](#requirements). That is the whole passport.

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

A folder or a suffix carries an id right after its bold, ``**`infrastructure/`**{#adapter}``: the role's stable name, which a tool's settings can name it by while its spelling changes. The id names what the folder holds, or, for a suffix whose file is a member of such a folder, that folder's id followed by `-file` — `.adapter` is `adapter-file`; it is lower-case words and digits joined by hyphens, opening with a letter, unique across every term save one: a block that builds on the term's owner and spells it its own way, as Python writes `use_cases/`, defines its spelling under the same id. A folder renamed changes only its definition, never its id; an id changes only when its concept does, by a decision that adds its row to the term id aliases of `DECISIONS.md`, so a pack's settings can follow. Any other term may carry one too. The site makes the id the term's anchor and shows no braces.

A term's owner is the block of the file that defines it, and its axis that file's axis: a passport and `foundation/` are foundation's, and a seam takes the axis of its folder. A brand the block is named after, and the files, commands and APIs of its tool, are defined in its passport, in the line of what it is or the setup after it; a concept, a folder or a suffix in the rule, or the opening paragraph of the chapter, that says what it is. [Terms](terms.md) lists every one.

## A rule

```md
### data-view-shows-every-state · MUST

A data view shows every state its data can have. Those are loading, failure, content, and the empty or not-found state where its data can be empty or missing; no default stands in for data not yet loaded.

| Why |
|---|
| an empty view cannot otherwise be told from a slow or a broken one, and an invented default hides loading and failure behind something that looks like data, so the user does not know what to do. |
```

- **The heading** is a third-level heading: the slug, unique in the Constitution, and the level. A second-level heading opens a section that groups rules and is no rule.
- **The level** means what [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) gives it, in capitals: `MUST` where a breach is plainly wrong and answered yes or no, most often by a tool; `SHOULD` where it takes judgement or has reasonable exceptions; `MAY` for a permitted choice.
- **The statement** opens with its slogan and states an outcome, as `rule-opens-with-its-slogan` and `rule-states-an-outcome` ask.
- **The Why** names the failure the rule prevents, and closes as `why-names-the-failure-it-prevents` asks.

A rule that tightens another names it after an arrow: `### query-result-returned-as-status-union → data-call-returns-a-union-of-its-states · MUST`. It tightens one rule of another block, never looser than it.

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
- a term defined twice; a term of the architecture or of the workflow used in a chapter or a seam of another axis — a passport speaks of the whole block, every axis at once; a term used in a file whose block cannot reach its owner — core's terms are every block's; a folder or a suffix written in backticks without its `/` or its `.`, where its owner is in reach; a folder or a suffix without an id, an id of another form, and an id two terms carry; and bold that is neither plain words nor one code span;
- a rule without a statement or a Why, a slug used twice, and a heading or a table that misses the format;
- a rule that tightens a rule of its own block or of an axis it may not reach, and one that tightens a rule at a level looser than that rule's — at the same level it passes;
- a seam named after its own block, after no block or after core, after a block of a layer its block may not pair with, or after a block along a dependency — one its block requires or extends, or one that requires or extends its block, directly or through another — and a seam titled otherwise than the other block's passport;
- a chapter or a seam that does not open with its title and its Governs line, holds no rule, keeps a rule outside a `##` section, names a section like its title, or puts a section before `General` or after `Requirements for implementation`;
- a rule of a language's or a platform's chapter that tightens a rule of core outside the chapter titled like its parent's;
- a list of core's chapters, in core's passport, that leaves one out, names a file that is no chapter of core, or names one twice;
- a malformed Requirements row, or a `partly` or `no` that names no rule of its own block;
- a file over 500 lines, and a link to a missing file.

After the findings, it advises, without failing, on rules of sibling blocks similar enough to move one layer up.
