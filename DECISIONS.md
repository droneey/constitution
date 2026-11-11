# Decision Log

> The strategic choices behind the Constitution: the structure of the rule set, the technologies and formats it adopts, its cross-cutting architecture and the policies many later changes follow. Each entry gives the decision as it stands, what was rejected and why.
>
> **What goes here.** A choice between real alternatives that a later reader would plausibly propose again, that shapes the system broadly, and whose rejected options the code and the rules cannot show. A rule's wording, level or place, a rule moved, split, merged or renamed, a term, an audit's fixes and a list of rules added do not: the pull request and the rule's Why record them.
>
> **How it changes.** An entry states the current decision. A later choice that changes it rewrites the entry and its date, and the pull request keeps the history; a new entry is a new decision. The numbers were reset on 2026-11-05; the table at the end gives the old numbers each entry replaces.

## ADR-0001 — One versioned whole, written for Claude Code

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The Constitution is released and pinned as one whole, and it is written for Claude Code alone.
- **Rejected.** Versions per block, which multiply the combinations a project must reconcile; rules for other AI tools, which no project uses yet.
- **Why.** Neither has a consumer; either returns when one appears.

## ADR-0002 — Four ranks order what may tighten what, and a clash is a defect

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** Blocks sit in four ranks, from the most general down: core, true of every program; domains, an aspect a product has or lacks whatever its technology; contexts, where the code runs (platforms: browser, mobile, server, command line) or what it is written in (languages), both one rank; implementations, a framework, library, tool or vendor's service. A rule sits in the rank whose loss voids it. A block's rules govern the files its `governs` names: every file for core, a domain or a platform, its extensions for a language, and for a tool its own settings files, widened only where a rule would otherwise never load and no tool catches it; a parent block never names its children's files. A project chooses its domains and its contexts apart; the ranks order only what may tighten what: a more specific rank tightens a more general one, never loosens it, and never the reverse. Rules of one active set never conflict: a clash between two of them, of any ranks, is a defect to fix, by narrowing a rule or moving it to a seam, and no rank settles it; until it is fixed, the rule naming the narrower case holds, and the clash is reported. Only an override (ADR-0015) lowers a rule.
- **Rejected.**
  - Domains beside the contexts, orthogonal to them: a domain names no technology, so refinement runs one way, and beside it a rule needing both has no holder, domains start naming technologies and the `requires` check breaks or leaks (three devil's-advocate reviews, 2026-11-05).
  - The more specific rank winning a clash, and the rule naming the narrower case as the rule of precedence: a rule that wins by rank or by its narrower case for good silently loosens a general rule its author may never have read, and the defect stays hidden. The narrower case is only the interim answer, which holds while the clash is reported and until it is fixed.
  - A `web`, `fullstack` or `ssr` block: a browser program is `browser` plus its domains, and a block per pair of runtimes multiplies.
  - Globs per domain or platform, such as `**/root/**`: they tie a rule to a folder's name.
  - A tool's block governing every code file its tool reads: the general rules already reach those files through core and the languages, and the tool refuses a malformed form itself.
- **Why.** Each rank combines freely with the others and reduces to none of them, so a rule placed by what voids it binds exactly the projects that have its subject, and a defect in the rule set is fixed where it is found rather than resolved in silence.

## ADR-0003 — Blocks form a tree, and a block's folder is its one parent

**Date:** 2026-11-07 · **Status:** Accepted

- **Decision.** In every rank, a child block lives in its parent's folder, that folder is its one parent, and wherever a block is active every block above it is active too; branching is allowed, and a block with one rule is a block. `requires` lists only the blocks a block cannot work without beyond its folder: those whose rules its rules tighten or name, or whose terms they use, and those its tool runs on or is run by; the format of a tool's own settings file is never one. The project lists every block it follows, and the check warns of a required block it does not list; nothing activates a block behind its back but the folder above it. There is no `extends`, no abstract block and no `_` prefix: a base such as `contracts/api` is an ordinary block its children turn on.
- **Rejected.**
  - A flat set of blocks with abstract bases and `extends`: a project listed a base by hand or could not list it at all, and blocks that existed only to be required made the list a project reads differ from what it gets.
  - Coarser domains (11 in the rounds from zero) or a flat 17 to 21: one block held subjects most projects take only one of, or joined subjects a project takes apart, such as an API and the HTTP it rides.
  - Nesting only in the setup's questions: the check, the presets and a reader of `constitution.yaml` would still see a flat list.
  - One `requires` that turns blocks on, with flat folders: the family stays unseen, and a block requiring several has no one parent to read first.
  - An `activates` link by which a platform switched domains on.
  - A list of exceptions to `requires`, such as each tool requiring the language of its settings file: a rule that needs many exceptions is wrong, and a project that lists a tool may not want that language's block.
- **Why.** A folder is a parent a reader sees and a tool cannot get wrong, and one parent per block keeps the tree a tree — feature models of software product lines, where selecting a feature selects its parent.

## ADR-0004 — A block is a passport and `@` axis folders, named by its path

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** A block's root holds its passport `<name>.md`, its axis folders `@foundation/`, `@architecture/` and `@workflow/`, and its child blocks, a plain folder being a child. The passport holds the front matter, the title, one line of what the block is and its setup, never a rule. Every rule lives in a chapter of an axis, one file of one subject named in the block's own terms. A block's id is its path from its rank, `contracts/api/rest`, a context's leaving out its `platforms/` or `languages/` folder, in the passport, every `requires`, `constitution.yaml` and every seam's name. No part of an id is a reserved word: `with`, `plugins`, `foundation`, `architecture` or `workflow`.
- **Rejected.**
  - The base's rules at the block's root, or a required main chapter per axis: one axis laid out unlike the others, or files that hold only a title.
  - Plain axis folders beside child folders: an axis is told from a child only by a list of reserved names.
  - Short unique ids beside the tree (`rest-api`): two names for one block, and a child whose name does not say its parent.
  - Block ids free to use the reserved words: the site serves an axis without its `@`, so a child named `foundation` would share its address, a preset path that names a partner after `with/` could be split two ways, and a block named `plugins` would own the presets' shared plugins folder as its preset.
- **Why.** One form reads the same in every block, the digest, the presets and the site; a path is unique by construction and says where a block's parent and rules lie.

## ADR-0005 — Three axes: foundation, architecture and workflow

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** Every block lays its rules out on three axes: foundation, which every project follows, and architecture and workflow, which a project may leave out in `constitution.yaml`. Architecture is the structure of a system in the sense of Clean Architecture, DDD and hexagonal architecture; workflow is how a change travels from the idea to the release. A rule sits on one axis; a rule that bundles two is split. Across blocks an architecture or workflow rule may tighten a foundation rule, a foundation rule only a foundation rule, and the two optional axes never each other.
- **Rejected.** Two parallel trees above the ranks, which give a block two homes; a mark on each rule, which a hook cannot drop as a whole and which drifts; one architecture block that places every other block's rules, which names every library from above.
- **Why.** A team adopts the foundation as it adopts a tool's recommended preset, whatever its own architecture and process, and the axes make that choice one line; the literature separates craft, structure and process the same way.

## ADR-0006 — A seam holds what needs two blocks, in the block whose behaviour it governs

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** A rule that loses its meaning without either of two blocks lives in a seam, `@<axis>/with/<path of the other block>.md`, and applies only while both are active. A rule that keeps its meaning without one of them sits in the other. Between blocks of one rank the seam is held by the block whose behaviour it governs, so a pair may hold a seam on each side; between ranks, by the block of the more specific rank. A seam pairs a block only with an unrelated one: never core, nor a block it reaches through its folder or its `requires`, or that reaches it, whose rules join the more specific block's chapters. A seam's rule that tightens a third block's rule sits in a seam with that block.
- **Rejected.** Conditional sections inside a block's main file; a seam as a file of the pair outside both blocks, which loses which block adapts to which; a host, the block the other plugs into, as the holder of a pair of one rank, which is undefined between two domains or two contexts; a seam named by the other block's last name alone, which two blocks of one name would share.
- **Why.** A file per seam stays readable as seams multiply and its name says when it applies; the holder follows from the rule's statement, so no pair needs a rule of its own to say where its seam goes; rules that hold only while two features are present are a derivative module of the pair (Kästner, Apel and others, SPLC 2009).

## ADR-0007 — A rule is placed by what it means: rank, axis and chapter, judged by an agent

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** Three questions place a rule: its rank, by what must disappear for it to lose its meaning; its axis, by whether a team with another architecture or process would still want it; its chapter, the one named for what its statement governs. Core's chapters are named for what their rules govern, with no chapter of laws the others carry out. The meaning is judged by the plugin's `rule-reviewer` agent, which `/constitution:review` dispatches beside the reviewer on every change to blocks or presets, its findings routed as the reviewer's are; the check catches only what the words show, such as a term used out of its place.
- **Rejected.** Chapters by broad topic (`code`, `principles`, `anatomy`), whose rules fit two of them; a list of words per axis as the judge of placement; the agent inside the check, which must give the same answer on the same code.
- **Why.** When a rule's first words name its chapter, where it goes is answered by reading it and two rules about one thing meet in one file; a check of words catches a plain leak cheaply, while placement needs a reading of meaning.

## ADR-0008 — A rule is a slug, a level, a statement, a Why and its examples

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** A rule is a heading `### <slug> · <level>`, or `### <slug> → <rule> · <level>` when it tightens a rule of another block, never looser and always stating its own level; then its statement, opening with its whole rule, its exemptions last after `Exempt:`; then `#### Why`, prose that names the failure the rule prevents and may close with the principle or standard it follows; then, last, `#### Examples`, only fenced blocks, each with a title, `Avoid` and `Prefer` for a pair or one of its own for a tree or a diagram. Both sections are required on every rule. A slug is kebab-case, unique across the book, with no number and no prefix that only names its block. The gate and `constitution rules` hand a rule's statement, its Why only on `--why`, never its examples, and no check reads an example. Which tool holds a rule is the presets' fact, never the rule's. A review reads every rule.
- **Rejected.**
  - Numbered rules or numeric ids, which shift or need a lookup; a prefix by block, as linters namespace their rules, since rules move between blocks.
  - A Check column and a closed list of check roles: a rule then is written with an eye on what a tool can do.
  - Tags and lenses: most rules had none, the rest were inconsistent, and a review by lens skips every rule whose writer missed the lens.
  - An arrow inside one block: two rules of one block are of one generality and need no link.
  - The Why as a one-row `| Why |` table: a pipe in it had to be escaped, the cell held one paragraph and no list, and a second row was a form of its own to refuse.
  - Examples in a folder of the docs, one file per slug: they drifted from their rules, and when the rule tree was rewritten 36 had lost their rule, found only by the site's build.
- **Why.** A reader who stops after a rule's first sentence knows what it asks, one who reads its Why knows what breaks without it, and a block below is checked never to loosen the rule it names; an example beside its rule changes in the same edit and is reviewed with it.

## ADR-0009 — MUST and SHOULD mean one thing in every block

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** A rule's own level is MUST or SHOULD. It is MUST where a breach risks a defect, an unsafe state or a broken interoperation, and a reviewer or a tool can tell a breach from compliance; SHOULD where a breach only makes the code harder to read or to change, and it is left only with a stated reason. MAY is no rule's own level: only an override names it (ADR-0015), and the check reports a rule headed MAY.
- **Rejected.** Every rule MUST, which fills every gate with what only advises; every rule SHOULD, which leaves nothing that fails; a third level, MAY, for a permitted choice, which one rule in more than 1500 held and which binds nothing.
- **Why.** The level decides what the gate hands first, which findings fail and which advise, and what a person may leave with a reason, so it must mean the same in every block.

## ADR-0010 — One meaning per rule, one home per obligation

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** A rule holds one meaning, and an obligation is stated in one rule, which other chapters refer to or tighten. A rule earns its place by a failure it prevents that nothing else already prevents; a rule that repeats a parent, a sibling, a standard or a tool's default is cut. A merge stands only when the merged rule is a case of the survivor's one meaning.
- **Rejected.** Restating an obligation where a second chapter needs it, which drifts and must be overridden twice; a merged slug renamed to list both halves; rules added for one reviewer's edge case.
- **Why.** A subject cut into distant rules is read in part, and every rule that only repeats costs every reader and says nothing new.

## ADR-0011 — A term is defined once, where its uses place it

**Date:** 2026-11-09 · **Status:** Accepted

- **Decision.** A term is defined once, in bold: in its chapter's `Vocabulary` when two or more rules, a definition or another chapter use it, else in the statement of the one rule that needs it. Its block and axis are its owner's, and the check refuses a term defined twice or used out of its owner's reach. A term settings name carries a stable id after its bold, ``**`infrastructure/`**{#adapter}``; a block that spells it its own way defines its spelling under the same id, and a concept with an id lists its words in code spans, which a plugin takes (ADR-0057).
- **Rejected.** A vocabulary file kept apart from the rules; a dictionary of brands and file names in each passport; an id that is the term's spelling on the day it was defined; a per-language case field.
- **Why.** The chapter that uses a word is where a reader looks for what it means, and a role named by an id is renamed in one line while every setting keeps reaching it.

## ADR-0012 — Core states the meaning, the blocks give the form

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** Core states what holds in every program. An incidental detail, one a language, a tool or a framework spells or chooses otherwise, such as a folder, a suffix or a file's name, core fixes only as a default under a term id, which a block respells under the same id; any other such detail sits in the block that owns it, or nowhere. Each language, platform and implementation gives core's rules their form, and a language or platform names its chapters after core's on the same axis.
- **Rejected.** One form in core, such as a factory as the only adapter, which sets a framework's program apart from its own injector; a language's form lifted into core with the rule, which names the language from above; a layout of the languages' own.
- **Why.** A rule read in core then binds every program, and a reader finds each language's form of a rule where core keeps it.

## ADR-0013 — A rule names a tool, a vendor or a protocol only in its own block

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** No rule of core, a domain or a context names a tool or a vendor, and a domain names a protocol only in the block of that protocol; an open specification, such as Standard Webhooks, may be named where its subject is. A domain states the goal, and a platform's block its means: the accessibility scan of a rendered state is a goal of `presentation`, met by axe in the browser's test tools, by XCTest's audit in `ios` and by the Accessibility Test Framework in `android`. Which rules a tool checks is said by its presets' keys.
- **Rejected.** A rule that names its tool or setting; a protocol's names in a general domain, which bind every program of that domain to a protocol it may not speak; a platform's means in a domain or in core, which bind every other platform to one it does not have.
- **Why.** A tool, a vendor, a protocol or a platform can then be swapped without touching a rule above it.

## ADR-0014 — A block never cites this log

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A block states its rules with their reasons and never cites an entry of this log; the check reports a citation.
- **Rejected.** Citing the log from a rule, as many rulebooks do.
- **Why.** A rule must stand alone where a project reads it; this log explains the Constitution, not a project's duty.

## ADR-0015 — An override lowers a rule to SHOULD or MAY, with consent and a reason

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** An override in a unit's `constitution.yaml` names one rule, core's included, for that unit's files, and either lowers it from MUST to SHOULD or sets it to MAY, which the rule then only advises; the rules that tighten it keep their levels. It is written only with a person's consent and its `reason`, may carry an `until` date after which it lowers nothing, and goes with the change that ends it.
- **Rejected.** Rules no override may lower; blanket waivers; an `off` that removes a rule, which the gate and the review then never show, where a rule at MAY is still handed and read as advice.
- **Why.** A project may have a real reason to depart, and the departure is then visible, scoped and argued.

## ADR-0016 — A language block is a syntax, and a manifest belongs to its ecosystem

**Date:** 2026-11-07 · **Status:** Accepted

- **Decision.** A language block governs only its files' extensions; formats such as CSS, HTML, JSON, TOML, YAML, Markdown, shell and Dockerfile are languages, and Compose is an implementation. A manifest belongs to the ecosystem that reads it, `package.json` to the JavaScript runtime block `js-runtime` and `[project]` to Python. A tool's passport names the languages it covers.
- **Rejected.** CSS or markup rules in a domain or a platform, which give them a language they may not have; manifests in a language's `governs`; `package.json`'s rules in one runtime's block; coverage through `requires`, which counts every language as a programming language; a block that requires the language its tool's settings file is written in, and a check that asked it to, since the tool works without that language's block, the format is not the tool's subject, and a project that lists the tool may not want that block, while one that lists it has the settings file covered by the language's own patterns.
- **Why.** A rule sits where it loses its meaning, and every rule sits with the specification that gives it its meaning.

## ADR-0017 — The plugin is the engine, and the rules come from the release the project pins

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** The plugin holds only the engine — hooks, skills, agents — served from the package folder at its release tag. Everything else a project takes — blocks, presets, templates and the tools that check them — ships in one release distribution per platform, which mise installs pinned by version and checksum through its `github` backend; the hooks read the blocks of that release. No rule says where the Constitution is installed.
- **Rejected.**
  - npm packages for the TypeScript tools beside an archive for the rest, or presets in a separate devkit: the same rule released twice, in two versions.
  - The plugin delivering the rules of its installed version: two repositories on one machine would read one release whatever they pin.
  - A marketplace repository, a dist branch, a git submodule, `releases/latest`, or the `http` backend with a hand-copied checksum.
- **Why.** A rule and the setting that holds it change in one pull request and ship in one version, and the project's one pin is the single source of both.

## ADR-0018 — A pack is a folder of blocks, and a project's own blocks are one

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** A pack is a folder shaped like the Constitution, `blocks/` and optionally `presets/` and `templates/`, with no manifest and nothing generated; a project lists its packs by path. The hook reads every block, the Constitution's and each pack's, from its Markdown at session start; a project's own blocks are a pack. A pack tightens as any block does, and `constitution run check` checks it with the Constitution's own check of the blocks: in a pack a finding on a MUST rule fails and one on a SHOULD rule advises, while the Constitution's release fails on every finding.
- **Rejected.** Digests or an index generated per release or per project, a build step that buys no speed; local blocks beside packs, two mechanisms for one thing; a manifest with a version range per pack; a pack that replaces or loosens a rule; a check of the blocks for the Constitution alone, which leaves a pack's rules unchecked.
- **Why.** One reader for every block leaves one engine, and a block edited in a working tree reaches the next session as it is.

## ADR-0019 — Presets are entries keyed by the rules they hold, and they run with their tool alone

**Date:** 2026-11-09 · **Status:** Accepted

- **Decision.** A tool's settings live in preset files of the release and of each pack, named by the tool that reads them, the axis of the rule they hold and the blocks they need beyond that tool's reach: `presets/<reader>/@<axis>.yaml`, `presets/<reader>/@<axis>/with/<block>.yaml` and its own `with/` below. Each entry is keyed by its block, the rule it holds (`*` for a setting the tool needs and no rule asks), the language and the file it writes. `constitution presets apply` computes each unit's files and writes them into the project's own configuration, as data files the tool reads by default, keeping the project's comments and settings; a lock per unit records what it wrote, and the check reports a setting that is missing, stale or loosened. A starter file the user owns is written once and left alone. A preset never depends on the Constitution's code: shell a tool's file holds is plain commands, and logic beyond them is a script or a plugin the release ships under `presets/<reader>/plugins/`, or a program the release ships under `tools/`, built from a package of its own that imports nothing of the Constitution; the tool runs either alone.
- **Rejected.**
  - Parts the project extends or joins, since half the tools have no `extends`, copies drifted and an override could not remove one rule's settings; a bindings table beside the parts; templates an agent assembles; a JavaScript module the program writes; a static check that every setting holds a rule.
  - Branches, loops and pipelines embedded in a tool's YAML, which fail unseen under a runner's flags; a preset's hook that calls the Constitution's command line, which makes the tool's file useless without it.
- **Why.** A rule's settings are found by the rule, written by code rather than an agent, leave with the rule's override, and every drift shows as a finding; a file the tool runs without the Constitution keeps working when the Constitution is gone.

## ADR-0020 — The Constitution holds what a tool holds, never how the project runs it

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** The rules hold a program's structure, code, tests and the configuration of each tool that holds a rule; they prescribe none of the project's command lines, flags or order of runs. A tool's block writes its commands into the unit's manifest as scripts named by their action, `check:<what>`, `test:<what>`, `fix:<what>`, and `constitution run <check|test|fix>` runs each unit's.
- **Rejected.** Commands kept as rules or as a template every project copies, which bind a project to one way of running its tools and go stale with each tool's flags; a `check:` line the user writes, a second list that drifted; a `commands:` field in a block; mise tasks, which tie every unit to mise.
- **Why.** A rule about how a tool runs says nothing about the code it checks; the manifest shows every command, each written by the block whose rule it holds.

## ADR-0021 — Tools hold what breaks in silence; review holds the rest

**Date:** 2026-10-16 · **Status:** Accepted

- **Decision.** A tool holds a rule whose breach silently breaks a property the program relies on — formatting, lint, types, tests and their gates, secrets, vulnerabilities, unused code, versions, and the base of the architecture: the direction of imports, layers and features blind to each other, effects at the edge. Review, by people and the reviewer agent, holds where a file lives and what it is called. A rule a tool claims to hold, it holds whole.
- **Rejected.** Every rule a tool can express held by one, which rewrote several presets for each moved folder; dropping the architecture's tools, since agents keep what fails the check more reliably than what prose says.
- **Why.** A check pays for itself where a breach is silent and costly; where it is visible and harmless, its upkeep costs more than the review it saves.

## ADR-0022 — Each unit keeps its own `constitution.yaml`, every key written

**Date:** 2026-10-23 · **Status:** Accepted

- **Decision.** The root and each workspace member that follows the Constitution keep a `constitution.yaml` of one schema — `axes`, the blocks by rank, `packs`, `overrides` — and the root also `PROJECT.md`, the product described. Every key is written, `[]` where empty, save `name`, the unit's package name. The members are those the package managers' workspace declares. The release is pinned in `mise.toml` alone.
- **Rejected.** The root listing every package's blocks, which leaves a package's rules behind when it moves; a version in both files, two sources of one fact; optional keys, since a missing key cannot be told from a forgotten one.
- **Why.** What holds a unit lives with the unit, and a file whose every key is written reads the same in every project.

## ADR-0023 — A decision log holds strategic choices only

**Date:** 2026-11-05 · **Status:** Accepted

- **Decision.** Every project keeps a `DECISIONS.md`, and the change that makes a strategic choice between real alternatives records it there in a few lines: what was chosen, what was rejected and why. A strategic choice shapes the system broadly — its structure, a technology, a format, an architecture or a policy many later changes follow. A rule's own change, a fix, a rename or a list of rules added is recorded by its pull request and the rule's Why. An entry states the decision as it stands.
- **Rejected.**
  - No log, the history alone: the rejected options are what the history does not show, so the choice is argued again.
  - A record of every choice between alternatives, as this log was until 2026-11-05: 262 entries in 3,700 lines, most of them audits and rule rewordings, which buried the few that matter.
  - An entry per step of an evolving choice: a reader must replay the history to learn what holds.
  - Tables mapping each renamed slug or term id to its successor: a project has nothing to migrate, and the pull request keeps the rename.
- **Why.** A decision is worth writing down when someone would otherwise propose its rejected option again; the test keeps the log short enough to be read.

## ADR-0024 — A workspace holds `apps/` it deploys and `packages/` it shares or releases

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** A workspace holds `apps/<name>/`, what the repository deploys and runs itself, blind to each other, and `packages/<name>/`, everything it shares or releases. Imports go from apps to packages, never back, and never in a cycle. Code that serves one purpose in several languages is a group folder of packages, one per language and a `shared/` one for what is written in none, each reached by its name. The root holds one workspace per language.
- **Rejected.** `apps/`, `shared/` and `libs/` split by reach; an app as any program with a root; a top level by language, or a product folder with language folders inside one unit; a nested workspace per product, which Bun ignores and uv refuses.
- **Why.** `apps/` and `packages/` split the units by how they leave the repository, the split Turborepo states and repositories of libraries and tools follow, so a reader knows the tree on sight.

## ADR-0025 — One form for every package, and at most one root in it

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** Every package has one tree whether it is run or imported, distributed or not: a module is a surface, its role folders and modules of the same form, at any depth. A package that nothing runs has no composition root; a package holds at most one, and a program that wires itself apart is a package of its own. "Library" is no kind of package; `libs/` is a folder role, code that knows nothing of the product.
- **Rejected.** A library as a form of its own, which gave one thing two layouts; a monorepo triggered by two platforms or technologies; a shared package made before its second program.
- **Why.** One form learnt once reads the same in every package; a root is the one place that wires a program, and a second one splits every layer between two programs.

## ADR-0026 — A unit carries its own configuration and checks

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** Each unit of a workspace is checked by the settings of its own blocks, kept in its own folder, and each tool runs there; each unit holds the imports it makes into others. The root holds only what crosses the units, and a tool only the root follows serves every unit.
- **Rejected.** One run from the root with every unit's settings joined, which applies a framework's names to units that do not use it; overrides per path in one configuration, which only some tools have; the root cruising every unit's imports.
- **Why.** A unit moved to a repository of its own takes its rules and checks with it, and no unit's settings change another's.

## ADR-0027 — Business shared across languages is one compiled package first

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** Business that programs in several languages run lives first in one package in a language every target runs, compiled for each through generated bindings; then in a service they call; a copy per language, held by a shared schema and conformance cases, is the last resort. Products that own their data apart share only contracts.
- **Rejected.** The service first, which puts every client behind the network; a business package shared by services deployed on their own, which ties their releases together.
- **Why.** Business written once cannot drift between languages or services.

## ADR-0028 — Generated files are not committed, and the check changes nothing tracked

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.** A project commits no generated file by default; an application may choose a few. A generated file is built where it is read, before each script that reads it. The check never changes a tracked file: it may write untracked build output it then reads.
- **Rejected.** Committed generated files guarded by a drift check, including this repository's digests and design themes; a check that regenerates what it checks, which can pass by changing it; an install script that builds them, which some installs skip.
- **Why.** No copy drifts from its source when none is kept, and a check that writes can pass by changing what it checks.

## ADR-0029 — A feature is laid out in Evans' four layers, its domain by concept

**Date:** 2026-10-31 · **Status:** Accepted

- **Decision.** A feature holds `domain/` (the model, in a folder per concept of the business's language, each with its entities, transitions, value objects, services, events and errors), `application/` (the use cases and every port they ask, in `contracts/`), `infrastructure/` (the adapters) and `presentation/` (all through which the program is called, a screen, a route, a command, a consumer). No folder is a delivery layer of the program: a delivery unit lives with what it serves, and the root registers it.
- **Rejected.** Use cases inside `domain/`; repository interfaces in the domain, since the model never calls one; `app/` as the binding layer, which a DDD reader takes for the application; role folders at the top of the domain; vertical slices by operation, or layers by file suffix; a top-level `api/`, `cli/` or `routes/`, which names the platform the program already is.
- **Why.** Each canonical word names one place, the direction of dependencies is a matter of folders the import checks read, and a reader finds an aggregate, its values and its moves in one folder named in the business's words.

## ADR-0030 — The model decides, and use cases orchestrate

**Date:** 2026-11-02 · **Status:** Accepted

- **Decision.** An aggregate changes only through its transitions, which guard its invariants and yield its events; a rule over several aggregates is a domain service. A use case decides no rule of the business: its own branches follow the operation's flow. A command changes and returns nothing; a query answers and changes nothing. Entities and value objects are plain immutable data, not classes.
- **Rejected.** A Transaction Script exemption for simple features, since the owner wants one form; a model required for a feature that decides nothing; a command that returns the created identity as a rule; classes with private fields, which need a mapper at every boundary the data crosses (a cache, storage, a worker).
- **Why.** A rule written in a use case is skipped by the next one, which is how a model turns anaemic; a model that holds its rules and guards its transitions is DDD whatever the syntax.

## ADR-0031 — Every operation has a framework-free use case

**Date:** 2026-10-31 · **Status:** Accepted

- **Decision.** Every operation a feature offers, a read included, has a use case in the application layer, however thin: a plain function free of any framework, which takes only its operation input, made of the domain's types and parsed beside it. A hook, a controller, a command or a consumer only binds it, and an interface calls use cases, never a port.
- **Rejected.** A use case only where an operation orchestrates, which hides what a feature does behind the interfaces; the use case as a React hook, which runs only in a component; primitives into the use case, or the parse written in each delivery unit.
- **Why.** Hexagonal architecture gives each operation one driving port; the application then runs from any interface, and every interface reaches it through one parse that cannot drift.

## ADR-0032 — Expected failures are typed errors of three kinds, thrown in TypeScript and Python

**Date:** 2026-11-02 · **Status:** Accepted

- **Decision.** A use case fails only with the domain's failures (a rule of the business refused), the application's (the operation cannot proceed: not found, not permitted) and those its ports declare, each with a stable code; anything else passes as a defect. An adapter maps every failure of its dependency it recognises to its port's own. Core leaves the form to the language; TypeScript and Python throw.
- **Rejected.** A `Result` type for expected failures in TypeScript and Python, even as an allowed choice: the owner keeps the language's own throw; a catch around every input and output that turns any failure into the program's, which disguises a defect as something a caller can handle.
- **Why.** A caller tells a refusal from an operation that cannot proceed only when each has its home, and classifying everything is impossible and needless.

## ADR-0033 — A layer imports by its folder role, and the domain imports no vendor

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** One table by folder role says where any installed package may be imported, and each block names only its own package's home. The domain, the application and the kernel import no installed dependency, save a library of one outside format or arithmetic that one value object needs; a general schema or parsing library is never one. The domain checks its own values and logs nothing; logging goes through the language's standard facade, configured by the root.
- **Rejected.** Per-library bans, which leave every library nobody wrote a rule for free everywhere; a pure vendor library in the domain because it has no side effects; a schema library or a validation port inside the value objects; a logging wrapper of the program's own.
- **Why.** The edge is where a program meets what it does not own, so a vendor's types and upgrades never reach the model, and one table says once where any package may go.

## ADR-0034 — Features meet only in composition, and the kernel holds only what no feature owns

**Date:** 2026-11-02 · **Status:** Accepted

- **Decision.** A feature asks another through a port of its own, never through the other's types, and never subscribes to another's events; a composition module, itself a feature, orchestrates features through their surfaces and is imported by none. The kernel holds only what no feature owns: shared value objects, and a port an outside system answers once two features need it.
- **Rejected.** A feature subscribing to another's events directly, which couples them as an import would; ports between a composition module and the features it composes; a contract another feature answers lifted to the kernel; a top-level `contracts/` or `shared/domain/`.
- **Why.** It is the orchestration layer of a modular monolith: what a feature answers is its own model, and DDD keeps the shared kernel small.

## ADR-0035 — The composition root assembles the program and decides nothing

**Date:** 2026-10-31 · **Status:** Accepted

- **Decision.** `root/` builds every adapter with what it needs and hands it in; no adapter imports a shared instance. The root chooses implementations by data, never by a branch, and every other decision lives in the unit that owns it; it is left out of coverage and mutation, and a boot spec proves the program starts. A framework's container may wire only bindings the root declares.
- **Rejected.** Adapters as module objects over a shared transport; one wiring file with an exception to the line limit; a branch the gates leave out; a container that finds its bindings by scanning or convention.
- **Why.** A root that only chooses and connects is a humble object a reader checks by eye, and every decision is proven where it belongs.

## ADR-0036 — A transaction may save several aggregates of one feature, and no rule relies on it

**Date:** 2026-11-02 · **Status:** Accepted

- **Decision.** A transaction lies within one use case and one feature. It may save several aggregates of that feature, but no rule of the domain relies on it: an invariant that must hold across them makes them one aggregate, and one that may lag is kept by a reaction to the event. Features never share a transaction.
- **Rejected.** Several aggregates in one transaction only where an invariant binds them, since such an invariant marks one aggregate; one aggregate per transaction always, which leaves a half-done change for nothing.
- **Why.** Model true invariants in consistency boundaries and keep aggregates small, with the transaction a convenience no rule depends on.

## ADR-0037 — A surface is the door of a module, and a layer or role folder has none

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** Outside a module, a caller imports only its surface; inside, files import each other directly. A layer folder and a role folder are containers without a surface, save a folder whose members are of one kind.
- **Rejected.** A surface on every folder, which joins layers into one import and hides an edge the layer rules forbid; Biome's `noPrivateImports`, which demands a surface at every level.
- **Why.** A surface is where a caller may couple, so it sits only where coupling to the whole is safe.

## ADR-0038 — Code is shared on its second consumer, and copies join when they change together

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** Code moves to the nearest common level when a second consumer needs it. Similar code is joined into one abstraction only when the copies change together, whatever their number; don't-repeat-yourself applies to knowledge, not to text that looks alike.
- **Rejected.** The third occurrence as the trigger to abstract, since copies that change apart are coincidence; one threshold for moving and abstracting, which either shares too late or abstracts too early.
- **Why.** Moving code changes where it lives, not what it means; an abstraction commits to an axis of variation, which only shared change shows.

## ADR-0039 — A spec proves a boundary's behaviour, and a screen is tested as its user uses it

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A spec proves one boundary — a use case, an adapter, a screen, a reusable component, a module of rules — and what it uses is proven through it. A screen's spec renders it inside its providers over the real adapters, with the transport replaced by captured responses, and proves each data state, interaction, message and navigation.
- **Rejected.** One spec per source file, which mirrors the layout and breaks when a helper moves; checking the calls of mocks; faking a screen's use cases, which never sees a mapping wrong; DOM snapshots.
- **Why.** A spec written against what a caller or a user sees survives refactoring and fails when the behaviour changes.

## ADR-0040 — The gates: all logic covered, and every mutant of a change killed

**Date:** 2026-10-27 · **Status:** Accepted

- **Decision.** All logic is held at 100 percent of lines, functions and branches, reached only through the specs of its boundaries; the composition root and the entries are left out. Every mutant on the lines a change touches and in its new files is killed, run only against the specs that load its file and never from a cached result. Text a person reads lives in files whose mutants are left out, and a format is pinned by one golden file per renderer.
- **Rejected.** A coverage floor that only rises, or a percentage per layer; a mutation score below 100 percent; coverage as the measure of test quality; Stryker's incremental cache, which hid survivors; a scheduled full run or an advisory score; test-first as a mandate for every change.
- **Why.** Specs at the boundaries reach every line a caller can reach, so the coverage gate costs nothing extra and catches dead code; a suite that lets mutants live is weaker than its coverage says, and tying mutants to the change keeps the gate's cost with the change.

## ADR-0041 — One formatter per language, two spaces and 100 columns

**Date:** 2026-10-28 · **Status:** Accepted

- **Decision.** Each language has one formatter: Biome for TypeScript, CSS, JSON and YAML, also the linter; Ruff for Python; tombi for TOML; shfmt for shell; rumdl for Markdown. Every formatter indents by two spaces where the language leaves it to the project, and wraps at 100 columns. actionlint alone lints GitHub Actions workflows.
- **Rejected.** oxlint beside or instead of Biome, which splits one role between two tools; yamlfmt, Prettier or dprint beside Biome; a width of 80, which breaks typed signatures into lines that each say little; zizmor beside actionlint.
- **Why.** One formatter per language, kept alive, writes one form, and one indent and width shared by all is written once.

## ADR-0042 — betterleaks holds the secrets and OSV-Scanner the vulnerabilities and licences

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** betterleaks scans the history a clone holds and the uncommitted changes for secrets. OSV-Scanner checks every lockfile, in any language, and each image's base stage for known vulnerabilities, and what the program ships against the licence allowlist; it runs with `--all-vulns`, and any known vulnerability, a development dependency's included, fails the check. A vulnerability a person accepts is an `[[IgnoredVulns]]` entry with its id, its reason and an `ignoreUntil` date.
- **Rejected.** gitleaks, which is feature-frozen; `bun audit`, which reads one lockfile, checks no licence and keeps an exception with no reason or expiry; running two audit tools; letting a vulnerability of low or medium severity pass, which needs a program around the scanner to filter what it reports.
- **Why.** One tool per concern holds every language, every exception is explained and dated, and the scanner's own flags and ignore file need nothing around them.

## ADR-0043 — Dependencies are pinned exactly, and a new release waits three days

**Date:** 2026-10-16 · **Status:** Accepted

- **Decision.** Every build, test and lint tool is pinned to one exact version in the manifest, in every language; an image is pinned by its version and its digest; a new release of any dependency is adopted only after three days, save the fix for a known vulnerability.
- **Rejected.** Caret ranges for tools, which move a linter through the lockfile unseen; a tag alone for an image, which a registry lets anyone push again; a seven-day cooldown, which holds back for a week releases needed today.
- **Why.** A new tool version changes what the check reports, so it belongs where a reviewer sees it, and three days catch most hijacked releases while keeping tools current.

## ADR-0044 — Python is checked with uv, Ruff and ty, and tested with pytest and mutmut

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Python takes the same rules as TypeScript in its own forms: uv for packages, Ruff to lint and format, ty for types, pytest with Hypothesis for specs, mutmut for mutation, import-linter for imports, pydantic only at the edge, and Google's docstring form, with its `Args:`, `Returns:` and `Raises:` headings.
- **Rejected.** Pyrefly, the reviews' choice, for ty, from the makers of uv and Ruff (owner); extending the TypeScript mutation runner to drive mutmut, which would make a Python repository install Bun; NumPy's docstring form, whose underlined headings take two lines each, and reStructuredText's, whose `:param:` fields read as markup in the source, while Google's headings read as plain text in `help()` and in the source alike.
- **Why.** A product written in TypeScript and Python is reviewed and checked the same way in both, by the tools each language has settled on.

## ADR-0045 — A user interface builds its primitives on Base UI

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** The interface kit is shadcn's source on Base UI's primitives, made the project's own. Where a library of accessible primitives is active, it supplies the dialog, the popover and the accordion; the platform's own elements serve only where none is.
- **Rejected.** Radix as the base, since shadcn generates on Base UI and the owner moves every project to it; the browser's `<dialog>`, `popover` and `<details>` beside a primitive library, which lack scroll lock, light dismiss and keyboard patterns.
- **Why.** The platform's element is the right primitive while it carries the whole pattern; once a project has a library that carries more, that library is the accessible primitive.

## ADR-0046 — The platform over libraries: Temporal and OKLCH

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** Dates, times and durations are `Temporal` values, `Date` only where an API demands it; the theme writes its colours as `oklch()`.
- **Rejected.** Date libraries the platform now covers; waiting for `Temporal` to reach Baseline; native signals in place of state libraries, still at Stage 1.
- **Why.** In 2026 the platform covers what these libraries did, and a feature a program polyfills counts as available.

## ADR-0047 — Design tokens follow the W3C format, and Tailwind reads them through aliases

**Date:** 2026-11-09 · **Status:** Accepted

- **Decision.** A style of text is one composite of the W3C Design Tokens format's `typography` type, named by the kind of text, and a semantic motion token is one composite of its `transition` type, `motion.<kind of motion>.<step>`, over primitive duration and easing tokens. The tokens keep their own custom properties, and Tailwind's theme is a generated layer of aliases in its own namespaces, `@theme inline`.
- **Rejected.** A property in the role's place, as Primer names it; an `@utility` per typography token; semantic variables declared in Tailwind's namespaces; a motion token per property, `motion.enter.duration`, whose parts drift apart; no semantic tier for motion, which leaves a theme no way to change how motion feels.
- **Why.** The format's composite is the one unit design tools and every platform's output read, and aliases let the tokens keep one name everywhere.

## ADR-0048 — Only a person commits, and only the release commit skips review

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Only a person decides what is committed: the main agent commits only when asked, a sub-agent never commits, and no agent merges or pushes to the main line. Every change reaches the main line through a reviewed pull request, save the release automation's version commit and tag.
- **Rejected.** A sub-agent committing on the working branch; a pull request for every version bump, which a person would approve unread.
- **Why.** A commit records a decision under a person's name, and the version commit holds only what reviewed changes decided.

## ADR-0049 — Commits follow Conventional Commits with four types

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Commits use the types `feat`, `fix`, `refactor` and `chore`, `!` for a breaking change, no scope, a capitalised subject; the commit hooks check the message and the branch name.
- **Rejected.** The eleven common types, which the changelog ignores; scopes, which a single changelog does not read; a `BREAKING CHANGE` footer; a separate commit-message tool beside the hooks.
- **Why.** `feat` and `fix` are what the changelog reads, `chore` carries the automation, and `refactor` promises what a reviewer can check: no change of behaviour.

## ADR-0050 — Every event of a stored change is handed on from its outbox, to reactions within the program too

**Date:** 2026-11-06 · **Status:** Accepted

- **Decision.** An event announcing a stored change reaches each reaction from the event outbox its commit wrote, a reaction within the same program included: after the commit, at least once, never from memory.
- **Rejected.**
  - A dispatch in memory after the commit for reactions within the program, as Cosmic Python's unit of work does, accepting the loss on a crash or repairing it by a sweep.
  - A dispatch before the commit, inside the change's own transaction, so that the reactions' writes join it, as Bogard and Microsoft's eShopOnContainers do: the transaction then spans aggregates and features, and a rule comes to rely on their being saved together.
- **Why.** A reaction lost between the commit and its dispatch leaves nothing that shows it was lost, and the outbox the broker's case already pays for keeps it. Evans and Vernon keep one aggregate to a transaction and the rest eventually consistent, and Richardson's transactional outbox hands an event on if and only if its change commits.

## ADR-0051 — Programs that own their data apart share no rule of the business

**Date:** 2026-11-06 · **Status:** Accepted

- **Decision.** No two programs that own their data apart share a rule of the business, neither in a library both import nor in any other code both run; each keeps its own copy.
- **Rejected.** Evans' Shared Kernel, a part of the model two teams share and change only together.
- **Why.** A Shared Kernel binds the two releases together, and a change to it must reach both stores at once, so the two become one program deployed in pieces; a copy is the cheaper coupling, as Newman advises.

## ADR-0052 — An event may carry the new state of what it announces, in fields its contract declares

**Date:** 2026-11-06 · **Status:** Accepted

- **Decision.** A message holds its identifiers and what it says, never the publisher's stored state. An event may also say the new state of the object it announces, in fields its contract declares.
- **Rejected.** Events that only notify, carrying identifiers for each consumer to call back with; the publisher's stored record sent as it is.
- **Why.** Fowler's event-carried state transfer spares each consumer a call back and keeps it working while the publisher is down, and fields the contract declares keep the consumer apart from the publisher's storage.

## ADR-0053 — No core rule bans running text as code; each language bans its own evaluators

**Date:** 2026-11-06 · **Status:** Accepted

- **Decision.** Core holds no rule that no code is run from text. Each language that runs text as code bans its own evaluators in its own block, as python's `text-never-passed-to-eval-or-exec` and typescript's `code-never-run-from-a-string` do, with no arrow to core. The language rules carry no Exempt; a program whose work is to compile text it is given or generates, such as a template engine or a schema compiler, lowers them by an override with its reason.
- **Rejected.** A core rule that no code is run from text, proposed by two auditors (contexts audit 3, A5 and X).
- **Why.** Template engines, schema compilers and code generators run text legitimately, so a core rule would need an Exempt for code the program generates itself, which empties it; outside input that reaches an evaluator already breaks `outside-input-reaches-interpreters-as-parameters`.

## ADR-0054 — A rule states an outcome, and no rule obliges a tool

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** Every rule of core, a domain or a context states an outcome for the program or its code; a block below tightens it by an arrow only where it adds its own form, such as its tool's. An arrow means only that the child holds its parent on the child's own territory, and a preset keyed by a rule's slug means only that a tool checks that rule; nothing is computed from the two, and the review reads every rule. A passport names no gap its tool leaves.
- **Rejected.**
  - Requirements tables in the implementations' passports and "Requirements for implementation" sections, by which an upper rule asked a tool to answer it, with a coverage report and a warning on a requirement no tool answered: rules came to be written with an eye on what a tool can do, and of 41 requirement rules 13 were outcomes reworded and 28 restated a rule that already held their obligation.
  - Funnels that trace each outcome to the tools that hold it: more machinery than what it shows is worth.
  - A sentence in a passport naming the gap its tool leaves, and a core rule asking for one: the project's own code may close the gap, so it is not the tool's to declare.
- **Why.** A rule that states an outcome binds whatever tool holds it, so a tool swapped changes a preset, never a rule.

## ADR-0055 — The gate hands the statements, and one fresh reviewer judges the change

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.**
  - At the start of a session the digest gives the release, core's passport and the map of the active blocks, never a rule.
  - Before an action, the gate hands the rules that govern it: each governing chapter's vocabulary, then each rule's statement at the level that binds there, MUST before SHOULD, with no Why and no example, and refuses the action until they are read whole. A rule is known by a hash of its statement and its level, a definition by a hash of its text, so only what is new or changed is asked again.
  - After a tool's use, the hook records what was read or changed and names the blocks that govern it; it runs no check.
  - At the hand-back, the stop is held until the project's check passes on the tree, then until one `constitution:reviewer`, in a context of its own, has judged the changed files against their rules as `constitution rules --for <files> --why` prints them, with their Why.
  - A failed `constitution run check` names each rule its output shows broken as `slug · LEVEL — statement`, its Why on `--why`.
- **Rejected.**
  - The Why with every statement at the gate: about half again as much to read before each action, for text that explains a rule and binds nothing.
  - A short list of the rules most often broken, given at an agent's first change of a file: the gate already makes the agent read each rule whole before it acts.
  - The writer's own review of its change at the stop, which reads it with the assumptions that wrote it.
  - A check after each edit, which runs on half-made work and costs a whole check per edit.
  - A reviewer that reads the chapters itself, which spends its context on rules that govern no changed file.
- **Why.** An agent keeps what it must read before it acts, and what binds is the statement; the reason matters where a change is judged, by a reader who did not write it.

## ADR-0056 — A block file holds at most 1500 lines, every line counted

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** Every passport, chapter and seam holds at most 1500 lines, its examples included, and the check names the rule that sets it; a file that outgrows it splits by subject, as core's `tests` gave its section on writing a case to a chapter `cases`. Core's passport has no budget of its own.
- **Rejected.**
  - A budget of 500 lines that leaves the examples out: a reviewer reads a file whole, examples and all, and a measure that skips part of it lets a chapter grow past one sitting.
  - A byte budget for core's passport, which the digest gives whole: the rewritten core outgrew it by what it now says, and a number moved each time core grows guards nothing.
- **Why.** 1500 lines hold about 45 rules with their Why and examples, a chapter's size today, and one measure counted as code's is counted needs no exemption.

## ADR-0057 — A plugin takes the project's words from their term, as a copy each unit holds

**Date:** 2026-11-09 · **Status:** Accepted

- **Decision.** A concept that carries a term id lists its words in the code spans of the sentence that defines it, and a block that builds on its owner respells the list under the same id, as it respells a folder; core's empty names and empty verbs are such lists. A plugin names a list as `${term.<id>}` and a role as `${role.<id>}`, the entry file among them, and an entry copies the plugin into the unit with `!copy`: `presets apply` writes it whole into `ast-grep.gen/`, filled as the unit's language reads the terms, and writes it again from each release; `sgconfig.yaml` names the folder, and the formatters leave it out of what they check.
- **Rejected.**
  - The words kept in each plugin: a pack that respells the list cannot reach them, and the plugin's list drifts from the term's.
  - A plugin read from the release by its path with the words passed in: neither GritQL nor ast-grep takes an outside list, and each loads a rule only as a file.
  - A copy kept beside the project's files and formatted by Biome's fix: the formatter rewrites it after every apply, which then reads it as loosened.
  - The entry file's name, `main`, written into the settings: a language that names its entry otherwise, or a pack that respells it, gets settings that miss the file.
- **Why.** A word list a tool enforces has one home, the term a reader also reads, and the tool's file is still one the tool runs without the Constitution.

## ADR-0058 — A creation's identifier is held by its caller before it asks

**Date:** 2026-11-09 · **Status:** Accepted

- **Decision.** The idempotency key of a creation is the identifier of what it creates, which the caller holds before it asks, made by itself or issued to it ahead by the server, and which the record keeps as long as it lives; a REST creation carries it in its path, as a `PUT`. Any other write that a repeat would perform twice takes a key the server keeps.
- **Rejected.** A `POST` creation with an `Idempotency-Key` the server keeps: it needs a store of keys with a lifetime, and a repeat after the key expires creates a second record.
- **Why.** A key the record keeps for its life never expires, and a command that returns nothing (ADR-0030) already has the caller hold the identifier.

## ADR-0059 — A React module's Fast Refresh boundary is held by a plugin of our own

**Date:** 2026-11-08 · **Status:** Accepted

- **Decision.** A module that exports a component exports only components and their types, so Fast Refresh keeps the component's state across an edit. In the react-dom and react-native pairings the ast-grep rule `component-module-exports-only-components` holds it, and Biome's `useComponentExportOnlyModules` stays off.
- **Rejected.** Biome's `useComponentExportOnlyModules`, which flags a type's export, a compound component's root built with `Object.assign` and a spec's own components, each of which the React rules allow or ask for.
- **Why.** A check that refuses what other rules require is either switched off or obeyed against them; a plugin can hold exactly what the rule says.

## ADR-0060 — ast-grep holds the rules no tool of their own holds, in every language

**Date:** 2026-11-10 · **Status:** Accepted

- **Decision.** A rule that no tool of its subject holds is held by a rule of ast-grep, one file a rule and a language, its `id` the slug and the language, `<slug>@<language>`, and one grammar, Tsx, reads every TypeScript file. GritQL keeps only `statements-grouped-by-blank-lines`, which reads the blank lines between statements that ast-grep's tree drops. The import rules of Python are contracts of import-linter, its own contract types shipped as plugins, and the package `python-check` is gone. A setting that holds its rule whole in a language is marked `!whole`, and the hand-back gate gives that rule's heading alone in a file of that language.
- **Rejected.**
  - Biome's GritQL for every language: it reads TypeScript, CSS and JSON alone, and a plugin of it holds no option of its own.
  - A script of our own for Python's imports, `python-check`: a tool's contract holds the same rule, reports it in the tool's own run and costs no package to keep.
  - Two ast-grep grammars for TypeScript, with and without markup: every rule would be written twice, and a rule for one would miss the files of the other.
  - The whole hold read from a setting's presence: about two settings in five hold their rule only in part, so only an explicit mark says the tool holds it all.
- **Why.** One engine for every language keeps a rule written once where a tool can hold it, and a rule the gate hands as its heading costs an agent nothing to read where a tool already fails on its breach.

## Old numbers

Each entry above replaces the old entries listed beside it, and every other old entry was dropped, its text kept in the history of this file. A range runs over the old numbers that held an entry.

| New | Old |
|---|---|
| 0001 | 0001 |
| 0002 | 0002, 0136, 0164, 0169, 0173; the layer order of 2026-11-05 |
| 0003 | 0003, 0004, 0167; the domain tree of 2026-11-04 |
| 0004 | 0162, 0211; the domain layout of 2026-11-04 |
| 0005 | 0088, 0089 |
| 0006 | 0005, 0214; the seam name of 2026-11-04 |
| 0007 | 0055, 0090, 0093, 0163 |
| 0008 | 0013, 0015, 0016, 0054, 0097, 0101, 0103, 0160, 0161, 0226, 0274, 0279, 0280, 0296 |
| 0009 | 0053 |
| 0010 | 0184, 0185, 0186, 0264, 0270 |
| 0011 | 0219, 0232, 0240 |
| 0012 | 0144, 0278 |
| 0013 | 0014, 0198 |
| 0014 | 0057 |
| 0015 | 0020 |
| 0016 | 0095, 0096, 0215, 0216, 0295 |
| 0017 | 0043, 0073, 0075, 0076, 0079, 0091, 0124, 0203, 0249 |
| 0018 | 0204, 0205 |
| 0019 | 0072, 0094, 0098, 0212, 0234, 0235, 0243, 0297 |
| 0020 | 0132, 0155, 0241 |
| 0021 | 0105, 0200 |
| 0022 | 0007, 0009, 0010, 0102, 0208, 0217 |
| 0023 | 0191 |
| 0024 | 0125, 0150, 0159, 0196, 0199, 0250 |
| 0025 | 0147, 0157, 0187 |
| 0026 | 0151, 0207, 0213, 0218, 0227, 0228, 0245 |
| 0027 | 0190 |
| 0028 | 0026, 0062, 0229 |
| 0029 | 0143, 0188, 0259, 0269 |
| 0030 | 0153, 0260, 0283 |
| 0031 | 0195, 0261, 0272 |
| 0032 | 0106, 0263, 0268, 0282 |
| 0033 | 0036, 0086, 0148, 0158, 0262 |
| 0034 | 0189, 0194, 0256, 0287 |
| 0035 | 0035, 0066, 0141, 0271 |
| 0036 | 0286 |
| 0037 | 0029, 0052, 0165 |
| 0038 | 0058, 0265 |
| 0039 | 0046, 0049, 0067 |
| 0040 | 0033, 0047, 0048, 0084, 0138, 0220, 0255 |
| 0041 | 0045, 0126, 0224, 0230, 0258 |
| 0042 | 0074, 0081, 0251 |
| 0043 | 0134, 0145, 0202 |
| 0044 | 0127, 0128, 0129 |
| 0045 | 0108, 0146 |
| 0046 | 0114 |
| 0047 | 0253, 0254, 0297 |
| 0048 | 0063, 0064 |
| 0049 | 0068, 0071 |
| 0056 | 0295, 0296 |
| 0057 | 0298 |
| 0058 | 0297 |
| dropped | 0032, 0050, 0060, 0069, 0070, 0077, 0078, 0080, 0082, 0083, 0092, 0099, 0104, 0107, 0109 to 0113, 0115 to 0123, 0130, 0131, 0133, 0135, 0137, 0139, 0140, 0142, 0149, 0152, 0154, 0156, 0166, 0168, 0170 to 0172, 0174 to 0183, 0192, 0193, 0197, 0201, 0206, 0209, 0210, 0221 to 0223, 0225, 0231, 0233, 0236 to 0239, 0242, 0244, 0246 to 0248, 0257, 0266, 0267, 0273, 0275 to 0277, 0281, 0284, 0285, 0288 to 0294 |
