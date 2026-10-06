# The droneey constitution

The rules a droneey repository is built by. The digest lists the active blocks and their files; read the files that govern the work.

## How to use it

1. Before a change, read core's chapters and the files of the blocks that govern it, on the project's axes. Before handing it back, check it against every active rule, not only those it seemed to touch.
2. A rule is `<slug> · <level>`, or `<slug> → <rule>` with that rule's level, then its Why, Check and Tags. MUST binds; SHOULD is left only with a reason; MAY is a choice.
3. A request against a MUST gets the conflict and an alternative, never silent obedience.
4. A case no rule covers follows the nearest principle; a real gap is amended or written as a local block, never kept as a silent habit.

## Precedence

1. An override in `constitution.yaml` is stronger than any rule, core included. It is written only with the user's consent to it, and its reason.
2. Otherwise the more specific layer wins: implementations, then contexts (platforms and languages), then domains, then core. A block tightens what is above it, never loosens it.
3. A clash between a platform and a language means a misplaced rule; it moves to an implementation or the project.

## Where a rule goes

Two questions place a rule. Its layer: what must disappear for it to lose its meaning? Nothing: core. A user interface, an API, a network: that domain. A runtime or a language: that context. A library: its block. Its axis: would a team with another architecture still want it? If not, `architecture/` — layers, dependency direction, seams to other systems, homes of I/O and state, the isolation of parts, the program's wiring, the tree. With another workflow? If not, `workflow/` — how a change travels from the idea to the release: branch, commit, review, merge, version and release, CI gates, the hooks run on each commit, updates, and the working agreement with people and agents. Otherwise `foundation/`; a rule failing both is split, and one implementing a rule on an axis is on it. `architecture/` and `workflow/` refer to `foundation/`, never to each other; `foundation/` refers only to itself.

## A library with no block

Hold it to the rules of the project's domains and language and their requirements for implementation, report every MUST it cannot meet, and propose a local block for it. Never break a rule silently.

## The project's files

- `constitution.yaml`: the pinned version, its axes (`foundation` always), its blocks, the blocks of each of its units under `packages`, its check command and its overrides.
- `PROJECT.md`: the product and its users, entities, boundaries and glossary.
- `rules/`: the project's local blocks.

## Reading order

This file, then the `principles` of `foundation/` and `architecture/`, then the chapters of the task: `anatomy` before structure changes, `code` and `types` before code is written, `testing` with every behaviour, `security` for dependencies and secrets, `delivery` for every change, `collaboration` when working with people and agents. Then the active blocks, from domains to implementations.
