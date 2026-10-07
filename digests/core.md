# The constitution

The rules a repository is built by. The digest lists the active blocks and their files; read the files that govern the work.

## How to use it

1. Before a change, read every chapter that governs what it touches, then the active blocks, from domains to implementations.
2. Before handing a change back, read it against every active rule, not only those it seemed to touch.
3. A rule is `### <slug> · <level>`, or `### <slug> → <rule> · <level>` when it tightens another rule, never looser than it; then its statement, Why and Tags. MUST binds; SHOULD is left only with a stated reason; MAY is a choice.
4. A request against a MUST gets the conflict and an alternative, never silent obedience.
5. A rule is placed by the `placement` chapter. A case no rule covers follows the nearest rule, and between two choices the one that raises cohesion and lowers coupling wins; a real gap is amended or written as a local block, never kept as a habit.

## Precedence

1. An override in `constitution.yaml` lowers the one rule it names, core's included. It is written only with the user's consent and its reason, and removed by the change that ends it.
2. Otherwise the more specific layer wins: implementations, then contexts (platforms and languages), then domains, then core. A block tightens what is above it, never loosens it.
3. A clash between a platform and a language means a misplaced rule; it moves to an implementation or the project.
4. Two rules of one layer that disagree are a defect: until it is amended, the one naming the narrower case wins, and the clash is reported.
5. A block that brings its own writer for a resource the program shares with its host claims it in a rule, and a default writer another active block claims yields.

## A dependency with no block

Hold it to the rules of the project's domains and language and their requirements for implementation, report every MUST it cannot meet, and propose a local block for it. Never break a rule silently.

## The project's files

At the repository's root:
- `constitution.yaml`: `version`, the constitution's version the project follows; `axes`, the optional axes it follows; the blocks by layer; `packages`, the blocks of each package; `check`, the command of the one check; `overrides`.
- `PROJECT.md`: the product and its users, entities, boundaries, critical scenarios and glossary.
- `rules/`: the project's local blocks.
