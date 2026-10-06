# The constitution

The rules a repository is built by. The digest lists the active blocks and their files; read the files that govern the work.

## How to use it

1. Before a change, read this file and every chapter whose name says the change touches what it governs, then the active blocks, from domains to implementations.
2. Before handing a change back, its check passes and it is read against every active rule, not only those it seemed to touch.
3. A rule is `### <slug> · <level>`, or `### <slug> → <rule>` when it tightens a rule of a block it builds on and takes its level; then its statement, Why and Tags. MUST binds; SHOULD is left only with a stated reason; MAY is a choice.
4. A request against a MUST gets the conflict and an alternative, never silent obedience.
5. A case no rule covers follows the nearest rule, and between two choices the one that raises cohesion and lowers coupling wins; a real gap is amended or written as a local block, never kept as a habit.

## Precedence

1. An override in `constitution.yaml` is stronger than any rule, core's included. It is written only with the user's consent and its reason, and removed by the change that ends it.
2. Otherwise the more specific layer wins: implementations, then contexts (platforms and languages), then domains, then core. A block tightens what is above it, never loosens it.
3. A clash between a platform and a language means a misplaced rule; it moves to an implementation or the project.

## Where a rule goes

Three questions, asked apart, place a rule.

Its layer: what must disappear for it to lose its meaning? Nothing: core. An aspect a product may lack — a user interface, an API, a network: that domain. A runtime or a language: that context. A library or a tool: its block.

Its axis: who would still want it? Not a team with another architecture: `architecture/` — layers and the direction of dependencies, ports and adapters, the homes of input, output and state, the wiring, the isolation of parts, the tree. Not a team with another workflow: `workflow/` — how a change travels from the idea to the release, and the working agreement with people and agents. Any team: the block's root.

Its chapter: the one named for what its statement governs, which the statement names first; `code` only when no other chapter does.

A rule never refers to a rule of its own block. It may tighten a rule of core or of a block it requires: the root only a root rule, `architecture/` an `architecture/` or root rule, `workflow/` a `workflow/` or root rule.

## A dependency with no block

Hold it to the rules of the project's domains and language and their requirements for implementation, report every MUST it cannot meet, and propose a local block for it. Never break a rule silently.

## The project's files

At the repository's root:
- `constitution.yaml`: `version`, the constitution's version the project follows; `axes`, the optional axes it follows; the blocks by layer; `packages`, the blocks of each package; `check`, the command of the one check; `overrides`.
- `PROJECT.md`: the product and its users, entities, boundaries, critical scenarios and glossary.
- `rules/`: the project's local blocks.
