---
id: core
summary: What holds for any program, in any language, of any kind.
requires: []
extends: null
abstract: false
languages: []
governs: []
---

# The Constitution

The rules a repository is built by. The digest lists the active blocks and their files; read the files that govern the work.

## How to use it

1. Before a change, read every chapter that governs what it touches, then the active blocks, from domains to implementations.
2. Before handing a change back, read it against every active rule, not only those it seemed to touch.
3. A rule is `### <slug> · <level>`, or `### <slug> → <rule> · <level>` when it tightens another rule, never looser than it; then its statement and Why. MUST binds; SHOULD is left only with a stated reason; MAY is a choice.
4. A request against a MUST gets the conflict and an alternative, never silent obedience.
5. A rule is placed by the `placement` chapter. A case no rule covers follows the nearest rule, and between two choices the one that raises cohesion and lowers coupling wins; a real gap is amended or written as a block of the project's own pack, never kept as a habit.

## Precedence

1. An override in `constitution.yaml` lowers the one rule it names, core's included; the rules that tighten it keep their own levels. It is written only with the user's consent and its reason, and removed by the change that ends it.
2. Otherwise the more specific layer wins: implementations, then contexts (platforms and languages), then domains, then core. A block tightens what is above it, never loosens it.
3. A clash between a platform and a language means a misplaced rule; it moves to an implementation or the project's own pack.
4. Two rules of one layer that disagree are a defect: until it is amended, the one naming the narrower case wins, and the clash is reported.

## Its chapters

Read in this order, each in its axis's folder:

- `foundation/`: [placement](foundation/placement.md), [code](foundation/code.md), [names](foundation/names.md), [functions](foundation/functions.md), [relations](foundation/relations.md), [types](foundation/types.md), [errors](foundation/errors.md), [effects](foundation/effects.md), [security](foundation/security.md), [dependencies](foundation/dependencies.md), [tools](foundation/tools.md), [changes](foundation/changes.md), [layout](foundation/layout.md), [comments](foundation/comments.md), [tests](foundation/tests.md), [agents](foundation/agents.md).
- `architecture/`: [layers](architecture/layers.md), [layout](architecture/layout.md), [ports](architecture/ports.md), [root](architecture/root.md), [domain](architecture/domain.md), [tests](architecture/tests.md).
- `workflow/`: [agents](workflow/agents.md).

## A dependency with no block

Hold it to the rules of the project's domains and language and their requirements for implementation, report every MUST it cannot meet, and propose a block for it in the project's own pack. Never break a rule silently.

## The project's files

`constitution.yaml` sits at the root and in each package, each read alone: `axes`, the optional axes it follows; the blocks by layer; `packs`, the folders of blocks it follows beside the Constitution's, its own among them; `overrides`; the root's alone `check`, the one check. At the root also:

- `PROJECT.md`: the product and its users, entities, boundaries, critical scenarios and glossary.
- `DECISIONS.md`: the choices between real alternatives, each with what was rejected and why.
