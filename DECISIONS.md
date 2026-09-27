# Decision Log

> A journal of the decisions behind the constitution and the reasoning behind them. **Not a rulebook** — the blocks say *how things are*; this log records *why it was decided and what was rejected*.
>
> **Conventions:** append-only. One entry per decision, numbered. To change a decision, add a **new** entry and mark the old one `Superseded by ADR-NNNN` — never rewrite history. Statuses: `Accepted` · `Proposed` · `Superseded by ADR-NNNN`.
>
> Its entries record the decisions of the constitution 1.0 in theme order, each with the date it was taken.

| Theme | Entries |
|---|---|
| Scope | ADR-0001 |
| Blocks and layers | ADR-0002 – ADR-0008 |
| Project files | ADR-0009 – ADR-0012 |
| Rules and roles | ADR-0013 – ADR-0018 |
| Overrides and precedence | ADR-0019 – ADR-0020 |
| Delivery | ADR-0021 – ADR-0027 |
| The anatomy | ADR-0028 – ADR-0036 |
| The rest | ADR-0037 – ADR-0045 |
| Testing | ADR-0046 – ADR-0049 |
| Code | ADR-0050 – ADR-0052 |
| Core | ADR-0053 – ADR-0063 |
| Blocks | ADR-0064 – ADR-0073 |

---

## ADR-0001 — Not now: versions per block, rules for other AI tools
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The constitution is versioned as a whole, and it is written for Claude Code alone.
- **Why.** Neither has a present consumer.

## ADR-0002 — Four layers: core, domains, contexts, implementations
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Blocks sit in four layers, from the most abstract down: `core`, true for any program; domains, an aspect a project has or has not whatever its technology — `ui`, `api`, `i18n`; contexts, where the code runs (a platform such as `browser` or `cli`) or what it is written in (a language such as `typescript`); and implementations, a framework, library or tool — `react-dom`, `bun`, `git`. A block's `kind` names its layer. There is no `web` block: a browser application is `browser` plus `ui`. Implementations carry no framework, library or tool tag.
- **Why.** Each layer combines freely with every element of the others and reduces to none of them; a combination lives in the more specific block or in a seam file.

## ADR-0003 — Two links between blocks: requires and extends
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `requires` names a block that must also be active; it points up the layers, or to a peer implementation the block cannot work without. `extends` joins implementations only, and the base comes with its heir. A domain requires nothing, since above it is only core, which is always active. A tool never adds a domain: the project lists every domain, environment properties such as `untrusted-client` included. Choosing a tool, or using one that has no block, is not a departure.
- **Rejected.** An `activates` link through which a platform switched domains on, and inheritance from several bases.
- **Why.** Every block a project follows stays visible in its own file; nothing is added behind its back except the base of an implementation.

## ADR-0004 — Abstract blocks only among implementations
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** An abstract block is an implementation never used alone, such as `_react`. Its id starts with `_` exactly when `abstract: true`, its folder sits flat beside its heirs, and it has at least one heir and names none of them. `extends` inherits an abstract base (`react-dom` from `_react`) or builds on a concrete block (`next` on `react-dom`), and names one base either way. Requiring an abstract block is satisfied by any of its heirs. A new abstract block waits for its second heir.
- **Rejected.** Abstract domains or platforms; a block with two bases.
- **Why.** Every rule of a base must hold for every heir, which only a shared technology guarantees. Platforms share properties only in part, so they require property domains instead.

## ADR-0005 — Seam rules live in with/ files
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule that needs two blocks lives in `<block>/with/<other>.md`, in the block it refines, named after a block of its own layer or above — `ui/with/remote-data.md`, `browser/with/a11y.md`. A project receives the file only when both blocks are active. It is the one place a block names a sibling.
- **Rejected.** Conditional sections inside a block's main file.
- **Why.** A file per seam stays readable as seams multiply, and its name says when it applies.

## ADR-0006 — A block owns its brand, language and file names
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A block lists in `owns` the words that belong to it: `_react` owns "React"; `typescript` owns "TypeScript", `.ts` and `index.ts`. A word appears only in its owner, in the blocks that depend on it, and in the `with/` files named after one of these; fenced code is exempt. A standard such as HTTP, JSON or WCAG belongs to no block.
- **Rejected.** Two lists, `brands` and `forms`, for one purpose.
- **Why.** Core and the domains stay free of any language or brand, which is what lets a project in any language follow them.

## ADR-0007 — Every schema is complete
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A block's front matter declares every field of the schema, in the schema's order, with `[]`, `null` or `false` where it has nothing to say; the constitution's check rejects a missing or extra field. `constitution.yaml` lists every key the same way, with `[]` or `{}` where empty, and the hook warns about a missing one.
- **Why.** No reader, hook or check has to guess whether an absent field means empty or forgotten.

## ADR-0008 — Where a rule goes
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule goes to the layer found by asking what must disappear for it to lose its meaning: nothing → core; the project has no UI → `ui`; the code does not run in a browser → `browser`; the code is not React → `_react`. Rules alike across siblings are lifted to a domain or to core when their result and their "how" match, and a property the platforms share becomes a domain they require. A new layer is added only when the new entity combines freely with every element of every existing layer.
- **Why.** Each rule then lives in exactly one block.

## ADR-0009 — A project keeps constitution.yaml and PROJECT.md
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project declares the blocks it follows, its applications, its check command and its overrides in `constitution.yaml`, and describes the product — what it is, for whom, its domains, entities and glossary — in `PROJECT.md`. A project keeps no `DECISIONS.md`: a departure is an override, and git history keeps its record.

## ADR-0010 — A project pins a released version
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `constitution.yaml` pins a released version; until 1.0.0 it pins the current 0.x one. The plugin delivers the rules of its installed version and says so when the pin differs.
- **Rejected.** Delivering the rules of the pinned line, deferred until a need arises.

## ADR-0011 — A project names its check command
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `constitution.yaml` names the one command that runs every check of the repository — `check: bun run check` — and the key is required. `/check` runs it, and the hand-back gate waits for it to pass.

## ADR-0012 — Local blocks
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project may keep blocks under `./rules/` with the same contract as a constitution block and name them in `constitution.yaml` by path. A local block is `status: draft` until a person reviews it, and it moves into the constitution when a second project needs it.

## ADR-0013 — Rules: one format, global slugs
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule is a heading `## <slug> · MUST|SHOULD|MAY`, its statement, then the labels **Why**, **Check** and **Tags**, and **Example** and **Implements** where they are needed. A slug is kebab-case, unique across the whole constitution, carries no number and is never renamed once published; an outdated rule is marked deprecated, and its replacement gets a new slug. Blocks, labels and hook output are written in English.
- **Rejected.** Numbered rules, which shift with every insertion.

## ADR-0014 — No rule names a tool
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** No rule names a tool, at any layer. A rule names the role of its check; the tool's block says which roles it checks and how to build its configuration. The configuration is a separate file — a devkit preset or the project's own — built to hold every active rule of its roles.
- **Rejected.** Tables that map each rule to a setting of a tool.
- **Why.** A tool can then be swapped without touching a rule.

## ADR-0015 — A tool-checked rule names its role
**Date:** 2026-09-25 · **Status:** Superseded by ADR-0054

- **Decision.** A rule's check is `test`, `review`, or `tool — <role>` with a role from a closed list: `format`, `lint`, `types`, `architecture`, `names`, `unused`, `versions`, `tests`, `coverage`, `mutation`, `secrets`, `audit`. A language or an implementation lists the roles it checks in `checks`. When a tool-checked MUST rule's role has no tool for a language the rule applies to, the hook warns and the constitution's check reports it.
- **Why.** Only MUST rules count, so a missing tool for an advisory rule raises no noise.

## ADR-0016 — Every rule carries a lens
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Every rule has at least one tag from a closed list of lenses — `a11y`, `security`, `performance`, `ux` and the rest — so a review can run by lens across all layers at once.

## ADR-0017 — References obey the layers
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** A rule refers to another only through its Implements line, and only to a rule of its own block, of a layer above, or of its closure. A block refers to another only through its front matter and its `with/` file names.
- **Why.** A reference is a dependency, and dependencies point up.

## ADR-0018 — Rules taken from an external review plugin
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The rules of an installed review plugin were inventoried one by one. Those marked to take, or to take in part, and one adapted rule are written into the blocks they belong to, in this constitution's format.

## ADR-0019 — Precedence
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project's override is stronger than any rule. Otherwise the more specific layer wins — implementations, then contexts, then domains, then core — and a block only tightens what is above it. A clash between a platform and a language means the rule is misplaced, and it moves to an implementation or to the project. A request against a MUST is answered with the conflict and an alternative, never obeyed silently.

## ADR-0020 — Overrides: any rule, with consent and a reason
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** An override lowers one rule to SHOULD or MAY — any rule, core MUST included. It is added only with the user's explicit consent in the chat, for that override; `reason` is required and `until` is optional. Written under an application in `apps:`, it applies to that application's files.
- **Rejected.** Rules no override may lower; blanket waivers.

## ADR-0021 — The run time is a shell hook and markdown skills
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The plugin runs only a shell hook and markdown skills. Everything the hook reads is generated here, committed, and verified by regeneration. Nothing from the constitution is installed into a project: no TypeScript, no Bun, no generated configuration.

## ADR-0022 — The run time is language-agnostic
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The hook reads only `constitution.yaml`, the committed index and the front matter of the local blocks the file names. It scans no manifest of any language; `/ratify` lets the agent look at the repository instead.
- **Rejected.** Detecting a project's technology from its files, and a `skip:` key for blocks detected but not declared.
- **Why.** A project in any language, R included, can follow the constitution.

## ADR-0023 — Files, not chapters, in the output
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The digest and the reminders name the files to read, and the agent reads them. No whole chapter passes through the output of a hook or a skill.

## ADR-0024 — The digest is an index
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** At session start and in every sub-agent the hook prints, within Claude Code's 10,000-character cap: a header naming the plugin root, the warnings, core's part, the active blocks grouped by layer — one line each, the path derived from the root, the layer and the id — the active overrides, then MUST headlines while space lasts, a lowered one marked as such.
- **Why.** Every agent receives the rules, sub-agents and sessions after compaction included.

## ADR-0025 — Warnings: one header, one line each
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Warnings come under one header, `⚠️ Warnings`, one line each in a fixed form, `- <code>: <fact> — <fix>`, with a closed list of codes. Only at `startup` does the header ask the agent to tell the user.
- **Rejected.** An emoji on every line.

## ADR-0026 — Generated files are committed only here, in digests/
**Date:** 2026-09-25 · **Status:** Superseded by ADR-0062

- **Decision.** The pieces the hook reads are generated into `digests/`, committed, and verified by regeneration. This is the one repository that commits generated files; the `workflow` rules keep forbidding them in projects.

## ADR-0027 — Three skills and one agent
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The plugin ships `/ratify`, `/amend` and `/check [all|edits] [lens]`, and one agent, `reviewer`. The model may invoke `/check` as well as the user. `/upgrade` comes after 1.0.
- **Rejected.** Recipe skills, a skill per block or per lens, and separate commands for the hand-back and for conformance.

## ADR-0028 — root/, adapters/, libs/ and the feature surface
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** `root/` is the composition root, `adapters/` holds port implementations, `libs/` holds project-agnostic code, and a feature's surface is the index at the feature's root.

## ADR-0029 — Every grouping folder has a surface
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Every folder that groups modules has a surface file that re-exports what its consumers may couple to — the module's offer — and nothing else.

## ADR-0030 — Role folders and suffixes follow the reference applications
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The folders named for a role and the file suffixes — `.entity`, `.port`, `.use-case`, `.utils` and the rest — follow the owner's reference web application and API.

## ADR-0031 — composition/ replaces integrations/
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The only code that knows several features lives in `composition/`, and only once a second consumer needs it; until then it lives in the delivery unit that needs it.

## ADR-0032 — What dead code is
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Dead code means unused files, dependencies and internal code. An unused export of a surface is not dead code: a surface offers what its consumers may use.

## ADR-0033 — Coverage is 100 percent on every gated layer
**Date:** 2026-09-24 · **Status:** Superseded by ADR-0048

- **Decision.** Every gated layer is held at 100 percent. UI code, and a project that adopts the gate late, reach it through a ratchet floor that only rises.

## ADR-0034 — Lint limits are errors
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** A function holds at most 100 lines, a file 500, and cognitive complexity stays at 10 or below; the linter reports each as an error. Specs have no line limit.

## ADR-0035 — A UI application composes through its providers and binding units
**Date:** 2026-09-25 · **Status:** Superseded by ADR-0066

- **Decision.** In a UI application, providers build the shared transport and configuration, adapters are module objects over them, each binding unit binds its operation's adapter, and tests replace the transport through the test sandbox. It is stated in `ui/with/remote-data.md`.
- **Why.** It is the form of the owner's reference web application.

## ADR-0036 — Vendor libraries stay out of the domain
**Date:** 2026-09-26 · **Status:** Accepted

- **Context.** The first validator of this repository parsed YAML and checked schemas with a validation engine inside its domain code, reading the purity law as "no side effects".
- **Decision.** No vendor library is imported under `domain/`, a pure one included. Parsing a format and checking its wire shape happen in an adapter behind a port, with the wire shapes as that adapter's models, and the domain checks its own rules on the parsed data. The repository's own project-agnostic helpers in `libs/` may be used, as the features of a command-line tool use its kit.
- **Why.** The core imports only itself and the shared kernel, so a vendor's types and upgrades never reach it.

## ADR-0037 — Language and tool specifics live in their blocks
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** What depends on a language lives in that language's block, and what depends on a tool lives in the tool's block. Core states each rule once, by concern.

## ADR-0038 — Failure categories and idempotency apply everywhere
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The two categories of failure and idempotency hold for every application. problem+json belongs to the domain `api`, and expand/contract migrations to `persistence`.

## ADR-0039 — Version control is a domain; git and git flows are implementations
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The domain `version-control` is the base any git flow follows. The implementation `git` carries git's specifics; `lefthook` extends `git`, and so do git-flow frameworks. CI design and the major-bump mechanism stay the owner's separate work.
- **Rejected.** Leaving version control out of the constitution altogether.

## ADR-0040 — Agents are a domain on top of llm
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `agents` is a domain. Its rules about the model sit in `agents/with/llm.md`, and `langgraph` requires `agents`.

## ADR-0041 — Lingui is a block; Paraglide stays local
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `lingui` is the i18n implementation of the constitution. A project that uses Paraglide keeps it as a local block, with no override, until a second project needs it.

## ADR-0042 — One token grammar for ui
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The design-token grammar of the owner's reference web application is the standard of `ui`.

## ADR-0043 — Python configs and tools live in devkit
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The shared configurations of the Python tools live in devkit, under `packages/python/`, beside the TypeScript ones.

## ADR-0044 — The error and logging libraries get their own repository
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The owner's error and logging libraries, first written inside one API, move to a separate repository of runtime libraries.

## ADR-0045 — oxlint is not adopted now
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** oxlint is not adopted now; the current linter keeps holding the lint rules.

## ADR-0046 — A spec proves the behaviour of a boundary
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A spec proves one boundary — a use case, a command, an adapter, a screen, a reusable component, a library primitive, a module of pure rules — and is named after it. What a boundary uses is proven through its spec; a helper gets a spec of its own only when its logic is worth cases of its own, and is then a module of pure rules. A case checks what a caller observes — a returned value, a changed state, what a user sees — and a call on a fake only when the call is the behaviour. Types, constants, schemas, composition, entry files, generated files and third-party code get no spec; a constant does only when a reader outside the code relies on it, as one table. Unit tests prove the domain with fakes; integration tests prove each adapter against the real engine in a sandbox, in `<name>.integration.spec`, one case for each port operation and each failure it maps; end-to-end tests prove each critical scenario the project names, through the delivery layer. A file in `__tests__/`, or in the folder of end-to-end specs, is a spec named after the file or the scenario it proves (`<name>.spec`, `<name>.integration.spec`, `<name>.e2e.spec`), a fake (`<port>.fake`) or fixtures (`<name>.fixtures`), and nothing else: a spec named otherwise would not run. The linter holds the names.
- **Rejected.** One spec per source file; checking the calls of mocks; the `fake-<port>` prefix.
- **Why.** A spec per file mirrors the layout, not the behaviour: it breaks when a helper moves and the behaviour stays, and its cases repeat what the boundary's spec already proves (#49).

## ADR-0047 — A case earns its place, and mutation measures the tests
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A case earns its place by failing for a plausible bug no other case catches; a case that cannot — a restated constant, a check of the library or the framework, a duplicate — is deleted. Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment. A bug fix begins with the test that reproduces the bug. When a behaviour is described before it is built, in an issue or a plan, an agent writes its tests from the description first; a person may write the code first. Mutation testing measures the tests, and every mutant of the logic is killed: a mutant no behaviour can tell apart is marked in the code, with its reason, as equivalent; any other survivor fails the run. It runs in the check over the files a change touches, reusing the results of earlier runs. A mutant in code no test runs survives, so the rule also holds every line of logic to a test.
- **Rejected.** Test-first as a mandate for every change; coverage as the measure of how good the tests are; a mutation score below 100 percent as a floor.
- **Why.** A test never seen failing may test nothing, and a suite that lets mutants live is weaker than its coverage says.

## ADR-0048 — Coverage is a tripwire at 100 percent of the logic
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** All logic — the domain, the adapters, the libraries, the UI — is held at 100 percent of lines and functions, and of branches where the runner measures them, reached only through the tests of its boundaries. A line no behaviour reaches is a behaviour without its test, or code nothing needs, which is deleted; it is never a reason for a test of its own. Excluded: the entry, an entrypoint's entry file, the wiring file, generated files, declarations and vendored code. There is no ratchet: a project below 100 percent breaks the rule like any other, the hook and the check say so, and a project that skips it on purpose records an override with its reason.
- **Rejected.** A floor that only rises; a percentage per layer; a gate on the domain alone.
- **Why.** Tests of behaviour at the boundaries reach every line a caller can reach, so the gate costs nothing extra and catches dead code and a missing behaviour test.

## ADR-0049 — UI is tested the way a user uses it
**Date:** 2026-09-26 · **Status:** Superseded by ADR-0067

- **Decision.** A screen is a boundary: its spec renders it with fakes of its use cases and proves each data state — loading, empty, error, content — each interaction that changes something, each message the user sees and each navigation. A reusable component's spec proves the variants that change behaviour or meaning, keyboard, focus and ARIA. Elements are found by role, label and text, never by class or internal state, so a test changes only when behaviour does, and a change of behaviour updates its spec in the same change. Every screen and component spec runs an accessibility scan with zero violations. Appearance is compared by screenshot only where the look is the contract, in a design system.
- **Rejected.** A coverage floor for UI; snapshots of the DOM.
- **Why.** A test written against what the user sees survives refactoring and fails when the user's experience changes.

## ADR-0050 — Absence is undefined, and the tools hold it
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** Internal code spells absence as `undefined`. `null` lives only in wire types and in the adapters, which map it to `undefined`, and where a platform API returns it, which the code compares and never passes on. The compiler runs with `exactOptionalPropertyTypes`; the linter forbids `==` with `null` and, through a GritQL rule, any `null` outside the adapters but a comparison. devkit's presets carry the three, so every project gets them.
- **Rejected.** Holding the rule by review alone; banning every `null`, comparisons included.
- **Why.** Two spellings of absence make every check ask twice, and a rule held only by review slips.

## ADR-0051 — A file carries its role's suffix
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A file carries its role's suffix, whatever its folder: `.entity`, `.error`, `.repository`, `.port`, `.adapter` for a port's implementation that is not a repository, `.use-case`, `.utils`, `.types`, `.constants`, `.model`, `.config`, the suffixes a block adds, and those a project adds for its own roles. A surface, the entry, a name a framework or tool fixes, a component file named after its component, a member of a set whose role has no suffix and a registry carry none. In `__tests__/` a spec is named after the file it proves plus `.spec`, the one place a double suffix appears, beside `<port>.fake` and `<name>.fixtures`.
- **Why.** The name tells the role before the file is opened, and a tool can check it.

## ADR-0052 — A layer folder is a container without a surface
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** Outside a folder, a caller imports only its surface; inside, files import each other directly and never their own folder's surface. A folder of one role — `entities`, `contracts`, `use-cases`, `queries`, `commands`, `repositories`, `components`, `utils`, `models` — and each module inside it has a surface. A layer folder (`domain/`, `app/`, `infra/`, `adapters/`, `ui/`) and an area folder (`src/`, `features/`, `libs/`) is never an import target and has none: a caller imports the role folder inside it.
- **Rejected.** A surface that aggregates a layer; Biome's `noPrivateImports`, which demands a surface at every level.
- **Why.** An import names the role it couples to, and no aggregate hides an edge the layer rules forbid.

## ADR-0053 — A rule's level says how plainly it is wrong to break it
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A rule is MUST where a violation is plainly wrong and the answer is yes or no, most often given by a tool; SHOULD where following it takes judgement or has reasonable exceptions; MAY where it names a permitted choice. SHOULD is the default.
- **Rejected.** Every rule MUST, which fills the digest, multiplies warnings and makes every change a major release; every rule SHOULD, which leaves the digest and the warnings nothing to say.
- **Why.** The level decides what the digest shows, which rules raise warnings and which changes are major, so it has to mean the same thing in every block.

## ADR-0054 — The check roles of 1.0
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A rule's check is `test`, `review`, or `tool — <role>` with a role from this closed list: `format`, `lint`, `types`, `architecture`, `names`, `unused`, `versions`, `tests`, `coverage`, `mutation`, `secrets`, `audit`, `commits`. `names`, `secrets` and `commits` hold in any language; the others are checked per language. A language or an implementation lists the roles it checks in `checks`. When a tool-checked MUST rule's role has no tool for a language the rule applies to, the hook warns and the constitution's check reports it.
- **Rejected.** Checking commit messages and branch names under `lint`, which is checked per language and would report a missing tool for every language.
- **Why.** A commit message belongs to no language, and a rule held by a tool must say so to be counted.

## ADR-0055 — The laws of 1.0
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The laws are the MUST rules of `principles`, and the only MUST rules there. The fourteen laws of 0.8 stay; mechanical enforcement becomes the law that every rule whose check names a role is held by a tool of that role; extension by addition, contracts shaped by the role that uses them, and untrusted input parsed once at the edge join them.
- **Rejected.** Dropping mechanical enforcement as a mechanism rather than a law.
- **Why.** Each of the added three was already required by several blocks; as laws they are stated once and bind everywhere.

## ADR-0056 — version-control holds what is true of any version control
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The domain `version-control` holds only the rules that hold for any version control: an atomic change, a change that passes the checks before it is integrated, a protected main line. Everything about git — commit messages, branch names, worktrees, its commands — belongs to the implementation `git`.
- **Why.** A rule that names a git concept loses its meaning without git, so it belongs to the git block.

## ADR-0057 — A block never cites the decision log
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A block states its rules, with their reasons, without citing an entry of this log; the constitution's check reports a citation.
- **Why.** A rule must stand on its own when a project reads it, and the log explains the constitution's history, not a project's duty.

## ADR-0058 — Placement lifts on the second consumer, abstraction waits for the third
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Code moves to the nearest common level when a second consumer needs it; a shared abstraction over similar code waits for its third occurrence. Don't-repeat-yourself applies to knowledge, not to text that looks alike.
- **Rejected.** One threshold for both, which either shares code too late or abstracts it too early.
- **Why.** Moving code changes where it lives, not what it means; an abstraction commits to an axis of variation, which two cases cannot yet show.

## ADR-0059 — The wiring file is root/wiring
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The one file of `root/` that instantiates and binds what an application shares is named `wiring`, with the language's extension.
- **Why.** One name in every repository lets a reader, a coverage exclusion and a layer rule find it without asking.

## ADR-0060 — A YAML file ends in .yaml
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A YAML file ends in `.yaml`, never `.yml`, in every repository; the `names` role holds it.
- **Why.** One spelling of one format lets every glob, tool and reader find all of them.

## ADR-0061 — How a UI is tested belongs to the interface blocks
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Core's `testing` counts a screen and a reusable component among the boundaries and holds the UI to the coverage gate. How a screen and a component are proven — the data states, finding elements by role, label and text, screenshots only where the look is the contract — is stated by `ui`, and the accessibility scan with zero violations by `a11y`.
- **Rejected.** Stating them in core, which would give a program with no interface rules about screens.
- **Why.** A rule that loses its meaning without an interface belongs to the block of the interface.

## ADR-0062 — Generated files are not committed by default, and the check only checks
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A project does not commit generated files by default; an application that commits some of them chooses which. The check verifies and never changes a tracked file: it generates, formats and rewrites nothing. This repository commits `digests/`, and its check compares them with their regeneration without writing them.
- **Rejected.** Forbidding every committed generated file in projects; a check that regenerates what it checks.
- **Why.** Which generated file is worth committing depends on the application, and a check that writes can pass by changing what it checks.

## ADR-0063 — Only a person commits
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Only a person decides what is committed. The main agent commits only when a person asks it to; a sub-agent never commits and only does the work it is given. No agent merges or pushes to the main line.
- **Rejected.** Letting a sub-agent commit on the working branch.
- **Why.** A commit records a decision under a person's name, so the person makes it.

## ADR-0064 — The release automation's commit is the one change that skips review
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Every change reaches the main line through a reviewed pull request, except the release automation's version commit and its tag, which it pushes after a merge.
- **Rejected.** A pull request for every version bump, which a person would approve without reading.
- **Why.** The version commit holds only what the merged, reviewed changes already decided.

## ADR-0065 — Three rules of the review plugin hold in any language
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A value with a unit carries it in its name; code and dependencies that only tests reach are unused; a dependency deprecated as a whole is replaced. They are core rules, not rules of one language.
- **Rejected.** Keeping them in the language block until a second language repeats them.
- **Why.** What must disappear for them to lose their meaning is nothing, so by the placement question they belong to core.

## ADR-0066 — An adapter receives its transport
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** An adapter is built by a factory from the transport and clients it speaks through, and never imports a shared instance — in every kind of application, a user interface included. In a UI application the providers are the composition root: they build the configuration, the transport and the cache client, build each adapter from the transport, and hand the adapters to the binding units.
- **Rejected.** Adapters as module objects over a shared transport instance, which the reference web application used.
- **Why.** An adapter that receives its dependencies can be given another in a test or another application, and the composition root stays the one place that makes a concrete choice.

## ADR-0067 — UI is tested the way a user uses it, over the real adapters
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A screen is a boundary: its spec renders it inside its providers, with the transport replaced by captured responses, and proves each data state — loading, empty, error, content — each interaction that changes something, each message the user sees and each navigation. Fakes of use-cases serve only a screen that shows no remote data. A reusable component's spec proves the variants that change behaviour or meaning, keyboard, focus and accessible name, role and state. Elements are found by role, label and text, never by class or internal state. Every screen and component spec runs an accessibility scan with zero violations. Appearance is compared by screenshot only where the look is the contract, in a design system.
- **Rejected.** Faking a screen's use-cases, which never sees a response the mapping gets wrong; a coverage floor for UI; snapshots of the DOM.
- **Why.** A spec written against what the user sees, over the real binding units and adapters, fails when the user's experience or the data they receive changes.

## ADR-0068 — The commit hooks check commits; no separate message tool
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The commit hooks' shared preset checks commit messages and branch names, so `lefthook` checks the `commits` role. No separate message tool is adopted, and the pull request title typed on the forge is checked by a way still to be chosen.
- **Rejected.** A separate commit-message tool beside the hooks.
- **Why.** The hooks already hold the formats in every repository; a second tool would hold the same rules twice.

## ADR-0069 — `#/` is declared in package.json and mirrored in tsconfig
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The `#/` alias is declared in `imports` of `package.json`, and `paths` in `tsconfig.json` repeats it word for word. No bundler alias.
- **Rejected.** `imports` alone, which the compiler cannot use to resolve a folder's surface (`#/kernel`); importing every surface by its file (`#/kernel/index.ts`); fallback targets in `imports`, which the runtime does not follow.
- **Why.** The runtime and the compiler resolve differently today; one source and one mirror, identical on sight, is the least that works for both.

## ADR-0070 — The Compiler memoises; an effect's callback is an effect event
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** React code writes no `useMemo`, `useCallback` or `memo`: the React Compiler memoises. The linter's exhaustive-dependencies rule stays on; a function an effect calls but must not re-run on is wrapped in `useEffectEvent`, and a suppression with its reason is the last resort.
- **Rejected.** Turning the rule's stability check off because the Compiler memoises, which would also stop it catching a missing dependency.
- **Why.** The ban on manual memoisation and the exhaustive-dependencies rule then both hold, with no function wrapped only to quiet the linter.

## ADR-0071 — Four commit types, and `!` for a breaking change
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Commits follow Conventional Commits 1.0.0 with the types `feat`, `fix`, `refactor` and `chore`; a breaking change is marked by `!` before the colon. No scope. The subject starts with a capital letter. The branch prefixes and the release pipelines stay as they are until the git strategy is chosen.
- **Rejected.** The eleven types of the common convention (`perf`, `docs`, `ci`, `build`, `test`, `style`, `revert`…), which the changelog ignores and the history barely uses; scopes, which a single changelog does not read; a `BREAKING CHANGE` footer, since commit bodies stay empty.
- **Why.** `feat` and `fix` are what the specification and the changelog read; `chore` carries the automation's own commits; `refactor` promises what a reviewer can check — no change of behaviour.

## ADR-0072 — A tool's configuration does not name the rules it holds
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A tool block says which roles it checks and what its configuration holds. The configuration — a devkit preset, a project's own file — carries no link to the slugs of the rules it holds: no comment per setting, no rule named after its slug.
- **Rejected.** Naming each setting's slug in a comment, or each dependency-cruiser rule after its slug: nothing would check the names, and they would drift.
- **Why.** The block's text is the one place the constitution and the tool meet; a second mapping in every configuration is a detail nobody keeps.

## ADR-0073 — The constitution carries the presets that name its folders
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A tool preset whose rules name the constitution's folders, files or suffixes — Biome's plugins scoped to `adapters/` or `.hooks.ts`, dependency-cruiser's layer sets — ships in the constitution's own package as `@droneey/constitution/<tool>`, in the version of its blocks. devkit's presets hold only what any team can take. A spec fails when the constitution's preset names a folder or suffix its blocks do not write.
- **Rejected.** Keeping that preset in devkit, where the folders are written a second time and a rename switches a rule off unnoticed; generating devkit's preset from the blocks, a build between two repositories.
- **Why.** A folder renamed in a block and in its preset changes in one pull request and ships in one version, and a project pinned to a version of the constitution gets that version's preset.
