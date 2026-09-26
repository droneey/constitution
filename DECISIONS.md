# Decision Log

> A journal of the decisions behind the constitution and the reasoning behind them. **Not a rulebook** — the blocks say *how things are*; this log records *why it was decided and what was rejected*.
>
> **Conventions:** append-only. One entry per decision, numbered. To change a decision, add a **new** entry and mark the old one `Superseded by ADR-NNNN` — never rewrite history. Statuses: `Accepted` · `Proposed` · `Superseded by ADR-NNNN`.
>
> The log starts anew with the 1.0 design. Its first entries record that design in theme order, each with the date it was taken; the log of the 0.x constitution is in git at tag `v0.8.0`.

| Theme | Entries |
|---|---|
| The rebuild | ADR-0001 – ADR-0003 |
| Blocks and layers | ADR-0004 – ADR-0010 |
| Project files | ADR-0011 – ADR-0014 |
| Rules and roles | ADR-0015 – ADR-0020 |
| Overrides and precedence | ADR-0021 – ADR-0022 |
| Delivery | ADR-0023 – ADR-0029 |
| The anatomy | ADR-0030 – ADR-0038 |
| The rest | ADR-0039 – ADR-0047 |

---

## ADR-0001 — The constitution is rebuilt directly as 1.0
**Date:** 2026-09-25 · **Status:** Accepted

- **Context.** The 0.x constitution assembled blocks into named assemblies, and its session-start hook printed 57 to 105 thousand characters. Claude Code caps hook output at 10,000, so an agent saw a file path and a preview, and a sub-agent saw nothing. The owner is its only consumer.
- **Decision.** The constitution is rewritten in seven steps — the frame, core, the TypeScript-stack blocks, the devkit checks, delivery, Python with server and AI, and the migration of the owner's projects — and every step produces final files. Nothing is kept for 0.x: no old pins, no automatic migration of `Deviates:` lines, no upgrade command. `/ratify` reads a project's old `PROJECT.md` and `DECISIONS.md` and proposes each departure as an override, for the owner's consent. Each step lands as issues and pull requests that the owner merges; each merge cuts a 0.x pre-release, and 1.0.0 comes on the owner's word.
- **Rejected.** A 0.8.1 hotfix of the hook; an interim model that kept 0.x projects working.

## ADR-0002 — The decision log starts anew
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** This log opens with the decisions of the 1.0 design, grouped by theme. The 0.x log stays in git at tag `v0.8.0`, and no block and no entry here refers to it.
- **Why.** Most 0.x entries describe the model this design replaces; carried over, they would read as current.

## ADR-0003 — Not now: versions per block, rules for other AI tools
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The constitution is versioned as a whole, and it is written for Claude Code alone.
- **Why.** Neither has a present consumer.

## ADR-0004 — Four layers: core, domains, contexts, implementations
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Blocks sit in four layers, from the most abstract down: `core`, true for any program; domains, an aspect a project has or has not whatever its technology — `ui`, `api`, `i18n`; contexts, where the code runs (a platform such as `browser` or `cli`) or what it is written in (a language such as `typescript`); and implementations, a framework, library or tool — `react-dom`, `bun`, `git`. A block's `kind` names its layer. There is no `web` block: a browser application is `browser` plus `ui`. Implementations carry no framework, library or tool tag.
- **Rejected.** The 0.x kinds — spheres, concerns, frameworks and stacks bound to slots — and the toolchains and assemblies that chose blocks behind a project's back.
- **Why.** Each layer combines freely with every element of the others and reduces to none of them; a combination lives in the more specific block or in a seam file.

## ADR-0005 — Two links between blocks: requires and extends
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `requires` names a block that must also be active; it points up the layers, or to a peer implementation the block cannot work without. `extends` joins implementations only, and the base comes with its heir. A domain requires nothing, since above it is only core, which is always active. A tool never adds a domain: the project lists every domain, environment properties such as `untrusted-client` included. Choosing a tool, or using one that has no block, is not a departure.
- **Rejected.** An `activates` link through which a platform switched domains on, and inheritance from several bases.
- **Why.** Every block a project follows stays visible in its own file; nothing is added behind its back except the base of an implementation.

## ADR-0006 — Abstract blocks only among implementations
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** An abstract block is an implementation never used alone, such as `_react`. Its id starts with `_` exactly when `abstract: true`, its folder sits flat beside its heirs, and it has at least one heir and names none of them. `extends` inherits an abstract base (`react-dom` from `_react`) or builds on a concrete block (`next` on `react-dom`), and names one base either way. Requiring an abstract block is satisfied by any of its heirs. A new abstract block waits for its second heir.
- **Rejected.** Abstract domains or platforms; a block with two bases.
- **Why.** Every rule of a base must hold for every heir, which only a shared technology guarantees. Platforms share properties only in part, so they require property domains instead.

## ADR-0007 — Seam rules live in with/ files
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule that needs two blocks lives in `<block>/with/<other>.md`, in the block it refines, named after a block of its own layer or above — `ui/with/remote-data.md`, `browser/with/a11y.md`. A project receives the file only when both blocks are active. It is the one place a block names a sibling.
- **Rejected.** Conditional sections inside a block's main file.
- **Why.** A file per seam stays readable as seams multiply, and its name says when it applies.

## ADR-0008 — A block owns its brand, language and file names
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A block lists in `owns` the words that belong to it: `_react` owns "React"; `typescript` owns "TypeScript", `.ts` and `index.ts`. A word appears only in its owner, in the blocks that depend on it, and in the `with/` files named after one of these; fenced code is exempt. A standard such as HTTP, JSON or WCAG belongs to no block.
- **Rejected.** Two lists, `brands` and `forms`, for one purpose.
- **Why.** Core and the domains stay free of any language or brand, which is what lets a project in any language follow them.

## ADR-0009 — Every schema is complete
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A block's front matter declares every field of the schema, in the schema's order, with `[]`, `null` or `false` where it has nothing to say; the constitution's check rejects a missing or extra field. `constitution.yaml` lists every key the same way, with `[]` or `{}` where empty, and the hook warns about a missing one.
- **Why.** No reader, hook or check has to guess whether an absent field means empty or forgotten.

## ADR-0010 — Where a rule goes
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule goes to the layer found by asking what must disappear for it to lose its meaning: nothing → core; the project has no UI → `ui`; the code does not run in a browser → `browser`; the code is not React → `_react`. Rules alike across siblings are lifted to a domain or to core when their result and their "how" match, and a property the platforms share becomes a domain they require. A new layer is added only when the new entity combines freely with every element of every existing layer.
- **Why.** Each rule then lives in exactly one block.

## ADR-0011 — A project keeps constitution.yaml and PROJECT.md
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project declares the blocks it follows, its applications, its check command and its overrides in `constitution.yaml`, and describes the product — what it is, for whom, its domains, entities and glossary — in `PROJECT.md`. A project keeps no `DECISIONS.md`: a departure is an override, and git history keeps its record.
- **Rejected.** An assembly named in `PROJECT.md`; `Deviates:` lines in a project log.

## ADR-0012 — A project pins a released version
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `constitution.yaml` pins a released version; until 1.0.0 it pins the current 0.x one. The plugin delivers the rules of its installed version and says so when the pin differs.
- **Rejected.** Delivering the rules of the pinned line, deferred until a need arises.

## ADR-0013 — A project names its check command
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `constitution.yaml` names the one command that runs every check of the repository — `check: bun run check` — and the key is required. `/check` runs it, and the hand-back gate waits for it to pass.

## ADR-0014 — Local blocks
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project may keep blocks under `./rules/` with the same contract as a constitution block and name them in `constitution.yaml` by path. A local block is `status: draft` until a person reviews it, and it moves into the constitution when a second project needs it.

## ADR-0015 — Rules: one format, global slugs
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule is a heading `## <slug> · MUST|SHOULD|MAY`, its statement, then the labels **Why**, **Check** and **Tags**, and **Example** and **Implements** where they are needed. A slug is kebab-case, unique across the whole constitution, carries no number and is never renamed once published; an outdated rule is marked deprecated, and its replacement gets a new slug. Blocks, labels and hook output are written in English.
- **Rejected.** Numbered rules, which shift with every insertion.

## ADR-0016 — No rule names a tool
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** No rule names a tool, at any layer. A rule names the role of its check; the tool's block says which roles it checks and how to build its configuration. The configuration is a separate file — a devkit preset or the project's own — built to hold every active rule of its roles.
- **Rejected.** Tables that map each rule to a setting of a tool.
- **Why.** A tool can then be swapped without touching a rule.

## ADR-0017 — A tool-checked rule names its role
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule's check is `test`, `review`, or `tool — <role>` with a role from a closed list: `format`, `lint`, `types`, `architecture`, `names`, `unused`, `versions`, `tests`, `coverage`, `mutation`, `secrets`, `audit`. A language or an implementation lists the roles it checks in `checks`. When a tool-checked MUST rule's role has no tool for a language the rule applies to, the hook warns and the constitution's check reports it.
- **Why.** Only MUST rules count, so a missing tool for an advisory rule raises no noise.

## ADR-0018 — Every rule carries a lens
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Every rule has at least one tag from a closed list of lenses — `a11y`, `security`, `performance`, `ux` and the rest — so a review can run by lens across all layers at once.

## ADR-0019 — References obey the layers
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** A rule refers to another only through its Implements line, and only to a rule of its own block, of a layer above, or of its closure. A block refers to another only through its front matter and its `with/` file names.
- **Why.** A reference is a dependency, and dependencies point up.

## ADR-0020 — Rules taken from an external review plugin
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The rules of an installed review plugin were inventoried one by one. Those marked to take, or to take in part, and one adapted rule are written into the blocks they belong to, in this constitution's format.

## ADR-0021 — Precedence
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project's override is stronger than any rule. Otherwise the more specific layer wins — implementations, then contexts, then domains, then core — and a block only tightens what is above it. A clash between a platform and a language means the rule is misplaced, and it moves to an implementation or to the project. A request against a MUST is answered with the conflict and an alternative, never obeyed silently.

## ADR-0022 — Overrides: any rule, with consent and a reason
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** An override lowers one rule to SHOULD or MAY — any rule, core MUST included. It is added only with the user's explicit consent in the chat, for that override; `reason` is required and `until` is optional. Written under an application in `apps:`, it applies to that application's files.
- **Rejected.** Rules no override may lower; blanket waivers.

## ADR-0023 — The run time is a shell hook and markdown skills
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The plugin runs only a shell hook and markdown skills. Everything the hook reads is generated here, committed, and verified by regeneration. Nothing from the constitution is installed into a project: no TypeScript, no Bun, no generated configuration.

## ADR-0024 — The run time is language-agnostic
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The hook reads only `constitution.yaml`, the committed index and the front matter of the local blocks the file names. It scans no manifest of any language; `/ratify` lets the agent look at the repository instead.
- **Rejected.** Detecting a project's technology from its files, and a `skip:` key for blocks detected but not declared.
- **Why.** A project in any language, R included, can follow the constitution.

## ADR-0025 — Files, not chapters, in the output
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The digest and the reminders name the files to read, and the agent reads them. No whole chapter passes through the output of a hook or a skill.

## ADR-0026 — The digest is an index
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** At session start and in every sub-agent the hook prints, within Claude Code's 10,000-character cap: a header naming the plugin root, the warnings, core's part, the active blocks grouped by layer — one line each, the path derived from the root, the layer and the id — the active overrides, then MUST headlines while space lasts, a lowered one marked as such.
- **Why.** Every agent receives the rules, sub-agents and sessions after compaction included.

## ADR-0027 — Warnings: one header, one line each
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Warnings come under one header, `⚠️ Warnings`, one line each in a fixed form, `- <code>: <fact> — <fix>`, with a closed list of codes. Only at `startup` does the header ask the agent to tell the user.
- **Rejected.** An emoji on every line.

## ADR-0028 — Generated files are committed only here, in digests/
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The pieces the hook reads are generated into `digests/`, committed, and verified by regeneration. This is the one repository that commits generated files; the `workflow` rules keep forbidding them in projects.

## ADR-0029 — Three skills and one agent
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The plugin ships `/ratify`, `/amend` and `/check [all|edits] [lens]`, and one agent, `reviewer`. The model may invoke `/check` as well as the user. `/upgrade` comes after 1.0.
- **Rejected.** Recipe skills, a skill per block or per lens, and separate commands for the hand-back and for conformance.

## ADR-0030 — root/, adapters/, libs/ and the feature surface
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** `root/` is the composition root, `adapters/` holds port implementations, `libs/` holds project-agnostic code, and a feature's surface is the index at the feature's root.

## ADR-0031 — Every grouping folder has a surface
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Every folder that groups modules has a surface file that re-exports what its consumers may couple to — the module's offer — and nothing else.

## ADR-0032 — Role folders and suffixes follow the reference applications
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The folders named for a role and the file suffixes — `.entity`, `.port`, `.use-case`, `.utils` and the rest — follow the owner's reference web application and API.

## ADR-0033 — composition/ replaces integrations/
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The only code that knows several features lives in `composition/`, and only once a second consumer needs it; until then it lives in the delivery unit that needs it.

## ADR-0034 — What dead code is
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Dead code means unused files, dependencies and internal code. An unused export of a surface is not dead code: a surface offers what its consumers may use.

## ADR-0035 — Coverage is 100 percent on every gated layer
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Every gated layer is held at 100 percent. UI code, and a project that adopts the gate late, reach it through a ratchet floor that only rises.

## ADR-0036 — Lint limits are errors
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** A function holds at most 100 lines, a file 500, and cognitive complexity stays at 10 or below; the linter reports each as an error. Specs have no line limit.

## ADR-0037 — A UI application composes through its providers and binding units
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** In a UI application, providers build the shared transport and configuration, adapters are module objects over them, each binding unit binds its operation's adapter, and tests replace the transport through the test sandbox. It is stated in `ui/with/remote-data.md`.
- **Why.** It is the form of the owner's reference web application.

## ADR-0038 — Vendor libraries stay out of the domain
**Date:** 2026-09-26 · **Status:** Accepted

- **Context.** The first validator of this repository parsed YAML and checked schemas with a validation engine inside its domain code, reading the purity law as "no side effects".
- **Decision.** No vendor library is imported under `domain/`, a pure one included. Parsing a format and checking its wire shape happen in an adapter behind a port, with the wire shapes as that adapter's models, and the domain checks its own rules on the parsed data. The repository's own project-agnostic helpers in `libs/` may be used, as the features of a command-line tool use its kit.
- **Why.** The core imports only itself and the shared kernel, so a vendor's types and upgrades never reach it.

## ADR-0039 — Language and tool specifics live in their blocks
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** What depends on a language lives in that language's block, and what depends on a tool lives in the tool's block. Core states each rule once, by concern.

## ADR-0040 — Failure categories and idempotency apply everywhere
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The two categories of failure and idempotency hold for every application. problem+json belongs to the domain `api`, and expand/contract migrations to `persistence`.

## ADR-0041 — Version control is a domain; git and git flows are implementations
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The domain `version-control` is the base any git flow follows. The implementation `git` carries git's specifics; `lefthook` extends `git`, and so do git-flow frameworks. CI design and the major-bump mechanism stay the owner's separate work.
- **Rejected.** Leaving version control out of the constitution altogether.

## ADR-0042 — Agents are a domain on top of llm
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `agents` is a domain. Its rules about the model sit in `agents/with/llm.md`, and `langgraph` requires `agents`.

## ADR-0043 — Lingui is a block; Paraglide stays local
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `lingui` is the i18n implementation of the constitution. A project that uses Paraglide keeps it as a local block, with no override, until a second project needs it.

## ADR-0044 — One token grammar for ui
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The design-token grammar of the owner's reference web application is the standard of `ui`.

## ADR-0045 — Python configs and tools live in devkit
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The shared configurations of the Python tools live in devkit, under `packages/python/`, beside the TypeScript ones.

## ADR-0046 — The error and logging libraries get their own repository
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The owner's error and logging libraries, first written inside one API, move to a separate repository of runtime libraries.

## ADR-0047 — oxlint is not adopted now
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** oxlint is not adopted now; the current linter keeps holding the lint rules.
