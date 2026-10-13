# Placement

> Governs where a rule goes: its layer, its axis and its chapter.

Three questions, asked apart, place a rule.

Its layer: what must disappear for it to lose its meaning? Nothing: core. An aspect a product may lack — a user interface, an API, a network: that domain. A runtime or a language: that context. A library or a tool: its block.

Its axis: who would still want it? Not a team with another architecture: `architecture/` — layers and the direction of dependencies, ports and adapters, the homes of input, output and state, the wiring, the isolation of parts, the tree. Not a team with another workflow: `workflow/` — how a change travels from the idea to the release — its branch, commit, review, gates and hooks, merge, release and updates — and who decides, records, submits and ships it. Any team: the base, at the block's root.

Its chapter: the one named for what its statement governs; `code` only when no other chapter does. Core's base has, in this order, `code`, `names`, `functions`, `relations`, `types`, `errors`, `effects`, `security`, `dependencies`, `tools`, `changes`, `layout`, `comments`, `tests` and `agents`; its architecture `layers`, `layout`, `ports`, `root`, `domain` and `tests`; its workflow `agents`. A language or a platform names its sections after these chapters on its axis, in this order, and a file of it that outgrows its 500 lines splits into chapter files named after them. A seam's sections follow the other block's chapters. A rule that tightens another sits in the section named like its parent's chapter, or in the section its parent sits in where the parent's block is a language or a platform. A subject no chapter names, such as CSS's cascade, follows the chapters. A language has a block of its own once three rules lose their meaning without it and are no tool's rules; until then they wait in the project's local block.

A rule never refers to a rule of its own block. It may tighten a rule of core, of a block it requires or extends, or of the other block of its seam, a `with/<block>.md` file: the base only a base rule, `architecture/` an `architecture/` or base rule, `workflow/` a `workflow/` or base rule.
