# Placement

> Governs where a rule goes — its layer, its axis, its file and its section — and what it may refer to.

## Layer

### rule-placed-in-the-layer-whose-loss-voids-it · MUST

A rule sits in the layer of what must disappear for it to lose its meaning: nothing, core; an aspect a product may lack — a user interface, an API, a network — that domain; a platform or a language, that context; a library, a tool or a vendor's service the project installs, runs or reaches, its block. A protocol, or a specification of what programs exchange — OpenAPI, OAuth, Standard Webhooks — belongs to the domain it serves; a language's own specification is its context.

| Why | Tags |
|---|---|
| a rule above its layer binds projects that lack its subject, and one below it is missed by projects that have the subject but not the library. | [] |

### language-earns-a-block-with-three-rules · SHOULD

A language has a block of its own once three rules lose their meaning without it and are no tool's rules; until then they wait in a block of the project's own pack.

| Why | Tags |
|---|---|
| a block of one or two rules costs every reader a layer of reading for little. | [] |

## Axis

### rule-placed-on-the-axis-its-readers-share · MUST

A rule sits in `architecture/` when a team with another architecture would not want it — layers and the direction of dependencies, ports and adapters, the homes of input, output and state, the wiring, the isolation of parts, the tree; in `workflow/` when a team with another workflow would not want it — how a change travels from the idea to the release: its branch, commit, review, gates and hooks, merge, release and updates, and who submits, commits and ships it; otherwise in `foundation/`, which every project follows. A rule that bundles two axes is split, one rule on each, and a rule that carries out a rule sits on that rule's axis or one that stands on it.

| Why | Tags |
|---|---|
| a project leaves out an axis it does not share, and must lose nothing it needs with it. | [] |

## Files

### block-root-holds-its-passport-and-axes · MUST

A block's root holds its passport `<id>.md` — its front matter, its title, one line of what the block is, its setup and, for an implementation, its Requirements; core's in their place the Constitution's preamble and the list of its chapters — and its axes; an axis is a folder of chapters and `with/` seams, there only when it holds one, and no rule sits in the passport.

| Why | Tags |
|---|---|
| every block reads the same: what it is in one file, its rules by axis in the others. | [] |

### rule-placed-in-the-chapter-named-for-it · MUST

A rule sits in the chapter of its axis named for what its statement governs: one file, one subject, named in its block's own terms, save a language's or a platform's, which follow core's — never the block's id nor a name that says nothing, such as `general` or `misc`; core's `code` holds only what no other chapter of core governs.

| Why | Tags |
|---|---|
| a reader finds a rule by its subject, and a file that mixes subjects hides the rules a change needs. | [] |

### context-chapters-follow-cores · MUST

A language or a platform names its chapters after core's chapters on the same axis, and a rule of it that tightens a rule of core sits in the chapter named like its parent's; a subject no core chapter names, such as CSS's cascade, takes a short name of its own.

| Why | Tags |
|---|---|
| a reader of a core chapter finds each language's and platform's refinement of it under the same name. | [] |

### rule-sits-in-a-section-of-its-file · MUST

A chapter and a seam open with their title and a `Governs` line, hold at least one rule, and every rule of them sits in a section: `General`, when some rules are about the whole subject, first, then one for each part of it, none named like the title, and `Requirements for implementation` last.

| Why | Tags |
|---|---|
| a reader sees the parts of a subject before its rules, and every file reads the same. | [] |

## Seams

### rule-placed-in-a-seam-only-when-it-needs-both-blocks · MUST

A rule sits in a seam, `<axis>/with/<block>.md`, only when it loses its meaning without either of its two blocks: one that keeps its meaning without one of them sits in the other, and one that tightens a rule of a third block, beyond what the holder requires or extends, sits in a seam with that block. A seam never pairs a block with core, nor with a block it requires or extends, directly or through another.

| Why | Tags |
|---|---|
| a rule that one block alone gives meaning to is missed by every project that has that block without the other, and a block already tightens what it requires or extends with its own rules. | [] |

### seam-held-by-the-block-whose-behaviour-it-constrains · MUST

A seam's rules govern how the block that holds it behaves while the other block is active — what a hook runs sits in the hook's block, what a runner loads before the specs in the runner's — and the other block is of the holder's layer or a more general one: a rule about a general block that holds only beside a more specific one is the specific block's, in a chapter of it when it requires the general block, else in its seam with it.

| Why | Tags |
|---|---|
| a block shows every way it changes when another joins it, and two blocks of one layer need no third rule to share their seam. | [] |

## References

### rule-refers-only-within-its-reach · MUST

A rule never refers to a rule of its own block. It may tighten a rule of core, of a block it requires or extends, or of the other block of its seam, an `<axis>/with/<block>.md` file: one in `foundation/` only a `foundation/` rule, one in `architecture/` an `architecture/` or `foundation/` rule, one in `workflow/` a `workflow/` or `foundation/` rule.

| Why | Tags |
|---|---|
| a rule that reaches a block its own does not follow binds a project to that block, and one between the optional axes breaks when a project leaves either out. | [] |
