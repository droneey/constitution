# Block format

> How a block, its chapters and its rules are written, for the Constitution and for a pack alike.

## A block is a folder

```text
blocks/<rank>/<id>/           domains/, contexts/platforms/, contexts/languages/ or implementations/
├── <name>.md                 the passport, <name> the last part of the id
├── @foundation/              when the block has rules on it
│   ├── <chapter>.md          a chapter of the axis
│   └── with/<other>.md       a seam with another block, <other> that block's id
├── @architecture/            the same form
├── @workflow/
└── <child>/                  a child block, whose id is <id>/<child>
```

A block's id is its path among the blocks of its rank: `tanstack-query`, `js-runtime/bun`, `contracts/api/rest`, and `client/browser` for a context, which leaves out its `platforms/` or `languages/` folder. A folder at a block's root without the `@` is a child block, and the block whose folder holds it is its parent, the one parent it has. Wherever a block is active, every block it sits under is active too, so listing `react/react-dom` turns `react` on. No part of an id is a reserved word: `with`, `foundation`, `architecture` or `workflow`.

A seam's name is the other block's id, so a seam with a child block sits in folders: `tailwind/@foundation/with/presentation/design-system.md`. It is titled with the other block's name.

[Placement](../../packages/constitution/blocks/core/@foundation/placement.md) places the passport, the axes, the chapters and the seams: `block-root-holds-its-passport-beside-its-axes`, `rule-placed-on-the-axis-its-readers-share`, `rule-placed-in-the-chapter-named-for-it`, `rule-placed-in-a-seam-only-when-it-needs-both-blocks` and `seam-held-by-the-block-whose-behaviour-it-constrains`. A block with no rules is its passport alone, and the block's id names only the passport, never a chapter. Every passport, chapter and seam holds at most 1500 lines, its examples counted.

## Naming a chapter

A chapter is named in lowercase kebab case for its subject, in its block's own terms, as `rule-placed-in-the-chapter-named-for-it` asks: `components`, `screens`, `consent`, `messages`, `retries`. A language and a platform name theirs after core's, as `context-chapters-follow-cores` asks, so a language's errors sit in `errors.md`. [Core's passport](../../packages/constitution/blocks/core/core.md) lists core's chapters, axis by axis, in the order they are read.

## The form of a chapter

A chapter and a seam share one form:

```md
# Errors

> Governs how the library's failures reach the program.

## Vocabulary

A **retryable failure** is one a second attempt of the same call may not meet.

## General

### errors-carry-their-cause · MUST

…

## Retries

### retry-only-retryable-failures · MUST

…
```

It opens with its title and its `> Governs …` line, and everything after them sits in a `##` section, as `rule-sits-in-a-section-of-its-file` asks. The sections run in one order, as `sections-run-in-one-order` asks: `Vocabulary` where the file defines a term, then `General` where some rules are about the whole subject, then one section for each part of it, none named like the title. A `Vocabulary` holds only definitions; every other section holds at least one rule.

## The passport

The passport opens with its front matter, every field in this order:

```yaml
---
id: tanstack-query
summary: Server data in the TanStack Query cache — keys, queries, mutations.
requires: [react, integrations/remote-data]
languages: []
governs: ["**/*.hooks.ts", "**/root/**", "**/bindings/shared/cache.ts"]
---
```

| Field | Holds |
|---|---|
| `id` | the block's id, its path from its rank's folder |
| `summary` | one sentence on one line, of at most 70 characters, ending with a full stop |
| `requires` | the blocks it cannot work without beyond those it sits under, as `passport-requires-only-what-its-block-needs` asks: of a rank above, or of its own where its rank allows a peer; never core, never a block it sits under, never one its parent already turns on |
| `languages` | for a tool, the language blocks whose files its presets cover; `[]` for any other block |
| `governs` | the globs of the files its rules govern: `**` for a domain or a platform, a language's own files, a tool's settings files |

Then come the title, `# <Name>`, one line of what the block is, as a quote, and plain paragraphs of its setup: how its tool or library is configured, what its preset entries cannot show. That is the whole passport: no section, no rule and no term, as `passport-holds-no-rule` asks. Core's passport is the one exception: it holds the preamble, how to use the Constitution, its precedence, the list of its chapters and the project's files.

## Terms

A term two or more rules use, or a definition or another chapter uses, is defined once, in bold, in the `Vocabulary` of a chapter or a seam; a term only one rule needs is stated plainly in that rule, as `rule-term-defined-in-a-vocabulary` asks. Bold is a definition only outside inline code and code fences, so `**/root/**` in backticks defines nothing, and bold is never used for emphasis.

| Written | Term | Kind |
|---|---|---|
| `**binding unit**` | `binding unit` | a concept: lower-case words |
| `**Remote data** is …` opening a sentence | `remote data` | a concept, its capital the sentence's; a lead-in that ends in `.` or `:` drops it |
| `**JSDoc**` | `JSDoc` | a brand, as written |
| ``**`widgets/`**`` | `widgets/` | a folder, which ends in `/` |
| ``**`.stories`**`` | `.stories` | a suffix, which starts with `.` |
| ``**`main.ts`**`` | `main.ts` | a file, a name with an extension |
| ``**`createServerFn`**`` | `createServerFn` | an API, a command or a package, any other code span |

A folder or a suffix carries an id right after its bold, ``**`infrastructure/`**{#adapter}``: the role's stable name, which a tool's settings name it by while its spelling changes. The id names what the folder holds, or, for a suffix whose file is a member of such a folder, that folder's id followed by `-file`, so `.adapter` is `adapter-file`. It is lower-case words and digits joined by hyphens, opening with a letter, and unique across every term save one case: a block that builds on the term's owner and spells it its own way, as Python writes `use_cases/`, defines its spelling under the same id. A folder renamed changes only its definition, never its id; an id changes only when its concept does.

Any other term may carry an id too. A file, ``**`main.ts`**{#entry}``, is then a role a tool's settings name by its id, and so is a placeholder such as core's ``**`<entry>`**{#entry}`` that stands for the file a language's block spells under the same id. A concept, ``**empty names**{#empty-names}``, lists the words its definition names in code spans, up to the end of its sentence or the next term, and a copied plugin takes them as [`${term.<id>}`](presets.md#an-entry). The site makes the id the term's anchor and shows no braces.

A term's owner is the block of the file that defines it, and its axis that file's axis: a seam takes the axis of its folder. A rule uses a term only of its own block, of core, or of a block its block requires or sits under, and only of its own axis or `@foundation/`. [Terms](terms.md) lists every one.

## A rule

````md
### failure-told-apart-by-code · MUST

Every failure is told apart by its type or its code, never by its message.

#### Why

A message is text anyone may reword at any time, so code that branches on it breaks silently at the next rewording.

#### Examples

```pseudo title="Avoid"
if error.message.includes("not found") then
  return showEmptyCart()
```

```pseudo title="Prefer"
if error.code is CartNotFoundError.code then
  return showEmptyCart()
```
````

- **The heading** is a third-level heading: the slug, unique across the Constitution and its packs, and the level. A second-level heading opens a section and is no rule.
- **The level** is `MUST` or `SHOULD`, in capitals, as [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) means them, and `level-set-by-the-cost-of-a-breach` chooses: `MUST` where a breach risks a defect, an unsafe state or a broken interoperation and a reviewer or a tool can tell it from compliance; `SHOULD` where a breach only makes the code harder to read or change. A heading never says `MAY`: only [an override](constitution-yaml.md#overrides) sets a rule to `MAY`, which it then only advises.
- **The statement** opens with its slogan, scoped by every, each or all, and states an outcome; its exemptions sit in its last sentence, opened by `Exempt:`, as the `Wording` rules of placement ask.
- **The Why**, a section `#### Why` of prose right after the statement, names the failure the rule prevents and closes on the reference it follows, as `why-names-the-failure-it-prevents` asks.
- **The Examples**, a section `#### Examples` that every rule ends with, hold only fenced code blocks, each with a `title`: `Avoid` and `Prefer` for a pair, a title of its own for a tree or a diagram. `constitution rules` and the gate hand a rule's statement, its Why only on `--why`, and never its examples; the site shows them on the rule's card.

A rule that tightens another names it after an arrow and states its own level, never looser than that rule's: `### query-result-returned-as-status-union → data-call-returns-a-union-of-its-states · MUST`. It tightens a rule within its reach, as `rule-refers-only-within-its-reach` asks: of core, of a block its own requires or sits under, or, in a seam, of the seam's other block, never of its own block; and a rule on `@architecture/` or `@workflow/` tightens one of its own axis or of `@foundation/`, a `@foundation/` rule only one of `@foundation/`.

## What the check refuses

`constitution blocks check`, and `constitution check` with it, fails on:

- a file outside a block folder, a stray file inside one, a chapter named after its block, a block without its passport, front matter anywhere but a passport, two blocks with one id, and a block id that is not kebab-case segments or holds a reserved word;
- a front matter that does not parse, lacks a field, adds one, lists them out of order or breaks a field's form; an `id` other than its folder's; a `summary` over 70 characters or not one sentence; `languages` filled outside an implementation, or naming no language;
- a `requires` that names core, no block, itself, a block of a rank it may not require, a block it sits under, or one its parent already turns on; and a cycle of `requires`;
- a passport that holds a rule or more than its title, its one line and its setup;
- a chapter or a seam that does not open with its title and its Governs line, holds text before its first section, holds no rule, keeps a rule outside a section, a rule in its `Vocabulary`, or a section with no rule but the `Vocabulary`, names a section like its title, or puts a section before `Vocabulary` or before `General`;
- a rule heading of another form, a `MAY` in a heading, a rule without its statement, its Why or its Examples, a section of a rule other than those two, a Why that does not follow the statement, an Examples that is not last, holds prose or a heading, or a block without a title, and a slug used twice;
- a rule that tightens no rule, a rule of its own block, one out of its reach or off its axis, or one at a looser level, a tightening rule that states no level, and a chain of tightening that comes back to its start;
- a seam named after its own block, after no block it may pair with, after a block of a rank its block may not pair with, or after a block along a dependency: one its block requires or sits under, or one that requires it or sits under it;
- a link to a missing file, or into a block out of reach; a rule of another block named out of reach; a decision cited in a block;
- core naming a language, a tool, a library, a product, a vendor or a version; a block naming a product of a block out of its reach, or of no block; a parent naming its children's products;
- a term defined outside a `Vocabulary`, defined twice, used on another axis or out of its owner's reach, or set in bold that is neither plain words nor one code span; a folder or a suffix without an id; an id misshapen or carried by two terms;
- a slogan of more than 22 words or not scoped by every, each or all, an exemption outside a last `Exempt:` sentence, a modal verb in a statement, a Why with more than one dash or without its closing period;
- a list of core's chapters, in core's passport, that leaves one out, names a file that is no chapter of core, or names one twice;
- a file over 1500 lines;
- a missing `DECISIONS.md` at the folder's root, and an entry of it out of order, without its date line or dated by no calendar day.

Each finding opens with the placement rule it breaks, in square brackets. In a pack, a finding of a `SHOULD` rule, or of a rule a unit that lists the pack lowers, only advises, and a slug joined by "and" and a term no rule uses advise everywhere; the release's own check fails on every other finding. After the findings, the release's check advises, without failing, on rules of sibling blocks similar enough to move one rank up.
