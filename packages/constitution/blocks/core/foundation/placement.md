# Placement

> Governs where a rule goes — its layer, its axis, its file and its section — how it is worded, what it may refer to, and where the settings that hold it go.

## Layer

### rule-placed-in-the-layer-whose-loss-voids-it · MUST

A rule sits in the layer whose loss voids it. That is the layer of what must disappear for the rule to lose its meaning: nothing, core; an aspect a product may lack — a user interface, an API, a store of its own — that domain; a platform or a language, that context; a library, a tool or a vendor's service the project installs, runs or reaches, its block. A concern every program that has it meets alike, which no domain owns — a connection across a network, a key agreement — sits in core, as a rule that applies where the concern is present. A protocol, or a specification of what programs exchange — OpenAPI, OAuth, Standard Webhooks — belongs to the domain it serves; a language's own specification is its context.

| Why |
|---|
| a rule above its layer binds projects that lack its subject, and one below it is missed by projects that have the subject but not the library. |

### language-earns-a-block-with-three-rules · SHOULD

A language earns a block of its own with three rules. They are three rules that lose their meaning without it and are no tool's rules; until then they wait in a block of the project's own pack.

| Why |
|---|
| a block of one or two rules costs every reader a layer of reading for little. |

### core-fixes-incidental-detail-only-as-a-default · MUST

Core fixes an incidental detail only as a default a block respells. An incidental detail is one that a language, a tool or a framework in common use spells or chooses otherwise, whether or not it has a block here. A default is a folder, a suffix or a file core names — under a term id wherever a tool's settings reach it —, or the word of a kind of name a rule of core gives, which a language's or a tool's block respells under the same id or by the same rule. Any other such detail — the name of a file or a function inside a folder, the template of a name, an option of a tool — sits in the block of the language or the tool that owns it, or nowhere. A measure a rule sets — a limit, a width, a count, a duration — is no incidental detail but the rule's own content, which a block may tighten and never loosen.

| Why |
|---|
| core binds every project, so a detail only some languages, tools or teams would choose binds the rest to one house's style unless a block can respell it, and a name that matters to a tool is the tool's block to give. |

## Axis

### rule-placed-on-the-axis-its-readers-share · MUST

A rule sits on the axis its readers share. It sits in `architecture/` when a team with another architecture would not want it: layers and the direction of dependencies, the seams to outside systems, the homes of input, output and state, the assembly, the isolation of parts, the tree. It sits in `workflow/` when a team with another workflow would not want it: how a change travels from the idea to the release — its branch, commit, review, gates and hooks, merge, release and updates — and who submits, commits and ships it. Otherwise it sits in `foundation/`, which every project follows. A rule that bundles two axes is split, one rule on each, and a rule that carries out a rule sits on that rule's axis or one that stands on it.

| Why |
|---|
| a project leaves out an axis it does not share, so a rule on the wrong axis is lost to a project that needs it, or binds one that left its subject out. |

## Files

### block-root-holds-its-passport-and-axes · MUST

A block's root holds its passport and its axes, and no rule sits in the passport. The passport `<id>.md` holds its front matter, its title, one line of what the block is, its setup and, for an implementation, its Requirements; core's holds in their place the Constitution's preamble and the list of its chapters. An axis is a folder of chapters and `with/` seams, there only when it holds one.

| Why |
|---|
| a block laid out its own way must be learned before it is read, and a rule in the passport is missed by every reader and tool that looks for rules in the axes. |

### rule-placed-in-the-chapter-named-for-it · MUST

A rule sits in the chapter named for what it governs. The chapter is one file of its axis with one subject, named for that subject — never the block's id nor a name that says nothing, such as `general` or `misc`; core's `code` holds only what no other chapter of core governs.

| Why |
|---|
| a reader finds a rule by its subject, and a file that mixes subjects hides the rules a change needs. |

### context-chapters-follow-cores · MUST

A language or a platform names its chapters after core's. It takes the names of core's chapters on the same axis, and a rule of it that tightens a rule of core sits in the chapter named like its parent's; a subject no core chapter names, such as CSS's cascade, takes a short name of its own.

| Why |
|---|
| a refinement filed under another name is missed by the reader of the core chapter it refines. |

### rule-sits-in-a-section-of-its-file · MUST

A chapter or a seam opens with its title and a `Governs` line, and every rule of it sits in a section. It holds at least one rule, and its sections are `General`, when some rules are about the whole subject, first, then one for each part of it, none named like the title, and `Requirements for implementation` last.

| Why |
|---|
| a file with no sections shows its rules before the parts of its subject, and files laid out each their own way must each be learned before they are read. |

## Seams

### rule-placed-in-a-seam-only-when-it-needs-both-blocks · MUST

A rule sits in a seam only when it needs both of its blocks. A seam is `<axis>/with/<block>.md`, and a rule needs both when it loses its meaning without either: one that keeps its meaning without one of them sits in the other, and one that tightens a rule of a third block, beyond what the holder requires or extends, sits in a seam with that block. A seam never pairs a block with core, nor with a block it requires or extends, directly or through another.

| Why |
|---|
| a rule that one block alone gives meaning to is missed by every project that has that block without the other, and a block already tightens what it requires or extends with its own rules. |

### seam-held-by-the-block-whose-behaviour-it-constrains · MUST

A seam is held by the block whose behaviour it constrains. Its rules govern how the holder behaves while the other block is active: what a hook runs sits in the hook's block, what a runner loads before the specs in the runner's. The other block is of the holder's layer or a more general one: a rule about a general block that holds only beside a more specific one is the specific block's, in a chapter of it when it requires the general block, else in its seam with it.

| Why |
|---|
| a seam held by the other block hides from the holder's reader a way the holder changes when that block joins it, and two blocks of one layer need no third rule to share their seam. |

## Wording

### rule-opens-with-its-slogan · MUST

A rule opens with its slogan: its shortest true statement, the one a reader remembers, as a heading would carry it. The sentences after it draw the slogan's limits — where it applies, what it covers, its exceptions — and narrow it, never contradict it.

| Why |
|---|
| a rule whose first sentence carries its lists and exceptions is misremembered by the reader who stops there, and an exception met before the rule is taken for the rule itself — the inverted pyramid. |

### rule-states-an-outcome · MUST

A rule states the outcome it asks for, never the technique that reaches it. The outcome is a property of the code, the tree or the work that a reviewer or a tool can check; a technique is named only where other code relies on it.

| Why |
|---|
| a technique written into a rule binds every project to one means and outlives the reason it was chosen, while the outcome it served goes unchecked — specify the what, not the how. |

### why-names-the-failure-it-prevents · MUST

A rule's Why names the failure the rule prevents, and closes only on a principle, a pattern or a reference the rule applies or follows. The failure is what breaks, for whom, when the rule is broken. Its closing part, after a dash, names the established principle or pattern the rule applies, such as the single-responsibility principle, the law of Demeter, parse, don't validate, Humble Object or the expand–contract pattern. Where the rule follows a standard or a methodology, the closing names it as its reference, such as an RFC, a WCAG 2.2 criterion, the twelve-factor app or a specification of version numbers. A rule that applies one and follows another, or follows several references, closes on each its obligation rests on, joined by "and". It names none where the rule applies or follows none, and never an invented one, and its dash is the Why's only one: an aside inside the failure is set off by commas or parentheses. A law that makes the rule an obligation is named inside the failure, never in the closing part. The Why cites no person or book, and an established name is no citation, even where it contains a person's name.

| Why |
|---|
| a Why that states only a benefit gives a reader nothing to weigh when breaking the rule looks cheap, and a closing found by its dash is misread where an aside also opens with one. A principle, a pattern or a reference named where the rule does not apply or follow it, or invented for it, sends the reader to argue with the wrong body of practice, and a law named as a reference reads as a choice the project may weigh, where it is an obligation it must meet. |

## References

### rule-refers-only-within-its-reach · MUST

A rule refers only to rules within its reach. It never refers to a rule of its own block, and it may tighten a rule of core, of a block it requires or extends, or of the other block of its seam, an `<axis>/with/<block>.md` file: one in `foundation/` only a `foundation/` rule, one in `architecture/` an `architecture/` or `foundation/` rule, one in `workflow/` a `workflow/` or `foundation/` rule.

| Why |
|---|
| a rule that reaches a block its own does not follow binds a project to that block, and one between the optional axes breaks when a project leaves either out. |

## Presets

### setting-placed-by-its-reader-and-key-rule · MUST

A setting or a plugin sits with the tool that reads it, under the rule it holds. A setting sits in that tool's preset file of the axis of the rule it holds, keyed by that rule, or by `*` when the tool needs it and no rule asks for it. One that needs a block beyond the tool's reach sits in the tool's `with/` file of that block, and one that needs a second block in that file's `with/` file of the second, so its path names exactly the blocks it needs. A plugin of a tool sits in the tool's `plugins/` folder of its language, named by the rule it holds. The entry of a file that agents read and no block's tool reads sits as a setting does, with core as its reader.

| Why |
|---|
| a setting filed elsewhere or under no rule is not found by its rule, stays behind when its last block leaves, and survives the override that lowers its rule, so it holds a rule nobody keeps; a plugin filed apart from its rule is not found by the reader of that rule. |

### setting-names-folders-by-their-terms · MUST

A setting names a folder or a suffix by its term's id, never by its spelling. This holds in whatever form the setting writes it — a path, a pattern or a module's dotted name. A block that spells a term of a block it builds on its own way defines its spelling under the same id, and a setting takes the spelling of the most specific block its language reaches. The presets substitute only a folder's or a suffix's id, so a file a term names — an entry, a surface — and a word of a name — a data port's — are spelled by a setting, whatever id they carry, and a block that respells one respells it in its settings too.

| Why |
|---|
| a setting that spells a folder itself is missed when the folder is renamed in its term, so the tool goes on checking a path that no longer exists, and a language's spelling written into each setting is copied wherever they name it. |
