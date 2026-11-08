---
id: core
summary: The rules every repository is built by.
requires: []
languages: []
governs: ["**"]
---

# The Constitution

The rules a repository is built by. The digest lists the active blocks and their files; read the files that govern the work.

## How to use it

1. Before a change, read every chapter that governs what it touches, then the active blocks, from the domain blocks down.
2. Before handing a change back, read it against every active rule; a rule outranks the habit of the code around it, and a breach nearby is no precedent.
3. A rule is `### <slug> · <level>`, or `### <slug> → <rule> · <level>` when it tightens another rule, never looser than it; then its statement and Why. MUST binds; SHOULD is left only with a stated reason.
4. A request against a MUST gets the conflict and an alternative, never silent obedience.
5. A rule is placed by `placement`. A case no rule covers follows the nearest rule, and of two choices the one that raises cohesion and lowers coupling wins; a real gap is amended or becomes a block of the project's own pack, never a habit.
6. A dependency with no block follows the project's domain and language blocks; report each MUST it cannot meet, and propose its block as 5 says.

## Precedence

1. An override in `constitution.yaml` names one rule, core's included, and either lowers it from MUST to SHOULD or sets it to `MAY`, a level an override alone may name, which the rule then only advises; the rules that tighten it keep their levels. It is written only with a person's consent and its reason, and goes with the change that ends it.
2. Otherwise two active rules never contradict: a rule tightens only a rule within its reach, by its `→`, and never loosens it. A clash between two rules, whatever their blocks' ranks, a platform's and a language's included, is a defect: it is reported and fixed by narrowing one of them or by a seam, and until then the rule naming the narrower case holds.

## Its chapters

Read in order:

- `@foundation/`: [placement](@foundation/placement.md), [code](@foundation/code.md), [names](@foundation/names.md), [functions](@foundation/functions.md), [relations](@foundation/relations.md), [types](@foundation/types.md), [data](@foundation/data.md), [errors](@foundation/errors.md), [effects](@foundation/effects.md), [security](@foundation/security.md), [dependencies](@foundation/dependencies.md), [tools](@foundation/tools.md), [changes](@foundation/changes.md), [layout](@foundation/layout.md), [comments](@foundation/comments.md), [accessibility](@foundation/accessibility.md), [tests](@foundation/tests.md), [agents](@foundation/agents.md).
- `@architecture/`: [layout](@architecture/layout.md), [domain](@architecture/domain.md), [application](@architecture/application.md), [ports](@architecture/ports.md), [composition](@architecture/composition.md), [presentation](@architecture/presentation.md), [root](@architecture/root.md), [layers](@architecture/layers.md), [tests](@architecture/tests.md).
- `@workflow/`: [changes](@workflow/changes.md), [agents](@workflow/agents.md).

## The project's files

`constitution.yaml` sits at the root and in each package, each read alone: `axes`, the optional axes it follows; the blocks by rank; `packs`, the folders of blocks beside the Constitution's, its own among them; `overrides`. At the root also:

- `PROJECT.md`: the product and its users, subdomains by class, entities, boundaries, critical scenarios and glossary.
- `DECISIONS.md`: the strategic choices between real alternatives, such as a store, a framework, an architecture or a policy many changes follow, each as it now stands with what was rejected and why; never what the code, a rule's Why or a change's description already explains.

`constitution run check` runs the one check the blocks give.
