# Placement

> Governs where a rule goes — its rank, its axis, its file and its section — how it is worded, which level it takes, what it may refer to, which role words it may name, and where the settings that hold it go.

## Vocabulary

The **product** is what the project makes for its users, as `PROJECT.md` describes it, made of one program or several.

A **rank** is one of the Constitution's four tiers of blocks, ordered by which may name which: core; the domain blocks, which name no context block; the context blocks, platforms and languages sharing one rank, which may name a domain block; and the implementation blocks, which may name any. Each rank is more specific than those before it.

A **block** is one rank's unit of rules.

A block's **passport** is the file **`<name>.md`**{#passport} at its root, `<name>` being the last part of the block's id, which is its path among the blocks of its rank, such as `contracts/api/rest` or `client/browser`, a context's id leaving out its `platforms/` or `languages/` folder.

A block's **parent block** is the block whose folder holds it, the one parent it has, and its **child blocks** are the blocks its folder holds; a block **sits under** its parent block and under every block that one sits under, and wherever a block is active, every block it sits under is active too.

A block **requires** each block its passport's `requires` lists, and wherever a block is active, every block it requires is active too.

An **axis** is a folder of the block's chapters, one of **`@foundation/`**{#foundation-axis}, **`@architecture/`**{#architecture-axis} and **`@workflow/`**{#workflow-axis}; a folder at a block's root without the `@` is a child block.

A **seam** is a file **`<@axis>/with/<path>.md`**{#seam} of rules that need two blocks, `<path>` being the other block's id: a derivative module, which applies only while both blocks are active.

A **reserved word**{#reserved-word} is `with` or an axis's name without its `@`: `foundation`, `architecture` or `workflow`.

A chapter opens with its **`Governs`**{#governs-line} line, and its sections may include **`Vocabulary`**{#vocabulary-section} and **`General`**{#general-section}.

A **term id** `{#id}` names a term where it is defined, and a block respells the term under it.

A rule's **statement** is its **slogan**, its first and shortest true sentence, the one a reader remembers, as a heading would carry it, and the sentences under it, up to its Why.

A **setting** is one named value of the configuration a program or a tool reads.

A **preset** is a tool's file of settings a block ships.

A part of a rule is an **obligation** of its own when what the rule governs can break that part while it meets everything else in the rule.

A rule's **checkable outcome** is a property of the code, the tree or the work that a reviewer or a tool can check.

## Rank

### rule-placed-in-the-rank-whose-loss-voids-it · MUST

Every rule sits in the rank whose loss voids it. Nothing voids it: core. An aspect a product may lack — a user interface, an API, a store of its own: that domain's block. A platform or a language, its own specification included: that context's block. A library, a tool or a vendor's service the project installs, runs or reaches: its block. Core speaks of what every project it binds has, and of what code of any kind may meet without the project taking anything on: a `@foundation/` rule of what every project has, such as a command-line tool, a library, a static site, a backend, a mobile app or a data script, or of a kind of value or work any code may hold, such as a time, an exact quantity, an identity, a secret, a cryptographic key, a part the user can do without, input from outside, work run concurrently or repeated, or the run and the stop of a program; an `@architecture/` or `@workflow/` rule of what every project on its axis has, or of the model of a pattern any of them may build, as domain-driven design's are, an event among them. A subject a project takes on by choice, such as a store of its own, a connection across a network, the logs it keeps for its operators, a setting read from its environment, texts kept apart for translation or a format it declares to others as a contract, belongs to the block of its domain, an existing one or a new one, even where a rule scoped to it would demand nothing of a project without it; a protocol, or a specification of what programs exchange, belongs to the block of the domain it serves. A rule whose obligation binds a kind of value or work any code may meet stays in core, even where its usual case is a subject taken on by choice, and one whose obligation exists only because of that subject goes to that subject's block.

| Why |
|---|
| a rule above its rank binds projects that lack its subject, and a core rule on a subject a project opts into, such as a store or a network, is read and weighed by every project that never took it on, so core fills with what most of its readers never meet, while a rule on what any code may meet, such as a time or a secret, moved into a domain is missed by every project that meets it without turning that domain on, and a rule below its rank is missed by projects that have the subject but not the library. |

### core-names-no-ecosystem · MUST

Core names no language, tool, library, product, vendor or version. Exempt: an open standard, a law or a standards body, such as NIST or OWASP; the Constitution's own files, which its chapters may name; and the Constitution's own tool, which its passport may name.

| Why |
|---|
| core binds every project, so a language or a tool it names binds the rest to one house's stack, and the next stack it meets finds rules written for another. |

### core-fixes-incidental-detail-only-as-a-default · MUST

Core fixes an incidental detail only as a default under a term id. An incidental detail is one a language, a tool or a framework in common use spells or chooses otherwise, such as a folder, a suffix, a file's name, a case or the word of a kind of name. A block respells the default under that id, or by a rule that tightens the one naming it, and for a language that has no block, a block of the project's own pack does. Any other such detail, such as the template of a name or an option of a tool, sits in the block that owns it, or nowhere. Exempt: a measure a rule sets, such as a limit, a width or a duration, which is the rule's own content, a block tightening it and never loosening it.

| Why |
|---|
| a detail only some ecosystems choose binds the rest to one house's style unless a block can respell it, and a name that matters to a tool is the tool's block to give. |

### role-word-taken-from-its-source · MUST

Every role word and collection suffix a block names comes from its source: the language, the framework or the tool that fixes the unit's form, the book that names the role, or a word common across several ecosystems. No block coins one; where no source gives a word, the folder alone marks the role.

| Why |
|---|
| a word a block coins is one no tool, framework or newcomer knows, so it costs every project that turns the block on a rule to learn and a check to keep. |

## Axis

### rule-placed-on-the-axis-its-readers-share · MUST

Every rule sits on the axis its readers share. It sits in `@architecture/` or `@workflow/` when a team with another architecture or another workflow would not want it, and always when it needs a term of that axis's vocabulary, such as a feature or a use case, or a review. Every other rule sits in `@foundation/`, which every project follows, and a rule that needs two axes is split, one rule on each.

| Why |
|---|
| a project leaves out an axis it does not share, so a rule on the wrong axis is lost to a project that needs it or binds one that left its subject out. |

## Files

### block-root-holds-its-passport-beside-its-axes · MUST

Every block's root holds its passport and, beside it, its axes and its child blocks, and nothing else. No part of a block's id is a reserved word.

| Why |
|---|
| a block laid out its own way is learned before it is read, and a tool that looks for a block's parts where the layout puts them misses the ones put elsewhere; a block named by a reserved word is read as an axis or a seam by every path that drops the `@` or splits at `with`. |

### passport-holds-no-rule · MUST

Every passport holds only what introduces its block, never a rule. A block's passport holds only its front matter, its title, one line of what the block is and its setup. Exempt: core's passport, which holds the Constitution's preamble, how to use it, its precedence, the list of its chapters and the project's files.

| Why |
|---|
| a rule in the passport is missed by every reader and tool that looks for rules in the axes. |

### passport-requires-only-what-its-block-needs · MUST

Every passport's `requires` lists only the blocks its block cannot work without, beyond the blocks it sits under. Such a block is one whose rules its rules tighten or name, or whose terms they use, or one its tool runs on or is run by. The format of its tool's own settings file is never such a block, nor a subject its block has by its own definitions. Exempt: a listed block whose subject every project of the passport's block has by the passport's block's own definitions, as every program that sends webhooks or calls a vendor's service opens connections across a network, and every program that applies a state its user declares reads the file its user declares it in.

| Why |
|---|
| a block required for nothing its block needs turns on, in every project that lists it, rules the project never chose, as the rules of a settings file's format would, and the reader of the passport cannot tell what the block builds on. |

### rule-placed-in-the-chapter-named-for-it · MUST

Every rule sits in the chapter named for what it governs. The chapter is one file of its axis with one subject, named for that subject, never the block's id nor a catch-all name such as `misc`; core's `code` holds only what no other chapter of core governs.

| Why |
|---|
| a reader finds a rule by its subject, and a file that mixes subjects hides the rules a change needs. |

### context-chapters-follow-cores · SHOULD

Every language or platform names its chapters after core's on the same axis. Exempt: a subject no core chapter names, which takes a short name of its own.

| Why |
|---|
| a context chapter named its own way for a subject core names makes its reader learn a second map of the same subjects, and the core chapter's reader never opens it. |

### rule-sits-in-a-section-of-its-file · MUST

Every chapter or seam opens with its title and its `Governs` line, and everything after them sits in a section. No text stands between the `Governs` line and the first section.

| Why |
|---|
| text outside every section is read by no tool that looks for definitions or rules by their section, and is missed by the reader who skips to the section they need. |

### sections-run-in-one-order · MUST

Every chapter's or seam's sections run in one order: a `Vocabulary` section exactly where the file has a term that belongs in one, then `General`, where some rules are about the whole subject, then one section for each part of it, none named like the title.

| Why |
|---|
| a file laid out its own way must be learned before it is read, and a definition placed after the rules that use it is missed by the reader who looks for terms first. |

### vocabulary-holds-only-definitions · MUST

Every `Vocabulary` section holds only the file's definitions, never a rule or an obligation.

| Why |
|---|
| an obligation placed among definitions is missed by every reader and tool that looks for rules in the sections of rules, and no override can name it. |

### section-holds-a-rule · MUST

Every chapter or seam holds at least one rule, and so does each of its sections but the `Vocabulary`.

| Why |
|---|
| an empty file or section tells its readers and tools that rules sit there, and each searches it for nothing. |

## Seams

### rule-placed-in-a-seam-only-when-it-needs-both-blocks · MUST

Every rule sits in a seam only when it loses its meaning without either block. One that keeps its meaning without one of them sits in the other.

| Why |
|---|
| a rule one block alone gives meaning to is missed by every project that has that block without the other, while a rule of two blocks filed in one of them binds projects that lack the other — derivative modules of feature-oriented software (Kästner, Apel and others, SPLC 2009). |

### rule-tightening-a-third-block-sits-in-a-seam-with-it · MUST

Every rule of a seam that tightens a third block's rule sits in a seam with that block. A third block is one beyond what the holder and the seam's other block require or sit under.

| Why |
|---|
| a rule filed in a seam that lacks a block it tightens applies where that block is absent, and tightens nothing there. |

### seam-never-pairs-with-core-or-a-related-block · MUST

Every seam pairs a block only with an unrelated one, never with core. An unrelated block is one the holder neither requires nor sits under and that neither requires the holder nor sits under it, each directly or through another.

| Why |
|---|
| a block already tightens what it requires or sits under with its own rules, and a block that requires or sits under the holder holds the rules that need them both, so such a seam splits one block's rules over two files. |

### seam-held-by-the-block-whose-behaviour-it-constrains · MUST

Every seam between two blocks of one rank is held by the block whose behaviour it constrains. Its rules govern how the holder behaves while the other block is active, so the units that meet them are the holder's, such as a control every screen offers or what a test runner loads before the specs.

| Why |
|---|
| a seam held by the other block hides from the holder's reader a way the holder changes when that block joins it. |

### rule-beside-a-more-specific-block-is-its · MUST

Every rule about a general block that holds only beside a more specific one is the specific block's. A block is more specific than another when it requires it or sits under it, core counting as required by every block, or when it is of a more specific rank. The rule sits in a chapter of that block when the block requires the general one or sits under it, else in its seam with it, so every seam between blocks of two ranks is held by the block of the more specific rank.

| Why |
|---|
| a rule filed with the general block binds every project that has that block, though it holds only where the specific one joins it. |

## Wording

### rule-opens-with-its-slogan · SHOULD

Every rule opens with its slogan, a sentence of at most 22 words, which alone states the rule's core. The sentences after it narrow it and never contradict it.

| Why |
|---|
| a rule whose first sentence carries its lists and exceptions is misremembered by the reader who stops there, and a later sentence that contradicts the slogan is lost on that reader — the inverted pyramid. |

### slug-names-what-its-rule-adds · MUST

Every rule that tightens another names in its slug what it adds to its parent, never a synonym of a sibling's word. A sibling is another rule that tightens the same parent, in any block. What it adds is most often its block's own form, such as a construct, an interface or a unit, as a rule naming one language's keyword and one naming another's decorator each name theirs. Where two blocks add a form one word names, the slug says whose form it is, never where the rule sits: a word for its block's subject, such as a language or a format, says whose form it is, and one for its chapter, its file or its seam says where it sits.

| Why |
|---|
| a slug that differs from its sibling's by a synonym alone hides that two blocks carry out one parent and leaves its reader to guess what the second word adds, a slug that names where its rule sits turns false the day the rule moves, and a rule that adds nothing its slug can name repeats its parent — intention-revealing names. |

### statement-runs-from-its-scope-to-its-exceptions · SHOULD

Every statement runs in one order: its scope or condition first where it has one, then its subject and obligation with the prohibition of the contrary, then its limits, and its exceptions last. The exceptions sit in one last sentence, opened by the word Exempt and a colon, and no other sentence carries one.

| Why |
|---|
| an exception met before the rule is taken for the rule itself, a slogan that opens with what not to do is followed less reliably by people and language models alike, and exceptions spread over the sentences are not found in one place — the EARS templates and the exceptions SEI CERT lists after a rule. |

### slogan-scoped-by-every-each-or-all · SHOULD

Every slogan states its scope by every, each or all where its rule means all its subjects, never by an article.

| Why |
|---|
| a slogan that leaves its scope to an article is read by one reader as all its subjects and by another as some, so the rule binds each of them differently. |

### rule-worded-without-emphasis · SHOULD

Every MUST is worded as plainly as a SHOULD, with no emphasis.

| Why |
|---|
| emphasis makes a language model apply the stressed rule wider than its text says and weigh the plain rules less, so the scope each rule states no longer decides where it binds — the model vendors' prompting guidance. |

### rule-holds-one-obligation · SHOULD

Every rule holds one obligation, whole. A part that is an obligation of its own becomes a rule of its own under a new slug, with every qualifier that limits it, the old slug staying with the part that keeps its meaning, and two rules whose parts can only be broken together are joined under the older slug; the level-set-by-the-cost-of-a-breach rule gives the level of each. Every other part is a qualifier of the obligation, of a closed list: the obligation's scope (where, when, for whom), a list of subjects under one verb, its exceptions, the forms its checkable outcome may take, the prohibition of the contrary action and one threshold.

| Why |
|---|
| a rule that bundles obligations is half remembered and half checked, and an override that lowers it lowers both, while one obligation spread over two rules is lowered in one and kept in the other — the singular requirement. |

### obligation-stated-in-one-rule · SHOULD

Every obligation is stated in one rule of the Constitution. A rule of another chapter or block that needs it refers to that rule or tightens it with `→`, never states it again. Exempt: a qualifier, such as a scope or an exception, which every rule it limits states.

| Why |
|---|
| an obligation stated in two rules drifts apart in their wording and their levels, gives its reader two answers and takes two overrides to lower — a single source of truth. |

### rule-read-alone · SHOULD

Every rule that tightens no other is read alone: its scope, its exceptions and the meaning of its terms stand in its own text, in a vocabulary or in a rule it names.

| Why |
|---|
| a rule is delivered, overridden and checked by its slug alone, so a scope or an exception left in the rule it was split from never reaches its reader, who applies it wider or narrower than it is — a complete requirement (ISO/IEC/IEEE 29148). |

### rule-states-its-direction-within-limits · SHOULD

Every rule's statement gives the direction and the limits a reviewer checks, never every case. It names its examples as "such as" and lists a set whole only where the rule depends on the whole set.

| Why |
|---|
| a rule that lists every case reads as closed and is broken by the first case it missed, and one that gives no limits cannot be checked. |

### example-paired-across-domains · SHOULD

Every example a rule takes from one domain comes with one from another, or gives way to a neutral one.

| Why |
|---|
| an example from one domain reads as the rule's scope, so a reader in another domain takes the rule for someone else's. |

### rule-term-defined-in-a-vocabulary · MUST

Every term is defined where its uses place it: a term that two or more rules, a definition or another chapter use, a block's among them, in a vocabulary and never inside a rule; a term only one rule needs, in that rule's statement and never in a vocabulary. Exempt: the spelling of a term with a term id, which a vocabulary holds wherever the term's meaning is defined.

| Why |
|---|
| a term defined inside one rule is missed by the reader of every other rule that uses it, and is soon defined again, differently, while a vocabulary that also holds what one rule alone needs buries the shared terms among definitions no other rule reads. |

### rule-states-an-outcome · SHOULD

Every rule states the checkable outcome it asks for, never the technique that reaches it. A technique is a means that reaches a checkable outcome. Exempt: a technique other code relies on, and the named forms the checkable outcome may take.

| Why |
|---|
| a technique written into a rule binds every project to one means and outlives the reason it was chosen, while the outcome it served goes unchecked — specify the what, not the how. |

### why-names-the-failure-it-prevents · SHOULD

Every rule's Why names the failure the rule prevents: what breaks, for whom, when the rule is broken.

| Why |
|---|
| a Why that states only a benefit gives a reader nothing to weigh when breaking the rule looks cheap. |

### why-closes-on-an-established-reference · SHOULD

Every Why that rests on an established principle, pattern or reference closes on it after one dash, several joined by "and". A Why that rests on none has no dash, and none is invented. Every aside in a Why is set off by commas or parentheses, never by a dash.

| Why |
|---|
| a closing found by its dash is misread where an aside also opens with one, and a principle named where the rule does not apply it, or invented for it, sends the reader to argue with the wrong body of practice. |

## Level

### level-set-by-the-cost-of-a-breach · MUST

Every rule takes the level the cost of its breach sets. It is a MUST when a breach risks a defect, an unsafe state or a broken interoperation with another program, a format, a contract or a tool that reads the code, and a reviewer or a tool can tell a breach from compliance. It is a SHOULD when a breach only makes the code harder to read or to change, while the program still works as intended.

| Why |
|---|
| levels chosen by each author's judgement are argued rule by rule, and one block's MUST is another's SHOULD for the same cost of a breach — RFC 2119 and the distinction SEI CERT draws between a rule and a recommendation. |

## References

### rule-refers-only-within-its-reach · MUST

Every rule refers only to rules and terms within its reach. It tightens only a rule of core, of a block its own requires or sits under or, in a seam, of the seam's other block or a block that one requires or sits under, each directly or through another. It never tightens a rule of its own block, which for a seam's rule is its holder, the holder's other seams included, and for a core rule is core, though it may name such a rule. It names a rule or uses a term only of its own block, of core or of those blocks.

| Why |
|---|
| a rule that reaches a block its own does not follow binds a project to that block, and one that tightens its own block's rules tightens what the block already says. |

### rule-refers-only-to-the-axes-it-stands-on · MUST

Every rule tightens or carries out only a rule of its own axis or of one its axis stands on. A `@foundation/` rule tightens or carries out only a `@foundation/` rule, and an `@architecture/` or `@workflow/` rule one of its own axis or of `@foundation/`.

| Why |
|---|
| a rule between the optional axes breaks when a project leaves either out, and a foundation rule that serves another axis binds a project that left that axis out. |

## Presets

### setting-sits-in-its-readers-preset · MUST

Every setting sits in the preset of the tool that reads it, of the axis of the rule it holds. A line of a file that only agents, as the agents chapter defines them, read, and no block's tool, sits as a setting whose reader is core.

| Why |
|---|
| a setting filed apart from its reader is not found where the reader's configuration is computed, and stays behind when its last block leaves. |

### setting-keyed-by-its-rule · MUST

Every setting is keyed by the rule it holds. One the tool needs where no rule asks for it is keyed by `*`.

| Why |
|---|
| a setting filed under no rule is not found by its rule and survives the override that lowers it, so it holds a rule nobody keeps. |

### setting-path-names-the-blocks-it-needs · MUST

Every setting that needs a block beyond its tool's reach sits in the tool's `with/` file of that block. One that needs a second block sits in that file's `with/` file of the second, so its path names exactly the blocks it needs.

| Why |
|---|
| a setting filed short of a block it needs applies where that block is absent, and one filed beyond them is lost where they are present. |

### setting-names-folders-by-their-terms · MUST

Every setting names a folder or a suffix that a term names, by that term's id, never by its spelling. It does so in whatever form it writes it, such as a path, a pattern or a module's dotted name, and the presets substitute the spelling of the most specific block its language reaches.

| Why |
|---|
| a setting that spells a folder itself goes on checking a path that no longer exists once the folder's term is respelled, and a language's spelling written into each setting is copied wherever it is named. |

### setting-spells-a-named-file-or-word-itself · MUST

Every setting spells itself a file or a word of a name that a term names. The presets substitute only a folder's or a suffix's id, so a block that respells such a term, such as an entry file or a surface, respells it in its settings too.

| Why |
|---|
| a setting left with a spelling its block respelled checks a file or a name the project no longer has. |
