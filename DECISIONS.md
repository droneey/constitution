# Decision Log

> A journal of the decisions behind the constitution and the reasoning behind them. **Not a rulebook** — the blocks say *how things are*; this log records *why it was decided and what was rejected*.
>
> **Conventions:** one entry per decision, numbered, and only decisions in force. A new decision is a new entry; the entry it replaces is deleted, and one it changes in part loses that part. Statuses: `Accepted` · `Proposed`.
>
> Its entries record the decisions of the constitution 1.0 in theme order, each with the date it was taken.

| Theme | Entries |
|---|---|
| Scope | ADR-0001 |
| Blocks and layers | ADR-0002 – ADR-0008 |
| Project files | ADR-0009 – ADR-0012, ADR-0102 |
| Rules and roles | ADR-0013 – ADR-0018 |
| Overrides and precedence | ADR-0019 – ADR-0020 |
| Delivery | ADR-0021 – ADR-0027 |
| The anatomy | ADR-0028 – ADR-0036 |
| The rest | ADR-0037 – ADR-0045 |
| Testing | ADR-0046 – ADR-0048 |
| Code | ADR-0050 – ADR-0052 |
| Core | ADR-0053 – ADR-0063 |
| Blocks | ADR-0064 – ADR-0074, ADR-0092, ADR-0095 |
| Tools and tests | ADR-0077 – ADR-0087, ADR-0096 – ADR-0097, ADR-0099 – ADR-0101, ADR-0103, ADR-0105 |
| Axes | ADR-0088 – ADR-0091, ADR-0093 – ADR-0094, ADR-0098 |
| The 2026 audits | ADR-0104, ADR-0106 – ADR-0115 |
| A real application | ADR-0116 – ADR-0123 |
| Delivery of the constitution | ADR-0124 |
| Repositories of packages | ADR-0125 |
| Line width and licences | ADR-0126 |
| Python | ADR-0127 – ADR-0129 |
| TypeScript configuration | ADR-0130, ADR-0131, ADR-0133 |
| Scripts of the check | ADR-0132 |

---

## ADR-0001 — Not now: versions per block, rules for other AI tools
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The constitution is versioned as a whole, and it is written for Claude Code alone.
- **Why.** Neither has a present consumer.

## ADR-0002 — Four layers: core, domains, contexts, implementations
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Blocks sit in four layers, from the most abstract down: `core`, true for any program; domains, an aspect a project has or has not whatever its technology — `ui`, `api`, `i18n`; contexts, where the code runs (a platform such as `browser` or `cli`) or what it is written in (a language such as `typescript`); and implementations, a framework, library or tool — `react-dom`, `bun`, `git`. There is no `web` block: a browser application is `browser` plus `ui`. Implementations carry no framework, library or tool tag.
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

- **Decision.** A rule that needs two blocks lives in `<block>/<axis>/with/<other>.md`, in the block it refines, named after a block of its own layer or above — `ui/architecture/with/remote-data.md`, `browser/foundation/with/a11y.md`. A project receives the file only when both blocks are active. It is the one place a block names a sibling.
- **Rejected.** Conditional sections inside a block's main file.
- **Why.** A file per seam stays readable as seams multiply, and its name says when it applies.

## ADR-0006 — A block owns its brand, language and file names
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A block lists in `dictionary` the words that belong to it: `_react` owns "React"; `typescript` owns "TypeScript", `.ts` and `index.ts`. A word appears only in its owner, in the blocks that depend on it, and in the `with/` files named after one of these; fenced code is exempt. A standard such as HTTP, JSON or WCAG belongs to no block.
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

- **Decision.** A project may keep blocks under `./rules/` with the same contract as a constitution block and name them in `constitution.yaml` by path. A local block moves into the constitution when a second project needs it.

## ADR-0013 — Rules: one format, global slugs
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule is a heading with its slug, its statement, and an **Example** where one is needed; ADR-0089 gives the heading and the table under the statement. A slug is kebab-case, unique across the whole constitution, carries no number and is never renamed once published; an outdated rule is marked deprecated, and its replacement gets a new slug. Blocks, labels and hook output are written in English.
- **Rejected.** Numbered rules, which shift with every insertion.

## ADR-0014 — No rule above the implementations names a tool
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** No rule of core, a domain or a context names a tool, and no rule's check does: a rule names the role of its check; the tool's block says which roles it checks and how to build its configuration. The configuration is a separate file — a preset of the constitution's release archive or the project's own — built to hold every active rule of its roles.
- **Rejected.** A rule that names its tool or its setting; the preset's `bindings.yaml`, ADR-0094, maps them instead.
- **Why.** A tool can then be swapped without touching a rule.

## ADR-0017 — References obey the layers
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** A rule refers to another only through the `→` of its heading, and only to a rule of its own block, of a layer above, or of its closure. A block refers to another only through its front matter and its `with/` file names.
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

- **Decision.** The plugin runs only a shell hook and markdown skills. Everything the hook reads is generated here, committed, and verified by regeneration. The plugin installs nothing into a project: no TypeScript, no Bun, no generated configuration.

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

- **Decision.** At session start and in every sub-agent the hook prints, within Claude Code's 10,000-character cap: a header naming the plugin root, the warnings, core's part, the active blocks grouped by layer — one line each, the path derived from the root, the layer and the id — and the active overrides. It carries no rule's text: the agent reads the block files it names, and the reminders name the MUST rules of the blocks that govern a file, a lowered one marked as such.
- **Rejected.** MUST headlines while space lasts: a real web project's take about 36 KB against a budget of 9.4 KB, so only the smallest blocks that came first fitted, and a partial list read as if the rest mattered less.
- **Why.** Every agent receives the rules, sub-agents and sessions after compaction included.

## ADR-0025 — Warnings: one header, one line each
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Warnings come under one header, `⚠️ Warnings`, one line each in a fixed form, `- <code>: <fact> — <fix>`, with a closed list of codes. Only at `startup` does the header ask the agent to tell the user.
- **Rejected.** An emoji on every line.

## ADR-0027 — Three skills and one agent
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The plugin ships `/ratify`, `/amend` and `/check [all|edits] [lens]`, and one agent, `reviewer`. The model may invoke `/check` as well as the user. `/upgrade` comes after 1.0.
- **Rejected.** Recipe skills, a skill per block or per lens, and separate commands for the hand-back and for conformance.

## ADR-0028 — root/, adapters/, libs/ and the feature surface
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** `root/` is the composition root, `adapters/` holds port implementations, `libs/` holds project-agnostic code, and a feature's surface is the index at the feature's root.

## ADR-0030 — Role folders and suffixes follow the reference applications
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The folders named for a role and the file suffixes — `.entity`, `.port`, `.use-case`, `.utils` and the rest — follow the owner's reference web application and API.

## ADR-0031 — composition/ replaces integrations/
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The only code that knows several features lives in `composition/`, and only once a second consumer needs it; until then it lives in the delivery unit that needs it.

## ADR-0032 — What dead code is
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Dead code means unused files, dependencies and internal code. An unused export of a surface is not dead code: a surface offers what its consumers may use.

## ADR-0034 — Lint limits are errors
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** A function holds at most 100 lines, a file 500, and cognitive complexity stays at 10 or below; the linter reports each as an error. Specs have no line limit.

## ADR-0036 — Vendor libraries stay out of the domain
**Date:** 2026-09-26 · **Status:** Accepted

- **Context.** The first validator of this repository parsed YAML and checked schemas with a validation engine inside its domain code, reading the purity law as "no side effects".
- **Decision.** No vendor library is imported under `domain/`, a pure one included. Parsing a format and checking its wire shape happen in an adapter behind a port, with the wire shapes as that adapter's models, and the domain checks its own rules on the parsed data.
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

## ADR-0044 — The error and logging libraries get their own repository
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** The owner's error and logging libraries, first written inside one API, move to a separate repository of runtime libraries.

## ADR-0045 — oxlint is not adopted now
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** oxlint is not adopted now; the current linter keeps holding the lint rules.

## ADR-0046 — A spec proves the behaviour of a boundary
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A spec proves one boundary — a use case, a command, an adapter, a screen, a reusable component, a library primitive, a module of pure rules — and is named after it. What a boundary uses is proven through its spec; a helper gets a spec of its own only when its logic is worth cases of its own, and is then a module of pure rules. A case checks what a caller observes — a returned value, a changed state, what a user sees — and a call on a fake only when the call is the behaviour. Types, constants, schemas, composition, entry files, generated files and third-party code get no spec; a constant does only when a reader outside the code relies on it, as one table. Unit tests prove the domain with fakes; integration tests prove each adapter against the real engine in a sandbox, in `<name>.integration.test`, one case for each port operation and each failure it maps; end-to-end tests prove each critical scenario the project names, through the delivery layer. A file in `__tests__/`, or in the folder of end-to-end specs, is a spec named after the file or the scenario it proves (`<name>.test`, `<name>.integration.test`, `<name>.e2e.test`), a fake (`<port>.fake`) or fixtures (`<name>.fixtures`), and nothing else: a spec named otherwise would not run. The linter holds the names.
- **Rejected.** One spec per source file; checking the calls of mocks; the `fake-<port>` prefix.
- **Why.** A spec per file mirrors the layout, not the behaviour: it breaks when a helper moves and the behaviour stays, and its cases repeat what the boundary's spec already proves (#49).

## ADR-0047 — A case earns its place, and mutation measures the tests
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A case earns its place by failing for a plausible bug no other case catches; a case that cannot — a restated constant, a check of the library or the framework, a duplicate — is deleted. Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment. A bug fix begins with the test that reproduces the bug. When a behaviour is described before it is built, in an issue or a plan, an agent writes its tests from the description first; a person may write the code first. Mutation testing measures the tests, and every mutant of the logic is killed: a mutant no behaviour can tell apart is marked in the code, with its reason, as equivalent; any other survivor fails the run. It runs in the check over the lines a change touches. A mutant in code no test runs survives, so the rule also holds every line of logic to a test.
- **Rejected.** Test-first as a mandate for every change; coverage as the measure of how good the tests are; a mutation score below 100 percent as a floor.
- **Why.** A test never seen failing may test nothing, and a suite that lets mutants live is weaker than its coverage says.

## ADR-0048 — Coverage is a tripwire at 100 percent of the logic
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** All logic — the domain, the adapters, the libraries, the UI — is held at 100 percent of lines and functions, and of branches where the runner measures them, reached only through the tests of its boundaries. A line no behaviour reaches is a behaviour without its test, or code nothing needs, which is deleted; it is never a reason for a test of its own. Excluded: the entry, an entrypoint's entry file, the wiring file, generated files, declarations and vendored code. There is no ratchet: a project below 100 percent breaks the rule like any other, the hook and the check say so, and a project that skips it on purpose records an override with its reason.
- **Rejected.** A floor that only rises; a percentage per layer; a gate on the domain alone.
- **Why.** Tests of behaviour at the boundaries reach every line a caller can reach, so the gate costs nothing extra and catches dead code and a missing behaviour test.

## ADR-0050 — Absence is undefined, and the tools hold it
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** Internal code spells absence as `undefined`. `null` lives only in wire types and in the adapters, which map it to `undefined`, and where a platform API returns it, which the code compares and never passes on. The compiler runs with `exactOptionalPropertyTypes`; the linter forbids `==` with `null` and, through a GritQL rule, any `null` outside the adapters but a comparison. The constitution's presets carry the three, so every project gets them.
- **Rejected.** Holding the rule by review alone; banning every `null`, comparisons included.
- **Why.** Two spellings of absence make every check ask twice, and a rule held only by review slips.

## ADR-0051 — A file carries its role's suffix
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A file carries its role's suffix, whatever its folder: `.entity`, `.error`, `.repository`, `.port`, `.adapter` for a port's implementation that is not a repository, `.use-case`, `.utils`, `.types`, `.constants`, `.model`, `.config`, the suffixes a block adds, and those a project adds for its own roles. A surface, the entry, a name a framework or tool fixes, a component file named after its component, a member of a set whose role has no suffix and a registry carry none. In `__tests__/` a spec is named after the file it proves plus `.test`, beside `<port>.fake` and `<name>.fixtures`.
- **Why.** The name tells the role before the file is opened, and a tool can check it.

## ADR-0052 — A layer folder is a container without a surface
**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** Outside a folder, a caller imports only its surface; inside, files import each other directly and never their own folder's surface. A folder of one role — `entities`, `contracts`, `use-cases`, `queries`, `commands`, `repositories`, `components`, `utils`, `models` — and each module inside it has a surface. A layer folder (`domain/`, `app/`, `adapters/`, `ui/`) and an area folder (`src/`, `features/`, `libs/`) is never an import target and has none: a caller imports the role folder inside it.
- **Rejected.** A surface that aggregates a layer; Biome's `noPrivateImports`, which demands a surface at every level.
- **Why.** An import names the role it couples to, and no aggregate hides an edge the layer rules forbid.

## ADR-0053 — A rule's level says how plainly it is wrong to break it
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A rule is MUST where a violation is plainly wrong and the answer is yes or no, most often given by a tool; SHOULD where following it takes judgement or has reasonable exceptions; MAY where it names a permitted choice. SHOULD is the default.
- **Rejected.** Every rule MUST, which fills the digest, multiplies warnings and makes every change a major release; every rule SHOULD, which leaves the digest and the warnings nothing to say.
- **Why.** The level decides what the digest shows, which rules raise warnings and which changes are major, so it has to mean the same thing in every block.

## ADR-0054 — The check roles of 1.0
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A rule's check is `test`, `review`, or `tool/<role>` with a role from this closed list: `format`, `lint`, `types`, `imports` (ADR-0103), `names`, `unused`, `versions`, `tests`, `coverage`, `mutation`, `secrets`, `audit`, `commits`. `names`, `secrets` and `commits` hold in any language; the others are checked per language. A language or an implementation lists the roles it checks in `checks`. When a tool-checked MUST rule's role has no tool for a language the rule applies to, the hook warns and the constitution's check reports it.
- **Rejected.** Checking commit messages and branch names under `lint`, which is checked per language and would report a missing tool for every language.
- **Why.** A commit message belongs to no language, and a rule held by a tool must say so to be counted.

## ADR-0055 — The laws of 1.0
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The laws are the MUST rules of `principles`, and the only MUST rules there. The fourteen laws of 0.8 stay; mechanical enforcement becomes the law that every rule whose check names a role is held by a tool of that role; extension by addition, contracts shaped by the role that uses them, and untrusted input parsed once at the edge join them.
- **Rejected.** Dropping mechanical enforcement as a mechanism rather than a law.
- **Why.** Each of the added three was already required by several blocks; as laws they are stated once and bind everywhere.

## ADR-0056 — version-control holds what is true of any version control
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The domain `version-control` holds only the rules that hold for any version control: an atomic change, a change that passes the checks before it is integrated, a protected main line, the formats of commits, branches and release tags. Everything only git has — staging, ignores, annotated tags, LFS, worktrees, its commands — belongs to the implementation `git`.
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

## ADR-0074 — betterleaks holds the secrets
**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The secrets role is held by betterleaks: the `betterleaks` block replaces `gitleaks`. The check scans the history the clone holds and the uncommitted changes, every report is redacted, and a false positive is allowed by `betterleaks:allow` or by its fingerprint in `.betterleaksignore`, each with its reason.
- **Rejected.** gitleaks, which is feature-frozen; scanning `origin/main..HEAD`, which a clone of one commit cannot resolve; `betterleaks dir`, which reads ignored files such as a local `.env`.
- **Why.** betterleaks is maintained by gitleaks' author, reads the same configuration and finds more; the scan the rules name then works on a laptop and on a shallow CI clone alike.

## ADR-0077 — Tests that drive the built program live in `tests/` beside `src/`
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** The testing chapter names the folder of end-to-end specs: `tests/e2e/`, beside `src/`, holding the specs and their fixtures. `tests/` takes one folder per kind of test that drives the built program rather than one of its files, so a later load or performance suite sits beside `e2e/`. `src/` holds only the program; unit and integration specs stay in the `__tests__/` beside what they prove.
- **Rejected.** A `testing/` folder in `src/`, a top-level folder with no layer that the names check would have to excuse; each spec in the `__tests__/` of the entrypoint it drives, which scatters the fixtures the specs share; `e2e/` alone at the root, which leaves every later kind of suite another folder at the root.
- **Why.** An end-to-end spec drives the built program and belongs to no layer of it, as the end-to-end suites of Playwright, Cypress and Detox stand outside the source; with the folder named, the names check holds `src/` to its tree without an exception for tests.

## ADR-0078 — Specs end in `.test`
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** A spec is `<name>.test`, an integration spec `<name>.integration.test`, an end-to-end spec `<name>.e2e.test`, in the language's spelling. The kind sits before the common `.test` tail, and a spec keeps its file's role suffix: `json.adapter.integration.test.ts` proves `json.adapter.ts`.
- **Rejected.** Keeping `.spec`; `.test` for unit specs and `.spec` for end-to-end ones, a split no reader or tool knows; dropping the tail (`.e2e.ts`, `.integration.ts`), which no runner, knip or editor finds by default and which reads like a role of production code; dashes (`json-adapter-integration.test.ts`), which fold the role suffix into the name.
- **Why.** `.test` is the spelling most of the React and Vitest ecosystem uses. The shared tail keeps every kind visible to every tool without configuration, while folders and explicit includes keep the runners apart.

## ADR-0079 — mise takes the release archive through its `github` backend
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** mise installs the constitution's release archive through its `github` backend: `asset_pattern` names the archive, `strip_components = 0` keeps its folders, and `mise.lock` holds the checksum GitHub publishes for the asset.
- **Rejected.** The `http` backend, whose URL template and hand-copied checksum no dependency bot reads, so every release was bumped by hand.
- **Why.** The pin is then a version alone, verified against the checksum the release itself publishes, and the dependency bot bumps the archive like any other tool.

## ADR-0080 — A screen's specs live in the `__tests__/` of its dash folders
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** With TanStack Router, a screen's specs live in the `__tests__/` of its `-components/` or `-hooks/`, beside the pieces they prove, never in a `__tests__/` of the route folder.
- **Rejected.** A `__tests__/` beside the route file with `routeFileIgnorePattern` set in every project, a setting each router configuration must repeat.
- **Why.** The route generator skips only names that start with a dash; a `__tests__/` elsewhere under `routes/` is read as route files and warned about on every generation.

## ADR-0081 — osv-scanner holds the audit, and any known vulnerability fails the check
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** The `audit` role is held by osv-scanner: the `osv-scanner` block replaces `bun`'s `audit-in-the-check`. It checks the lockfiles of any language for known vulnerabilities and every licence against the shared allowlist, in one run. `known-vulnerabilities-fail-the-check` now fails on a known vulnerability of any severity, not only a high or critical one; an accepted one is an `[[IgnoredVulns]]` entry with its reason and expiry. `audit` becomes a language-free role, as `names`, `secrets` and `commits` are: a block with no language, such as osv-scanner, holds it for every language.
- **Rejected.** `bun audit --audit-level=high`, which checks no licence, reads only Bun's lockfile and keeps an accepted advisory as a bare `--ignore` flag with no reason or expiry; running both tools, since osv-scanner fails on a medium vulnerability all the same and each one would be recorded twice.
- **Why.** One tool and one configuration hold vulnerabilities and licences in every language, and every exception carries its reason and date. osv-scanner has no severity floor, so the rule takes the stricter line rather than a second tool.

## ADR-0082 — A YAML name a tool fixes keeps its extension
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `yaml-files-end-in-yaml` excepts a file a tool reads only by a fixed name: GitHub reads issue forms and their `config.yml` in `.github/ISSUE_TEMPLATE/` only with `.yml`. The ls-lint base leaves that folder out.
- **Rejected.** Renaming them, which switches the forms off; leaving the rule without the exception, which every repository with issue forms would break.
- **Why.** A name the reading tool fixes is not the project's to choose, as `file-carries-its-role-suffix` already says of other fixed names.

## ADR-0083 — At most three positional arguments; a whole travels as one object
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `named-arguments-past-the-first` becomes `at-most-three-positional-arguments`: a function takes at most three positional parameters, and values that make one whole travel as one named object, whatever their number. `useMaxParams` at three holds the count; whether values make one whole is reviewed. The typescript block's `options-object-for-named-arguments` becomes `options-object-typed-as-function-input`, reviewed. The constitution's `named-arguments.grit`, which refused any second parameter, goes.
- **Rejected.** One positional parameter everywhere, which turns `(subject, options)` and a comparator's two sides into objects or suppressions; the first argument positional and every other named, which the plugin contradicted and a tool cannot tell from a whole.
- **Why.** Clean Code counts two arguments as natural, a third as needing a reason, and a group of values as an object of its own; a position is an order to remember, and a whole is one concept.

## ADR-0084 — Mutation testing keeps no earlier results
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `mutants-all-killed` runs over the lines a change touches, every new file and every file whose spec a change touches, and no longer reuses earlier results.
- **Rejected.** Stryker's incremental report: with the command runner Stryker cannot tell which tests meet a mutant, so a cached result hid a survivor in one run and kept a killed mutant as surviving in another.
- **Why.** A result is trusted only when it was run; mutating the changed lines keeps the run short without a cache.

## ADR-0085 — No Vitest block until a project needs one
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** The `vitest` block is removed. Every droneey project runs its specs with `bun test`; a Vitest block and its preset come back together when a project needs them.
- **Rejected.** Keeping the block while its preset does not exist, which states checks no tool performs.
- **Why.** A block that names a preset nobody ships describes a check that never runs.

## ADR-0086 — zod is kept out of the domain by the domain law alone
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `zod-only-at-the-edge` and its dependency-cruiser part are deleted. A schema is written wherever input crosses a boundary — an adapter's models, a route's search parameters, a form — and `domain-imports-only-itself-and-kernel` keeps zod, like every vendor, out of `domain/`.
- **Rejected.** Widening the rule's list of edges to routes and forms, which names the router's and the form library's folders in zod's block.
- **Why.** The rule forbade the schemas `search-params-validated-by-schema` and the form rules require, while what it protected — a domain free of the schema library — the law already holds. Router and form libraries take any Standard Schema validator, so a schema at the delivery layer is the boundary, not a leak.

## ADR-0087 — The formats of commits, branches and release tags belong to version-control
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** The rules on the commit header, the empty body, the commit type, the subject, placeholder subjects, the branch name, the version bump, the squash merge, the pull request's title and the release tag's name move from `git` to `version-control`. `git` keeps what only git has; `release-tags-annotated-semver` splits into `release-tags-named-by-semver` in the domain and `release-tags-annotated` in `git`.
- **Why.** The formats hold for any version control: Jujutsu or Mercurial would take `feat: Subject`, `feature/12-name` and `v1.2.0` unchanged, so they do not lose their meaning without git.

## ADR-0088 — Every block lays its rules out on three axes
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** A block is its card `<id>.md` — front matter and summary, no rule — and up to three axis folders: `foundation/`, `architecture/` and `workflow/`, each holding its chapters and its `with/` seams. Two questions place a rule, each apart from the other: its layer by what must disappear for it to lose its meaning, and its axis by whether a team with another architecture, or another workflow, would still want it. Architecture is the structure of a system in the sense of Clean Architecture, DDD and hexagonal architecture — layers and their duties, the direction of dependencies, boundaries with ports and adapters, the homes of input, output and state, the composition root, the isolation of parts, read and write apart, and the tree that spells them; workflow is how a change travels from the idea to the release. A rule that implements an architecture or workflow rule is on that axis; the layout of tests is foundation. Architecture and workflow may refer to foundation; foundation refers only to itself, and the two never to each other. A project lists the axes it follows in `constitution.yaml`, `foundation` always among them. Every rule moved to its axis by a census of all 614; a rule that bundles two axes stays whole on the stricter one until it is split. Core's `architecture` chapter is now `anatomy`, its `workflow` chapter `delivery`, and its two rules about files form `foundation/files.md`.
- **Rejected.** Two parallel trees `foundation/` and `architecture/` above the layers, which give a block two homes; a suffix `.architecture.md` beside a default axis; a mark on each rule, which a hook cannot drop as a whole and which drifts, as the `architecture` tag did; one architecture block that places every other block's rules, which would name every library from above; folder names as the test of architecture, which misses the dependency rule itself.
- **Why.** A team adopts the foundation the way it adopts a tool's recommended preset, whatever its own architecture and workflow, and the axes make that choice one line. The literature separates the three the same way: style guides and Clean Code for the craft, Clean Architecture, hexagonal architecture and DDD for the structure, and engineering practices — Clean Coder, Accelerate, the code-review guides — for the process.

## ADR-0089 — A rule sits on one axis, names the rule it carries out and takes its level from it
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** Every rule that bundled two axes is split into one rule per axis; the half on `architecture/` or `workflow/` may carry out the half on `foundation/`, and where one half repeated another rule it was dropped instead. A rule that carries out another names it in its heading, `## <slug> → <rule>`, instead of a level: it takes that rule's level and tags, may state a stricter level, `→ <rule> · MUST`, never a looser one, and carries out one rule at most. An override of a rule lowers every rule under it that states no level of its own. A rule on `foundation/` carries out only `foundation/`, and `architecture/` and `workflow/` never each other; `blocks:check` reports any other reference, a looser stated level, a cycle and a missing rule. A rule's Why, Check and Tags are one table under its statement, the same columns in every rule, and a list written as in the front matter, `[]` when empty. The tags are the lenses that cross every axis — `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux` — optional, since a full review reads every rule. Twelve duplicates are merged into the rule that keeps their meaning, `fast-source-updates-once-per-frame` moves to ui, `pipeline-stages-under-steps` and `dependencies-imported-from-their-entries` to core, and an abstraction waits for its third occurrence in the principles as in ADR-0058.
- **Rejected.** A level stated again on every rule that carries out another, which lets the two drift and keeps an override from reaching them; the Implements label beside the heading; labels on consecutive lines, which render as one run-on paragraph; lenses that name a chapter's topic — design, naming, types, process — or an axis.
- **Why.** The force of a rule is set in one place and reaches every rule that carries it out, and a lens is worth filtering by only when it crosses the axes.

## ADR-0090 — Each axis keeps its words, and process choices sit on workflow
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `vocabulary.yaml` lists the words the `architecture` and `workflow` axes own; `blocks:check` reports an architecture word outside `architecture/`, a workflow word outside `workflow/`, and either in a card. The check catches the plain leak; placing a rule stays with the two axis questions. A review by meaning then moved what plain words had hidden. To `workflow/`: `changes-reach-main-line-through-review`, `required-check-blocks-integration`, `one-integration-strategy-no-work-in-progress`, `small-reviewable-change-requests`, `merged-branch-deleted`, `hook-rewrites-only-staged-files`, `bug-fix-starts-with-failing-test`, `sub-agent-never-touches-live-systems` and `ci-runs-the-pinned-toolchain`; split, with the choice as a child of the outcome: `main-line-protected` (`main-line-takes-no-direct-push`), `every-commit-passes-the-check` (`check-run-by-hooks-and-ci`, which takes over from `one-check-command` that CI runs the check), `no-secret-in-repository` (`secrets-scanned-before-each-commit`) and `consent-before-irreversible-actions` (`consent-given-in-the-chat-per-action`). To `architecture/`: `adapter-built-by-factory-or-module-object`; split: `spec-per-boundary` (`spec-per-boundary-of-the-tree`) and `query-for-reads-mutation-for-writes` (`query-hooks-only-in-binding-units`); the suffix clause of `test-files-named-by-role` joins `file-carries-its-role-suffix`. Foundation slugs that named the architecture are renamed to their statements: `invariant-checked-at-construction`, `one-contract-suite-per-contract`, `one-fake-per-contract`, `absence-has-one-value`, `integration-tested-against-the-real-engine`, `query-for-reads-mutation-for-writes`, `keys-only-from-the-key-factory`, `query-signal-reaches-the-request` and `data-result-is-union-by-status`. Each sense keeps one word: what a fake or a contract suite stands in for is a contract, a module's API is its public entry, and a user interface is never a bare "interface"; the slugs follow.
- **Rejected.** Picking the words out of a markdown glossary by its file name; the words alone as the judge of an axis.
- **Why.** A team with another architecture or workflow takes foundation as it is, so foundation must neither speak our words nor state our choices in plain ones.

## ADR-0091 — The constitution's archive carries every tool configuration, laid out by axis
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** devkit's presets, starter files and `mutation-check` move into the constitution, and its release archive `constitution.tar.gz` is the one way a project takes them, in any language: `presets/`, `templates/project/<block>/`, and `tools/mutation-check/dist/main.js`, built at release. A preset is split into parts, `presets/<scope>/<tool>/<axis>/<block>.*` since ADR-0098: the tool folder is the tool's block, the axis folder is the axis of the rules the part holds, and the part is named after the block its settings need — the one without which they mean nothing, an abstract block's underscore included: `noTailwindArbitraryValue` sits in `tailwind` though it holds a rule of `ui`. Settings that need no block beyond the tool sit in `core` when they hold a rule of core, and in `self` when they are the tool's own. A GritQL rule is `<axis>/plugins/<rule-slug>.grit`, and an architecture part narrows a foundation part's GritQL rule by listing the same path. mise's `tool-configuration-from-the-kit-archive` becomes `tool-configuration-from-the-constitution-archive`, and osv-scanner's `licences-checked-against-devkit-allowlist` becomes `licences-checked-against-the-shared-allowlist`. The node environment's parts are dropped; Python's configurations stay in devkit until a project needs them.
- **Rejected.** npm packages for the TypeScript tools beside an archive for the rest, which released the same rule twice — most of devkit's changes came paired with one of the constitution's; naming the tool's own part after the tool, which reads `biome/foundation/biome.jsonc`; dropping an abstract block's underscore in its parts, which gives one block two names.
- **Why.** A rule and the setting that holds it change in one pull request and ship in one version; a project that leaves an axis out leaves out its parts; and every part names the block that owns it, which a check can hold.

## ADR-0092 — docker, its two linters, and nestjs get blocks
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** The `docker` implementation describes both files a project writes for containers. A Dockerfile pins its base image, copies rather than adds, runs its command in exec form, fails a piped step, pins and trims its system packages, runs as a numeric unprivileged user and takes a secret only through a secret mount. A Compose file keeps devkit's order of keys, has no `version`, quotes every published address and binds it to an interface, and its shared settings, variants, health waits and test services follow devkit's conventions. The check lints both, and any finding fails it: `hadolint` holds a Dockerfile with `failure-threshold: style`, `dclint` a Compose file with every rule an error, each from its preset in the release archive. `nestjs` keeps the decorator metadata its injector reads, and answers two rules partly: `compiler-is-the-type-gate`, since `verbatimModuleSyntax` and `strictPropertyInitialization` are off, and `one-explicit-composition-root`, since its injector is a container built from the modules' declarations; a provider still takes its dependencies through its constructor, a rule on the architecture axis. Its Biome part no longer turns `noEmptyBlockStatements` off, which Biome never raised on an empty module or constructor.
- **Rejected.** One block per file, which splits the images a Compose file runs from the Dockerfiles that build them; the linters' defaults, which leave half their findings as warnings the check passes; turning a rule of core off for NestJS in its Biome part, which a block may not do.
- **Why.** A container is built and run by the two files together, and each has a linter that holds most of its rules; what a linter cannot see is reviewed.

## ADR-0093 — The vocabulary lists only words of one meaning, and an agent judges the placement
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `vocabulary.yaml` keeps a word only when it has no meaning outside its axis: folders, role suffixes, terms of several words and words such as `semver`. `adapter`, `aggregate`, `entrypoint`, `kernel`, `port`, `sink`, `surface`, `widget` and `chore` leave it; their folders and suffixes stay. The meaning of a rule is judged by the `rule-placement` agent of this repository, which answers the layer and axis questions for every rule a change adds or rewrites and reports each rule that sits elsewhere; its answers go into the pull request.
- **Rejected.** Exceptions per word or per block, or reading only the prose outside code spans: a word with two meanings turns up in plain text as well, and every exception is one more rule to keep; the agent inside `bun run check`, which must give the same answer on the same code.
- **Why.** A word check that cries wolf gets its words rewritten rather than its rules moved; the words that remain catch a plain leak cheaply, and the placement itself needs the reading of meaning the two questions ask for.

## ADR-0094 — Each preset binds its settings to the rules they hold
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A preset holds, beside its parts, `presets/<scope>/<tool>/bindings.yaml`: by axis, part and rule, the settings that hold the rule, each as the part's file spells it. `blocks:check` holds one direction: every rule whose check is `tool/<role>` is implemented — by a binding, by a rule under it with the same check that is, or by the tool block that checks that role and describes its run; a role no tool with presets checks needs none. A binding it holds must be real: its rule exists and sits on the part's axis or on foundation, which any axis may carry out; its rule belongs to the part's block, a block above it or a seam with it, never a block below; its part exists; its file spells the setting. Whether a part is the block its settings need is judged by the `rule-placement` agent. A setting that holds no rule is never reported. A preset file is a part named after a block or `self`, a plugin named after a rule of its axis, or `bindings.yaml`. The configuration carries no comment per setting. Where no setting of any tool holds a rule, its Check says `review`: `domain-values-never-typed-again`, `identifiers-branded-by-entity`, `booleans-read-as-predicates`, `boundary-values-unknown-until-parsed`, `schema-held-exactly-to-its-model`, `shared-state-packages-once-in-lockfile`, `hash-imports-leave-the-module`, `package-anatomy`, `package-repository-layout`, `screen-private-pieces-beside-screen` and `matomo-only-in-its-sink`. A GritQL rule now holds `keys-only-from-the-key-factory`, and ls-lint's new `expo` part holds `expo-router-root-is-routes` and the new `expo-router-file-names-kept`, the names Expo Router reads.
- **Rejected.** A Bindings table in the tool block's chapters, which filled a tool's chapter with other blocks' rules and made a language name the frameworks below it; a check that every setting holds a rule, since a tool's own opinions need none; a comment per setting in the configuration, which nothing checks; dependency-cruiser rules renamed to their slugs, since several of its rules hold one slug and it drops a repeated name across `extends`.
- **Why.** A block keeps its own rules and nothing else, the presets keep the tools' side, and the check reads the one place they meet: a renamed setting, a moved part or a rule a tool only claims to hold fails the check instead of drifting.

## ADR-0095 — CSS is a language block, and the stylesheet's rules move into it
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `css` is a language context, beside `typescript`, for a program's stylesheets whatever writes the classes. Its rules: every style rule in a named cascade layer, the order of layers declared once, no `!important`, selectors of at most three classes that never descend in specificity, no id selector, custom properties declared before they are read and registered with `@property` where they are animated or typed, Baseline features only, classes declared and used and named for what an element is, container queries for components, global styles only in the entry stylesheet. A rule that carries out a rule of `ui`, `a11y` or `i18n` sits in css's seam with it: values from the theme's custom properties named after their tokens and, on the architecture axis, a component's CSS module in its folder with `ui`; logical properties with `i18n`. The rules that were written in CSS but kept in the browser's seams move into the css seams: `focus-ring-from-design-system`, `type-sized-in-rem` and `hover-styles-behind-hover-media` to `css/with/a11y`, `cascading-variant-by-data-attribute` to `css/with/ui`. HTML stays with `browser`: its elements, ARIA and focus mean something only in a browser's document. `tailwind` requires `css`. Biome's CSS rules move from the `browser` part to a `css` part, with a GritQL rule against id selectors; the `tailwind` part parses Tailwind's directives and turns `noUndeclaredClasses` off, since its utilities are declared by the library.
- **Rejected.** The CSS rules in the `ui` or `browser` part, which gave a domain or a platform a language it may not have: a browser program need not write a stylesheet, and React Native has none; an `html` language block, which would repeat the browser platform.
- **Why.** A rule sits where it loses its meaning: without CSS these rules mean nothing, and without a browser neither does HTML.

## ADR-0096 — A tool names the languages it covers, and a language the roles it is held to
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A block's card declares two more fields after `checks`: `languages` and `roles`. `languages` lists the language blocks whose files a tool's checks cover: `biome` covers `typescript` and `css`; `dependency-cruiser`, `knip`, `stryker`, `syncpack` and `bun-test` cover `typescript`; `typescript` covers itself for `types`. A tool that lists none — `ls-lint`, `betterleaks`, `osv-scanner`, `lefthook`, `hadolint`, `dclint` — holds only the language-free roles, for every language, and a block that checks nothing lists none. `roles` lists the roles a language block's files are held to: every role for `typescript`, `format`, `lint` and `names` for `css`; every other block leaves it empty. A language needs a role when an active MUST rule checked by `tool/<role>` holds for it and it is held to that role, and has it when an active tool lists the language in `languages`, or lists none and the role is language-free; the difference is the hook's warning and the advice of `blocks:check`. A tool's coverage no longer follows its `requires`; a rule's languages still come from its block's closure. `blocks:check` reports a `languages` entry that is no language block, `languages` on a block that checks nothing, a `roles` entry that is no role, and either field on a layer that leaves it empty; the hook holds a project's local blocks to the same. A rule's Check is written `tool/<role>` instead of `tool — <role>`.
- **Rejected.** Coverage through `requires`, which took every language for a programming language: a project with CSS was told its stylesheets had no test runner, and Biome, which lints CSS, counted only for TypeScript; `biome` requiring `css`, which would bring CSS into every Biome project; exempting CSS by name, which the next such language would need again.
- **Why.** What a tool reads and what a language is held to are facts of the tool and of the language, not of what either depends on: stated where they belong, a stylesheet is held only to what can be checked in it, and a tool counts for every language it really checks.

## ADR-0097 — A tool-checked rule claims only what its tool holds
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A rule that a tool holds only in part is split into the part a tool holds and the part that is reviewed: `files-copied-never-added` keeps local files in `COPY` and `downloads-verified-archives-unpacked` reviews downloads and archives; the Biome suppression rule becomes `biome-suppression-states-its-reason`, held, and `biome-suppression-names-one-rule`, reviewed; `dependencies-imported-from-their-entries` is reviewed, and `react-native-imported-from-its-entry` holds it for React Native; `typescript-file-forms` holds the forms, and `tsx-only-where-markup-is-written` is reviewed. Where a setting holds a rule or its half, that half says so: `error-cause-preserved` (a MUST now that `useErrorCause` holds it) and `error-logged-once`; `consumers-import-package-entries` under `package-entries-curated`; `bundle-reads-no-build-environment` under `runtime-configuration-served-beside-bundle`. A rule that bundled two axes is split: `no-import-cycles` on core's foundation and `dependencies-point-inward` on its architecture; `test-code-unreachable-from-production` and `stories-unreachable-from-production` move to foundation, with their dependency-cruiser rules. `tanstack-router-file-names-kept` joins `expo-router-file-names-kept`. A branch's name holds no digit but its issue's number.
- **Rejected.** A Check that names a tool for a whole rule the tool holds in part, which hides the part nobody checks; a rule kept whole on its stricter axis, which denies a team the half it would take.
- **Why.** A Check says who holds the rule; when it says a tool, the tool must hold all of it.

## ADR-0098 — Presets are laid out by scope first, and the compiler gets its block
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A preset's part is `presets/<scope>/<tool>/<axis>/<block>.*`, its bindings `presets/<scope>/<tool>/bindings.yaml` and its GritQL rules `presets/<scope>/<tool>/<axis>/plugins/<rule-slug>.grit`. The scope is the files the part reads: `common` for any language, or a language block its tool lists in `languages`. Every tool has a scope, even one that reads one language, so no tool is laid out apart. The compiler becomes the implementation block `tsc`, which checks `types` and governs `tsconfig.json`, and `compiler-is-the-type-gate` moves to it from `typescript`; its strict options sit in its `self` part again. Vite's `build-is-not-the-type-gate` moves to its seam with `tsc`, and `nestjs` requires `tsc`, whose options it relaxes.
- **Rejected.** A language folder inside a tool's axis folder, which appears in some tools and not in others and names the axis before what the part reads; the language block `typescript` doubling as the compiler's tool, which gives one block two roles; a separate scope for the parts of one block, which a part's name already carries.
- **Why.** A project takes a scope whole — `common` and the scope of each active language — and a language added later brings its own folder beside the others, with the same tools inside.

## ADR-0099 — A cast is refused, and a value from outside is parsed or narrowed
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** Biome's `noUnsafeTypeAssertion` holds the `as` cast of `no-unchecked-escape-hatches`, in specs as in production; only `as const` passes. `boundary-values-unknown-until-parsed` makes a value from beyond the boundary known by the project's schema or by plain checks — `typeof`, `in`, `Array.isArray` — the same way in specs and in production.
- **Rejected.** A schema for every value from outside, which brings a dependency into a small tool that reads one field; casts left in specs, which let a spec pass on data in a shape the tool never gave.
- **Why.** A cast over data nobody read promises a shape nobody checked; a schema or a narrowing check reads it, and the first unexpected field fails where it enters.

## ADR-0100 — Raw HTML is refused in the browser, and React's own door in react-dom
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `no-raw-html-injection` moves from `react-dom` to `browser`: no `innerHTML` or `outerHTML` assigned, no `insertAdjacentHTML`, no `document.write`, held by a GritQL rule in the browser's part. `react-dom` keeps `no-dangerously-set-inner-html`, held by `noDangerouslySetInnerHtml`.
- **Rejected.** Keeping the whole rule in `react-dom`, where it named DOM APIs a program without React uses as well, and held only React's door.
- **Why.** The DOM takes markup through its own calls in any browser program; each block now forbids the door it owns, and the parent says what both mean.

## ADR-0101 — A rule a tool holds in part is reviewed, and a child says what the tool holds
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** Where a tool holds only part of a rule, the rule keeps its slug and its statement and becomes `review`, and a child `→` it states exactly what the tool holds, with the tool's Check and its bindings. So it is for 39 rules: among them `access-only-through-curated-surface` (`surface-is-the-only-way-in`), `commit-header-type-and-subject` (`commit-header-format`), `coverage-holds-all-logic` (`coverage-gate-on-loaded-files` in `bun-test`), `every-control-has-an-accessible-name` and `native-semantics-first` (`jsx-controls-named`, `jsx-roles-and-aria-valid` in `react-dom`'s seam with `a11y`, which `labels-bound-with-use-id` joins, so a React Native project claims no setting it lacks), `tokens-single-source-of-appearance` (one child each in `react-dom`, `react-native` and, under `utilities-only-from-tokens`, `tailwind`), `components-dumb-widgets-smart` (a child in `ui`, and one in each of `ky` and `tanstack-query` for the library it keeps out), and `primitives-take-text-by-props` (`primitives-import-no-message-catalog` in `lingui`'s seam with `ui`). `side-effects-at-the-edges`, `suppression-states-its-reason` and `folder-named-for-purpose-or-role` become `review`, their held parts already held by children. The same holds where a binding sat on a reviewed rule: `commit-scan-redacted` (`lefthook` with `betterleaks`) and `stryker-runs-the-bun-test-command` take theirs, and a setting that wires a hook, which no role checks, holds no rule. Three statements lose a clause another rule holds: `yaml-only-at-the-edge` the `unknown` result (`boundary-values-unknown-until-parsed`), `known-vulnerabilities-fail-the-check` the accepted vulnerability (`accepted-vulnerability-states-reason-and-expiry`), and `no-dead-code` the unreached branch (`coverage-holds-all-logic`) for the unreachable statement the compiler refuses.
- **Rejected.** Narrowing each rule to what its tool holds, which would drop the judgement half a reviewer still needs; siblings beside each rule, as ADR-0097 did, which name two rules where one carries out the other.
- **Why.** A Check says who holds a rule. A child that states only what its setting refuses keeps that true, and the rule above it stays whole for the review.

## ADR-0102 — A project without a check command writes check: null
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `check` stays a required key of `constitution.yaml`; a project with no command that runs its checks writes `check: null`, and the hook asks for nothing more. The hand-back gate of step 5 then has no command to require and only reminds of the review.
- **Rejected.** Dropping the key when there is no command, which a missing key cannot tell apart from one forgotten; an empty value, which the hook already reads as unfinished.
- **Why.** A project the constitution governs may have no checks yet, and saying so is different from not having answered.

## ADR-0103 — The role that checks imports is named imports
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** The check role `architecture` is renamed `imports`: a rule held by the tool that follows imports between files — dependency-cruiser today — reads `Check: tool/imports`, and that tool's block lists `checks: [imports]`.
- **Rejected.** Keeping `architecture`, the name of an axis since ADR-0088, which made a foundation rule such as `no-import-cycles` read `tool/architecture` and suggested an axis it is not on.
- **Why.** A role names what its tool looks at; one word for a role and an axis made both harder to read.

## ADR-0104 — A public build variable is a case of client-holds-nothing-hidden
**Date:** 2026-10-02 · **Status:** Accepted

- **Decision.** `client-holds-nothing-hidden` names a variable the build inlines under a public prefix among what is shipped to the client. `expo-public-env-holds-no-secret` and `vite-public-env-holds-no-secret` are removed: each said the same of its own prefix, under `secret-never-in-url-or-artefact`, and neither held more.
- **Rejected.** Keeping one child per bundler, which repeats the domain's rule once for every tool that inlines variables.
- **Why.** That the client's user can read the bundle is a fact of the untrusted client, whatever builds it.

## ADR-0105 — The tools hold what their rules claim
**Date:** 2026-10-02 · **Status:** Accepted

- **Decision.** Five rules change so that a tool holds what each says.
  - `stryker-runs-on-node` is removed: Stryker 10 runs under Bun 1.4, JSX included, and `[run] bun = true` already ran it there.
  - `trusted-dependencies-listed-by-name` requires `trustedDependencies` always declared, `[]` when no dependency may run a script, since without the field Bun runs the scripts of its own list of popular packages.
  - `no-skipped-or-empty-tests` also refuses a case run only under a condition or expected to fail — Bun's `if`, `skipIf`, `todoIf` and `failing` — and Biome's test domain is turned on for `bun:test` specs, which it never detects by itself.
  - `check-writes-no-snapshot` is new: the check runs `bun test` with `CI=1`, so a missing snapshot fails instead of being written.
  - `integration-specs-run-apart` leaves out `tests/` as well, by `pathIgnorePatterns`, and names the integration run.
- **Rejected.** A Stryker runner for Bun with per-test coverage: over 986 mutants it took 58 s against 52 s for the command runner, and it has one maintainer. The TypeScript checker: TypeScript 7.0 ships no compiler API until 7.1.
- **Why.** A rule a tool claims to hold and does not is worse than a reviewed one: everyone trusts the check.

## ADR-0106 — Value objects, thrown failures and the TypeScript rules of the 2026 audits
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - A business value with an invariant is a value object of the domain (`value-object-built-only-by-its-check`, MUST, on the architecture axis): built only by the domain's function that checks it, immutable, compared by value, never a class. A boundary gets one only through that function, and a zod schema never brands one itself. In TypeScript it is a branded type with `create<Name>` and `is<Name>`. A meaning without an invariant stays a vocabulary alias, and an existing alias is used instead of the bare type.
  - Expected failures are thrown as errors of the kit, not returned: a contract lists them as one type beside it, a `catch` narrows by code and rethrows the rest, and only errors are thrown.
  - A boolean is never positional; parameters of one type travel as one object or are told apart by their types.
  - Shared shapes are composed of small ones; domain types are `readonly`; a type parameter appears twice; cancellation travels as an `AbortSignal`; resources are held by `using`; a module exports by name; text is made deliberately; a return type is no wider than what is returned; `process.env` is read only in the root and the entry files.
  - Oxlint is not adopted (ADR-0045 stands); Biome holds what it can.
- **Rejected.** A `Result` type for expected failures: the owner keeps the language's own `throw` and `catch`. A value object as a class: its instance loses its methods in a cache, a URL and storage.
- **Why.** The rozumchik-web audit found value objects unstated and rules about failure, arguments and types missing; the best-practices audit of 2026 found the rest.

## ADR-0107 — Ownership, one writer per resource, and the data and import rules of the 2026 audits
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Whoever decides whether a change is valid owns the data: what the server decides stays plain; what the program decides itself — a draft, an optimistic item, a stream's folding, a grouping by period — is modelled in its domain. What concerns one entity alone is a pure function beside it, never a method. A query port or use-case has no side effect, and a command never calls a query (MUST). Ports are named `<Aggregate>QueryRepository` and `<Aggregate>CommandRepository`. A stateful client is built by the root.
  - `one-writer-per-shared-resource` (MUST): every resource the program shares with its host has one writer; a block that brings its own claims it, and the default writer yields. `react-dom` yields the head when another block claims it, and `tanstack-router` claims it.
  - The web tier may hold one session proxy that keeps the user's tokens on the server behind an `HttpOnly` cookie and forwards calls, with no business rule (the OAuth best current practice for browser applications).
  - TanStack Query's own status union replaces our flags, the data already shown stays beside a failed refetch, and a screen's read may suspend into its route's pending and error components. A read is declared once as `queryOptions`; the router's context carries the adapters; a screen's reads start in its loader; a write stays pending until its refresh lands; an error component's retry resets the failed read; links are typed; search falls back to defaults; a loader declares its search; routes split automatically; `routeTree.gen.ts` is committed.
  - Imports held by dependency-cruiser: adapters and `libs/` never import the query library, `libs/` never the router (one child per library), binding units neither an adapter nor UI, components no widget, nothing inside the screens' folder, and a route's pieces never its route file. A feature's UI imports its entities — their types, enums and the functions `entity-behaviour-beside-entity` asks it to call — so the setting `ui-takes-entities-as-types` is removed, and `ui-layer-imports` is reviewed, with a child for what the tool still refuses.
- **Rejected.** A wider BFF that shapes data for screens: the rules belong to the API that owns the data. HTTP libraries out of `libs/`: a vendor client there may be one.
- **Why.** The rozumchik-web audit and the best-practices audit of 2026 found these unstated or contradicting current TanStack, OAuth and modelling practice.

## ADR-0108 — Base UI, the component rules and the CSS of the 2026 audits
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Every project builds its primitives on Base UI through shadcn source: `complex-widgets-on-radix` and `slot-behind-as-child` give way to `complex-widgets-on-base-ui` and `polymorphism-through-render`, Base UI's `render` prop being the kit's only polymorphism. A pattern the platform's own element carries whole — `<dialog>`, `popover`, `<details>` — uses that element, and the top layer replaces a portal there.
  - A primitive's markup is never re-created (MUST, split from `compose-before-authoring`); `compound-over-prop-regions` names its signs, and a compound's surface exports only its root. A component is controllable or not through one interface, a primitive passes its element through, a refresh never replaces content already shown, and a hidden part that keeps its state uses `<Activity>`.
  - React: rendering is pure inside `StrictMode` (MUST), props are never assigned, components are named in PascalCase, a component that renders nothing returns `null` — a React variant of the GritQL rule on absence, over `.tsx` files only, allows `return null` — render errors are reported at the root, and memoisation's exception is a value an effect or a library the Compiler skips depends on.
  - Boolean props keep the names the platform and the primitive library give; an inline `style` is an object literal of custom properties only, held by GritQL instead of `noInlineStyles`; images declare their size, held in JSX by `useImageSize`; the Core Web Vitals are kept within budget. In the browser, a primitive passes its class and attributes through and marks its parts with `data-slot`.
  - CSS and Tailwind: `svh` by default, `w-screen` refused, a `max-*` breakpoint only after a minimum, cascading variants by `@custom-variant`, Tailwind's own layer order imported layer by layer, `!important` only in the reset layer, newly available features behind a feature query, `color-scheme` on the root, no hexadecimal colour outside the theme, the class merger configured with the theme's scales. The theme follows the system until the user chooses, lives in `libs/ui/theme/`, and its tokens are kept in the interchange format where a design tool or a second platform reads them. A component of `root/ui` is prefixed `root-`, held by ls-lint. `four-data-states` names only the states a view's data can have.
- **Rejected.** Radix as the kit's base: shadcn generates on Base UI since July 2026, and the owner moves every project to it. `dvh` as the default height: it resizes while the toolbar moves.
- **Why.** The rozumchik-web audit and the best-practices audit of 2026 found these unstated or contradicting current React, Tailwind and platform practice.

## ADR-0109 — Accessibility, i18n and consent rules of the 2026 audits
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Accessibility: after a navigation inside the program, focus moves to the new view's heading and the title names it (MUST); a live region is mounted before its message (MUST); a toast never holds the only copy; a failed submit focuses the first error; paste and password managers are never blocked (MUST); the viewport never blocks zoom; the focus ring survives forced-colors mode (MUST), `focusable` draws an outline and no class list writes `outline-none`; sticky content reserves its scroll padding; view transitions stop under reduced motion; contrast's 3:1 applies to what identifies a control; the hand check names its steps; `wcag-aa-conformance` names the 2.2 additions most often missed; a public product publishes an accessibility statement; the axe scan runs on WCAG 2.2 A and AA only, without contrast in a simulated DOM and with the landmark rule in screen specs; the stories fail on a violation.
  - A form never submits twice, but its button is busy, not disabled: `submit-disabled-while-submitting` (tanstack-form) gives way to `submit-busy-while-submitting` in `ui`, since no form library is needed for it.
  - i18n: the document's `lang` and `dir` follow the locale (MUST); formatters take the active locale (MUST), held for `toLocale*String` and `Intl` by GritQL; a sentence varying by a value uses a select; a pseudo-locale runs in development; ambiguous messages carry context; a right-to-left locale gets logical Tailwind utilities, held by GritQL; module-level Lingui text is a descriptor, and with React a component's `t` comes from `useLingui` (MUST).
  - Consent: refusing is as easy as accepting (MUST), consent is withdrawable and recorded (MUST), through a link on every screen where there is a user interface, Global Privacy Control counts as a refusal in the browser, a legally exempt configuration is an override with its reason; events are named object and past action.
- **Rejected.** A disabled submit button: it drops focus and says nothing.
- **Why.** The rozumchik-web audit and the best-practices audit of 2026 found these unstated, against WCAG 2.2, the EDPB's consent guidance and current i18n practice.

## ADR-0110 — Testing rules of the 2026 audits and the Playwright block
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Core: a flaky test is fixed or deleted, never retried; a case passes alone and in any order; a test never waits a fixed delay; a case holds no logic; a fixture builds a valid value and takes overrides; a property test's counterexample becomes a row; a unit case runs in milliseconds; captured responses of a vendor are checked against it by a contract run, which `tests-run-in-a-sandbox` now allows next to a person; on the workflow axis, that run is scheduled outside the check and opens an issue, and the whole program is mutated on a schedule and before each release.
  - A case holds no branch or loop, whatever the runner. With `bun:test`, no case retries or sleeps, the order is random, and a preload refuses the network. `async-ui-awaited-with-find` becomes a child of the rule against fixed sleeps.
  - `ui`: behaviour that depends on layout, visibility or real focus is proven on the platform, never only in a simulation. A TypeScript package's exported generic and conditional types get type cases.
  - A `playwright` block for end-to-end specs, on TypeScript: locators by role, label and text; waits only through locators and web-first assertions, held by Biome; web-first assertions awaited; no forced actions; retries off; a trace kept for each failure.
  - knip's production run is `--strict`.
- **Rejected.** A unit timeout in `bunfig.toml`: Bun ignores the key, so the speed of a unit case stays with review. Biome's `playwright` domain: it enables none of the nursery rules, so the part lists them.
- **Why.** The best-practices audit of 2026 found flaky, order-dependent and sleeping tests unruled, the sandbox held only by review, captured responses never re-checked, and no tool behind `end-to-end-per-critical-scenario`.

## ADR-0111 — Security, agent and delivery rules of the 2026 audits
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Browser: no credential the tab's script can read; only an `HttpOnly`, `Secure`, `SameSite`, `__Host-` cookie holds one (MUST). Every document has a strict Content Security Policy (MUST), and it requires Trusted Types.
  - Agents: an agent takes instructions only from the person it works for, and what it reads is data (MUST). It runs with least privilege, its permission settings are committed, and its extensions are vetted like dependencies.
  - Delivery: a change that makes a document false corrects it; a public repository carries `SECURITY.md`.
  - MPL-2.0 joins the licence allowlist: its copyleft is per file and binds only changes to those files, and its packages here are build and test tools.
- **Deferred.** The CI, forge and git-flow items of the audit — untrusted input in workflows, token permissions, protected tags, SHA pins, short-lived credentials, push protection, provenance, the version bump and branch lifetime — wait for the git and CI/CD pack.
- **Why.** The best-practices audit of 2026 found no rule on where a browser keeps a credential, no runtime wall behind the XSS lint, and nothing on whose instructions an agent follows — the hole prompt injection and the npm worms of 2025 went through.

## ADR-0112 — Image, Compose and browser hardening of the 2026 audit
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Images: with osv-scanner, the check scans each image the project builds or pulls, so a vulnerability in its system packages fails like one in a lockfile.
  - Compose: a service runs with `no-new-privileges`, drops every capability it does not need, and runs on a read-only file system. The shared key order takes `cap_drop`, `cap_add` and `read_only` after `security_opt`.
  - Browser: every document carries HSTS, `nosniff`, a strict `Referrer-Policy` and `Cross-Origin-Opener-Policy`. A script from another origin is self-hosted or pinned by `integrity`. A redirect target from the address or a form is followed only to the program's own paths or an allowlist.
- **Why.** The best-practices audit of 2026 found these protections unstated, against ASVS 5.0 and the Docker and CIS guidance.

## ADR-0113 — Redundancy removed from the 2026 audit changes
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Rules that repeated a neighbour or a parent are removed or merged: `browser-checklist-before-shipping` into `interactive-checked-by-hand`; `boundary-builds-value-objects-through-the-domain` into `value-object-built-only-by-its-check`; `view-transitions-honour-reduced-motion` into `reduced-motion-honoured`; `screens-imported-by-nothing-inside` into `dependencies-point-inward`, which `routes-imported-only-by-the-router` now carries out, and so becomes a MUST. The line between a brand and an alias is drawn once, in `semantic-alias-names-a-shared-meaning`.
  - `catch-narrows-and-rethrows` carries out `errors-surfaced-never-swallowed`, and lets a catch around a library's call map its exceptions to coded errors.
  - `nothing-rendered-as-null` is reviewed: its plugin only allows `null`, and never refuses `undefined`. `query-client-through-router-context` is reviewed too: its import rule exempts the root route, which is where the client is mounted.
  - `toolchain-pinned-and-locked` drops the `MISE_LOCKED=0` workaround, which loosened the lockfile rule for one machine.
  - Installs wait three days for a new release, not seven: a hijacked release is pulled within a day or two, and a week would hold back fixes.
  - Biome's version is pinned by the lockfile like any other, with a caret range in the manifest (`caret-ranges-lockfile-pins`); its nursery rules change only through a reviewed update.
- **Why.** A review of the audit changes found rules that said one thing twice and intros that restated their own rules.

## ADR-0114 — Temporal, anchor positioning and OKLCH
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Dates, times, durations and time zones are `Temporal` values. `Date` appears only where an API demands one, and no date library is used; Biome refuses `moment`, `dayjs`, `date-fns` and `luxon`. A runtime that lacks `Temporal` loads the polyfill once, in the entry file.
  - In the browser, a native `popover` is placed by CSS anchor positioning, with the polyfill where a supported browser lacks it.
  - The theme writes its colours as `oklch()`.
- **Rejected.**
  - Native signals in place of state libraries: the TC39 proposal is still at Stage 1.
  - Waiting for `Temporal` to reach Baseline: Chrome and Firefox ship it, Bun has it, and the polyfill covers Safari until it does.
- **Why.** In 2026 the platform covers what these libraries and scripts did: `Temporal` ships in Chrome 144 and Firefox 139, and anchor positioning is Baseline newly available since Firefox 147, so `baseline-features-only` admits a newly available feature the program polyfills, and the browser's CSS part lets the anchor-positioning properties through. A theme in OKLCH keeps contrast predictable across hues.

## ADR-0115 — The gaps of the audit coverage review
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - `boolean-props-prefixed` drops the `as` prefix, which `polymorphism-through-render` forbids.
  - TypeScript: no `export let` or `export var`, held by GritQL. Inside a `try`, a returned promise is awaited. Retired code is marked `@deprecated` with its replacement (`retired-code-marked-deprecated` in core), and Biome refuses an import of it.
  - TanStack Router with accessibility: the root route moves focus to the new view's heading when a navigation resolves.
  - A transport replaced by captured responses throws on a request none of them matches, in any spec (`unmatched-request-fails-the-spec`, core).
  - The package domain's `deprecation-names-replacement-and-removal` now carries out `retired-code-marked-deprecated`, and adds the removing version.
  - The theme writes no hexadecimal colour: the exemption that let it is dropped, and `noHexColors` now holds `theme-writes-no-hexadecimal-colour` as well (owner).
  - A value object lives in `domain/value-objects/<name>.value-object`, held by ls-lint.
- **Rejected.** A wire type inferred from its schema: the model is declared without the schema library, and `schema-held-exactly-to-its-model` holds the schema to it, as nydra does.
- **Why.** The review of the 2026 audits against the constitution found these accepted gaps unwritten.

## ADR-0116 — What adopting the constitution in a real application ran into
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - A file an author's step generates and the program's code imports — not a build output — is committed; `route-tree-committed` carries that out for TanStack Router, whose guidance counts the route tree as part of the runtime.
  - TanStack Start names its entry files (`src/router.tsx`, `src/client.tsx`) and its wiring (`__root.tsx`); its Stryker and knip parts leave them out of mutation and enter them for knip.
  - Under `bun test`, React DOM specs get a DOM from a preload registered before the sandbox. A browser program's specs are type-checked by a config of their own that adds Bun's types.
  - `bun build` is required only where no other active block owns the program's build.
  - Images name the most specific version they are published under (`major.minor.patch` where there is one), including those a script runs; the linters hold the untagged and `latest` forms. Compose's top-level `include` takes its place after `name`.
  - OFL-1.1 joins the licence allowlist: self-hosted fonts carry it, and it binds only redistribution of the fonts themselves.
- **Rejected.** Making the check pass with no specs, a mutation mode for untested files, and a fixture that loads every file for coverage: a project without tests leaves `test:unit` and `mutation:check` out of its check until the first specs land, and changed lines are held by mutation.
- **Why.** The audit of rozumchik-web against constitution 0.62 found these gaps where a real application meets the rules.

## ADR-0117 — The rules a real application found too strict
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Absence: core's `absence-has-one-value` admits another spelling where an external format or an API the code calls imposes it. `null` stays where an API's types demand it — React's `useRef<T>(null)` and `RefObject<T | null>`, a component's `ReactElement | null` return type, the `null` branch of a JSX conditional, an inline component `() => null`, the language's `Object.create(null)`; a signature a library imposes takes a reasoned suppression. The TypeScript absence plugin also knows `useRef` and `RefObject`, since a Biome plugin path is listed once per configuration and a React-only copy would be overridden: a tool limit, not a rule.
  - A union of literals given to a key utility (`Omit`, `Pick`, `Exclude`, `Extract`) names keys, not a set, and a type of another system's data keeps that system's literals; the enum plugin skips both.
  - A name an interface the code implements imposes, such as a handler's `get`, is no empty verb. A framework's control-flow throw, such as a router's redirect, is allowed beside errors.
  - Another party's vocabulary (analytics reports, wire formats) is mapped from the program's values by a total table, not forbidden as a second typing.
  - An operation whose two operands play one role takes them in order. A function whose body is one markup literal may lift the line limit by a suppression that says so. A story file may export its meta by default, through a storybook part of the presets.
  - A credential cookie is `__Host-` when the program's tier sets it, or `__Secure-` with the narrowest `Domain` when a sign-in service on a sibling host does.
  - A tag manager's container, which changes by design, loads through a loader the CSP allows by nonce or hash with `strict-dynamic`, with its reason — never by listing its host, which the strict policy forbids.
  - TanStack Start sets the CSP and the other security headers in Nitro's `routeRules`, the shell's inline scripts allowed by hash, proved by a test — two rules, one under each browser rule.
- **Why.** The audit of rozumchik-web against constitution 0.62 found each of these rules refusing correct code, or unmeetable, in a real application.

## ADR-0118 — The architecture gaps a real application found
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - `file-carries-its-role-suffix` names a binding unit's plain form, named after its operation in its own folder, among its exceptions, and ls-lint allows it in an operation's folder of `app/`; a domain use-case keeps its `.use-case` suffix.
  - `repositories/` has no surface joining its two sides, held by ls-lint, and a shape both sides use — the page a read returns and a write updates in the cache — is an entity, so an optimistic command imports the entity, never the read port.
  - The kernel holds structural types, not contracts, which are the ports of `contracts/`.
  - The shared mapper of transport failures lives in `shared/<transport>/`, and adapters may import `shared/` for what knows the program.
  - A module that ships styles offers them through a stylesheet surface, `index.css`, beside its script surface, which the program's root imports by path (`module-stylesheet-surface`, CSS); the import rules already let any `index.*` through, so a path past it stays refused.
  - `services-reach-loaders-through-router-context` replaces `adapters-reach-loaders-through-router-context` and carries out `one-explicit-composition-root`: every service the providers build reaches loaders and guards through the router's context. The query client's own rule in the seam with TanStack Query goes, since this one holds it, and `root-imported-only-by-entry-and-delivery-wiring` still keeps routes off `root/`.
- **Rejected.**
  - Letting a command import a read port's types: the shared shape belongs to the entities.
  - Opening `root/ui` to route files: an application shell that knows no feature belongs in `shared/ui`.
  - Kernel surfaces per role folder: the kernel stays one small module with one surface, and a project that lacks `kernel/index.ts` adds it.
- **Why.** The audit of rozumchik-web against constitution 0.62 found these homes and rules missing or contradicting each other.

## ADR-0119 — The UI, i18n and analytics rules a real application found
**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - An element, never a labelled control, that the root renders once and other code must know — a skip link's target, an SVG's shared `<defs>` — takes a constant id with a suppression that says so.
  - A value kept from the previous render is the component's own state, set during its render behind a comparison, as React documents, never a ref.
  - Tailwind's theme tokens are one `@theme` block holding `--*: initial`, and any other `@theme` block is `inline`, held by GritQL; no class list uses the important modifier, held by GritQL on the class strings; the class merger is built with `extendTailwindMerge` from the theme's namespaces.
  - `module-level-text-holds-the-message` (MUST) moves into the i18n domain, since a translation taken when a module loads goes stale whatever the library; Lingui's descriptor rule carries it out.
  - Matomo in a single-page application: the program pushes page views itself with the route's template, and the container's history trigger is off.
- **Rejected.** An `aria-label` instead of a label for a single-field composer: a visually hidden label already meets the rule.
- **Why.** The audit of rozumchik-web against constitution 0.62 found each of these where a real application met the rules.

## ADR-0120 — The sides apart through every surface, and Lingui's macros in the build and the specs
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - `reads-and-writes-apart` holds through a surface as well: a write never reaches a read through a barrel that re-exports both sides, such as a feature's `domain/contracts/index`. The import check follows such a surface.
  - With Vite, Lingui's macros are expanded by Lingui's own plugin with `macroTransform`, never by another plugin's Babel options (`macros-expanded-by-the-lingui-plugin`).
  - With Bun's test runner, a preload expands the macros and compiles an imported catalog (`macros-expanded-by-the-test-preload`); the archive carries the fixture.
- **Rejected.** `bun --bun` in Lingui's scripts: the `[run] bun = true` that `bun` already sets keeps the command line on Bun.
- **Why.** A command that reaches the read side through a barrel depends on it as surely as through a direct import. A check of Lingui 6.9 under Bun 1.4 and Vite 8 found the command line and the build sound without Node, but the React plugin dropping its Babel option without a warning, and `bun test` expanding no macro.

## ADR-0121 — The leftovers of the audit review: licences, case names, consent and states
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - The licence allowlist binds what the program ships or loads at runtime. A tool that only builds, tests or checks it stays off the list as an osv-scanner override by name, `license.ignore` with a reason (`development-tool-licence-ignored-with-reason`); the scanner still checks its vulnerabilities.
  - A case reads `should <behaviour>`, and `when <condition>` only where the behaviour depends on one.
  - `irreversible-operations-behind-flag-and-human` covers what a person or an agent runs against a system — a script, a command line, a migration, a deployment — not the product's own actions.
  - A read that suspends satisfies `data-result-is-union-by-status`, its boundary handling the pending and failed states, and its failure is thrown to that boundary.
  - The client's few global concerns live in small stores the root builds; whether a session exists is one of them, the session's data stays in the cache.
  - A recorded refusal is not asked again for about six months, or until the purposes change.
  - `strict-matcher-only` also refuses `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` and `toBeFalsy`.
- **Rejected.** Scoping the licence exception by the dependency's group: osv-scanner 2.6.0 does not read the group from `bun.lock`.
- **Why.** A check of each item against its tool and its sources: aikit already ignores a tool's licence outside the rules; a condition invented to fill a case name says nothing; a delete button behind a flag is absurd; the allowed suspending read broke two rules as written; one store with the session's data copied into it goes stale; CNIL (2020-092, §37–39) and the ICO advise keeping a refusal and not asking again for about six months; a partial matcher lets the rest of the outcome change unseen.

## ADR-0122 — The architecture leftovers of the audit review
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - The domain imports the shared ports of `contracts/` as well as itself and the kernel: `contracts/` is a shared kernel of ports, on the same inner ring, and the constitution's own lifting rule puts a feature's port there.
  - `shared/` imports no adapter or contract.
  - A feature's root holds only its layers, its `__tests__/` and its surface (`feature-root-holds-its-layers`), held by the import check; a block that adds a layer, such as a UI's, restates the check with it.
  - With Expo and with the command line, nothing below the delivery layer imports a screen or a command; the import check holds it under `dependencies-point-inward`.
  - A route's `to` is never built from strings (`link-targets-never-built`), held by GritQL; the type check accepts a concatenated string.
  - The router preloads on intent (`routes-preload-on-intent`, SHOULD), as TanStack's own guides do.
  - A read's `queryFn` is written only in `cache.utils.ts` (`query-function-only-in-cache-utils`), and `new QueryClient` only in the root, the program's entry files and specs (`query-client-built-by-the-root`), both held by GritQL.
  - A route's `-components/` holds component folders and `-hooks/` hooks files, as their UI counterparts do.
  - Loaders read a `queryOptions` through the query client; the rule no longer names `ensureQueryData`, which TanStack Query 5.104 deprecates.
- **Rejected.**
  - A check that a route's dash folders are private to it: dependency-cruiser refuses a repeated group as an unsafe expression and inserts a route's `$id` or `(group)` into the pattern unescaped, so it took nine nested segments and still erred; review holds `screen-private-pieces-beside-screen`.
  - The feature root's folders held by ls-lint: its overlapping keys resolve at random.
  - Preloading on intent as a MUST: it costs a request for a link hovered and not followed.
- **Why.** Each item was run against its tool before it was written: the domain could not import a port the lifting rule had lifted; a loose `utils.ts` or `hooks/` at a feature's root passed every check; `shared/` and the layers below Expo's and the CLI's delivery reached adapters, screens and commands unchecked; a `'/orders/' + id` passed the type check; inline query options and a module-level client are the libraries' own examples.

## ADR-0123 — The TypeScript, UI and translation leftovers of the audit review
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - A `ts-reset` block: an application loads it once, from `src/reset.d.ts`, so `JSON.parse` and a response body's `json()` return `unknown`, not `any` (`reset-loaded-in-applications`, carrying out `no-any`); a published package never loads it.
  - Biome's `useExplicitReturnType` replaces `useExplicitType`: functions still declare their return type, and a constant checked by `satisfies` keeps its narrow type.
  - A resource is released on every path (`resources-released-on-every-path`, core); `resources-released-by-using` carries it out, and `disposable-held-by-using` is the part Biome's `useDisposables` holds.
  - Lingui's `t`, `plural`, `select` and `selectOrdinal` never run at a module's top level (`t-never-at-module-level`), held by GritQL.
  - Zod 3's forms are refused (`zod-four-forms-only`, MUST), held by GritQL; `.strict()` is refused by choice, since Zod 4 only advises against it.
  - The fields of a `*.entity.ts` or `*.value-object.ts` file are `readonly` (`domain-type-fields-readonly`), held by GritQL; lists and maps stay with review.
  - End-to-end specs scan each screen with axe in the browser, on the WCAG 2.2 A and AA tags (`screens-scanned-in-the-browser`).
  - With Tailwind, `noUndeclaredCustomProperties` is off; on plain stylesheets it stays.
  - `noImpliedEval` and `noExtendNative` are on, as settings that hold no rule.
- **Rejected.** `allowExpressions` on `useExplicitReturnType`, which changes nothing for the arrow functions a project writes; a refusal of `.refine` in a schema, which Zod 4 makes needless since it never narrows.
- **Why.** Each item was run first: under TypeScript 7 ts-reset type-checks and turns `JSON.parse` and the browser's `json()` from `any` to `unknown`, which no lint sees; `useExplicitType` widened every `satisfies` constant; `useDisposables` was on and bound to nothing, and it cannot see a stream's reader; a module-level `t` froze rozumchik-web's labels in one language; Zod 4 marks its old forms deprecated and no rule caught them; the review-only readonly rule held 8 of 585 fields in a real application; axe in Playwright catches contrast and target size that happy-dom cannot, about 150 ms a screen; `noUndeclaredCustomProperties` flags every token of `@theme` and every variable a library sets.

## ADR-0124 — No rule says where the constitution is installed
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** The constitution's install guide links its archive at `.droneey/constitution`, beside the owner's other tools, and a project ignores `.droneey/`; no rule names that path. The mise rule that named the constitution's archive and its link gives way to `shared-configuration-archive-installed-by-mise`, which holds for any archive of shared tool configuration.
- **Rejected.** A rule that says how the constitution itself is delivered: that is its install guide's business, and moving the folder then meant rewording a rule.
- **Why.** The rules govern a project's engineering; where a tool's files land is the tool's own documentation.

## ADR-0125 — A repository of packages is laid out by product, then language
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** A repository of packages keeps each product in `packages/<product>/`: its language-free files — specification, fixtures, hooks — in `packages/<product>/common/`, and each package at `packages/<product>/<language>/<name>/`. A package reaches its own product's `common` and nothing of another package or product; the bun workspaces are `["packages/*/<language>/*"]`.
- **Rejected.** `packages/<language>/libs/<name>/` with one `packages/common/`, which scatters one product — its contract, its fixtures and its packages in each language — over several trees.
- **Why.** The kit's products ship one contract in TypeScript and Python, proven by shared fixtures; one folder per product keeps them together, changed in one pull request (owner).

## ADR-0126 — Lines of 100 characters, and PSF-2.0 and MIT-0 on the licence allowlist
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - Biome formats at a line width of 100, not 80, in the common part every project extends.
  - The licence allowlist gains `PSF-2.0` and `MIT-0`.
- **Why.** At 80 a typed signature or a call of a few arguments breaks over lines that each say little; at 100 this repository's code is about a thousand lines shorter (owner). Both licences are permissive and ask no more than `MIT` or `Python-2.0`, already on the list; `typing-extensions` is `PSF-2.0` and `cffi` is `MIT-0`, and FastAPI and MCP applications load both at runtime (owner).

## ADR-0127 — Python is a language, with uv, Ruff, ty and Poe the Poet
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** `python` is a language context held to every role, its source root `src/<import name>/` of each package, its specs in `tests/` beside `src/`, its entry `main.py`. On foundation it fixes the forms of core's rules: snake_case modules and packages; `test_<name>.py`, `<contract>_fake.py`, `<name>_fixtures.py` and `conftest.py` in `tests/`, the kind of a spec told by its folder; `None` as the only absence; no `Any`, held in signatures and generics; PEP 695 generics; aware datetimes; `@override` on every override; frozen, slotted, keyword-only dataclasses for business data; keyword-only parameters past the third; task groups; no `except` that only passes; Google docstrings only where core allows one; suppressions with their code and a reason after ` -- `; `sys.path` never touched; tools pinned with `==` in the `dev` group, floors for the program's dependencies, `requires-python` at the pinned minor — Python 3.14.8 until 3.15 is out and past the cooldown; with `package`, `py.typed` in every published package. On architecture: role files `<name>_<role>.py` in role folders spelled in snake_case, `__init__.py` as the surface — only re-exports and a sorted `__all__` — and empty in a layer folder; relative imports inside one feature at any depth, never out of it, absolute imports across features; a value from outside `object` until parsed; the environment read only under `root/`. Four implementations: `uv` — the only package manager, `uv sync --locked`, `exclude-newer = "3 days"`, `no-build`, no Python of its own, a workspace and a capped `uv_build` with `package`, `uv version` writing every member; `ruff` — two spaces, single quotes with docstrings in double, lines of 100, families chosen by name, a chain of parts `self.toml` ← `core.toml` ← `python.toml` since `extend` takes one file; `ty` — every rule an error, warnings failing, `# type: ignore` unread, passed as `--config-file`, under which ty reads no `[tool.ty]`; `poethepoet` — the check command of a repository without a JavaScript toolchain, `poe check` over `<area>:check` tasks. ls-lint takes the Python forms and the role folders; its `uv` and `ruff` parts skip `.venv` and `.ruff_cache`; lefthook's `ruff` part fixes and formats staged files; `templates/project/python/` carries the `pyproject.toml` of the settings with no preset and the `.gitignore` of the bytecode. This repository pins Python and uv in mise and the Python tools in its own `dev` group, which the e2e specs run; OSV-Scanner reads `uv.lock` as it is.
- **Rejected.** Pyrefly, the reviews' choice, for ty, from the makers of uv and Ruff, though it is in beta (owner); double quotes and four spaces, the experts' choice, for single quotes and two, as in TypeScript (owner); `ban-relative-imports = "all"` (`TID252`), which forbids the relative imports a feature keeps inside itself (owner) — a small AST check will hold them, and the 100 and 500 line limits, from the archive's `tools/`; mise tasks for the check of a repository without JavaScript, for Poe the Poet in `pyproject.toml` (owner); an architecture part for Ruff, whose only candidate — `os.environ` banned outside `root/` — needs per-file ignores that resolve against the part's own folder, or match any path with a `root` in it; a glob in ls-lint's `ignore` for `__pycache__`, which makes ls-lint walk every link of the project, for rules that admit the bytecode's names.
- **Why.** A second language takes the same rules as the first in its own forms, held by the tools its practice has settled on, so a product written in TypeScript and Python is reviewed and checked the same way in both.

## ADR-0128 — Python is tested by pytest, Hypothesis and mutmut, and checked by import-linter, deptry, vulture, complexipy and python-check
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Seven implementations, each held to core's testing and code rules in Python. `pytest` — strict, `importlib`, warnings as errors, a coverage gate of 100 percent of lines and branches through pytest-cov with `--cov` in the check and never in `addopts`, pytest-randomly's order, no rerun plugin, `tests/integration/` and `tests/e2e/` left out of the unit run by `norecursedirs`, the network refused by an autouse fixture of `tests/conftest.py` that the integration folder overrides, no `unittest.mock` and no patched module, async specs on anyio's plugin; run in each package with `pythonpath = ["tests"]`. Ruff's part `pytest.toml` extends `python.toml` as the last link of the chain, with `PT` and the bans of skips, expected failures, the `flaky` mark, `unittest.mock` and `pytest_asyncio`, and a project lifts only `S101` and `INP001` in `tests/`. `hypothesis` — properties written with `@given`, counterexamples kept by `@example`, and under `CI` its own `ci` profile, which already derandomizes and keeps no database. `mutmut` — every mutant killed, an equivalent one marked on its line by `# pragma: no mutate -- <reason>`, each mutant run without randomness or coverage; its gate is the archive's `tools/mutmut-check`, which clears `mutants/`, mutates the functions a change touches, a new module whole and the module a changed spec is named after with those it imports, and fails on every mutant not killed — survivor, untested or timed out. `import-linter` — core's import rules as contracts named after them, written over wildcards (`*.kernel`, `*.features.*`) so one template fits any package. `deptry` — unused dependencies and dev tools imported by the program. `vulture` — unused code from a confidence of 60, over `src` alone so code only the specs reach is dead, names a framework reaches in `ignore_names` with a reason. `complexipy` — cognitive complexity at most 10. `python-check`, the constitution's own Python tool in the archive's `tools/`, holds a function of at most 100 lines and a file of at most 500 outside `tests/`, and a relative import kept inside its module — a feature, a top-level folder, or the package root — with a feature never importing its own absolute path. The settings of the tools without `extends` start from `templates/project/python/pyproject.toml`, its check a sequence of Poe the Poet tasks, and `tests/conftest.py` beside it; ls-lint's parts skip the folders the tools write. Both Python tools are members of this repository's uv workspace and are held by its check — format, lint, types, their own limits, coverage, mutation and unused code — and the release builds them as `.pyz` archives the project's interpreter runs.
- **Rejected.** Extending `tools/mutation-check` to drive mutmut, which would make a repository without JavaScript install Bun to run one gate; a threshold below every mutant, which core forbids; `mutate_only_covered_lines`, which hides the mutants no spec reaches; a profile of the project's own for CI, which Hypothesis already ships; a whitelist module for vulture, which Ruff then flags as a module of useless expressions outside a package; vulture at 80, which reports no unused function or class; per-file ignores in a Ruff part, which resolve against the part's own folder; a Python tool installed from the archive as a package, which a project would have to build, for a zip archive the interpreter runs as it is.
- **Why.** Python's specs are measured as TypeScript's are — by coverage of every branch and by every mutant killed — and its imports and sizes are held by tools, not by review, so a package written in both languages meets the same bar in each.

## ADR-0129 — Python's libraries: pydantic at the edge, FastAPI, FastMCP, structlog and httpx2
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Five library blocks, each held to core's rules in its own forms, the tool-held part of each a child in the tool's seam with it.
  - `pydantic` answers the convergence domain's three requirements — `extra='forbid'`, `Field(discriminator=...)`, `model_json_schema()` — and stays at the edge: an adapter's wire models, the delivery layer's request and response models, `libs/` and `shared/` code that parses, the settings under `root/`, while `kernel/`, `contracts/` and a feature's `domain/` hold the frozen, slotted, keyword-only dataclasses of the language block. An owned document's model is strict and forbids unknown keys, a vendor's ignores them; models are frozen; secrets are `SecretStr`; a `ValidationError` becomes the details of one coded error without the rejected values; the published schema comes from the model; the environment is read by one `BaseSettings` that the root builds; only pydantic 2's forms are written. import-linter's contract `pydantic-kept-out-of-the-domain` holds the edge, and ty holds the forms pydantic marks deprecated, which its part already makes errors.
  - `httpx2` answers the remote-data domain's transport requirements, its retries in part: a timeout of the system's own on every client and no `timeout=None` (MUST), one `AsyncClient` per system built by the root and open for the program's life, bodies parsed by their model and never through `response.json()`, failures mapped in the adapter, retries written in the adapter, and `MockTransport` in specs that refuses an unexpected request; import-linter's `httpx2-kept-to-the-edge` keeps it out of `kernel/`, `contracts/`, `composition/` and a feature's `domain/` and `app/`.
  - `structlog` renders every record of the standard library's `logging` through one chain — `ProcessorFormatter` with the same `foreign_pre_chain`, secret keys masked, `merge_contextvars` and a trace id the middleware binds, JSON in production and console lines in development, events with fields in `extra`; code logs through `logging.getLogger(__name__)`, and only `root/` configures and imports structlog, which import-linter's `structlog-imported-only-by-the-root` holds. Seams with FastAPI and FastMCP send Uvicorn's records (`log_config=None`) and fastmcp's (its handler removed, or `FASTMCP_LOG_ENABLED=false`) through the same chain.
  - `fastapi` requires pydantic: parameters and dependencies in `Annotated` (`FAST002`) and every path parameter taken (`FAST003`), held by Ruff's new part `fastapi.toml`, the last link of the chain after the specs' part; the program raises the error kit's errors, never `HTTPException`, which the part bans; the `lifespan` opens and closes what the app keeps; async handlers never block; the root assembles the app and registers the error kit's handlers; an unexpected failure is logged once, with `uvicorn.error`'s second record filtered; specs run through `ASGITransport`.
  - `fastmcp` requires pydantic: every tool and parameter described for the model (MUST), arguments bounded by their annotations, one middleware the root adds answers every failure with `mask_error_details=True`, a validation error inside a tool masked as internal, no `ToolError` raised by the program, specs through the in-memory `Client`.
  - The template's `[tool.importlinter]` turns on `include_external_packages` so a contract can name a library, and its cycle contract names the package, since `*` would match the libraries too; each library's contracts are `forbidden` with indirect imports allowed, so a project that does not use the library keeps the section harmlessly. This repository pins pydantic in its `dev` group for ty's specs.
- **Rejected.** `protected` contracts listing where a library may be imported, which fail when the library is absent from the graph; Ruff's `FAST001`, which reports nothing under Python 3.14's lazy annotations; a Ruff part for FastMCP, whose chain would then run through FastAPI's part; the libraries' bans in `extend-banned-api` without the specs' bans repeated, since a part's `extend-banned-api` replaces the one it extends; structlog's own logger API in the program, for the standard logger every library already writes to.
- **Why.** The kit's Python packages and the owner's APIs are built on these libraries; each gets the rules its practice settled on, held by the tools the language block already runs, so the edge, the network and the logs are kept as in TypeScript.

## ADR-0130 — An editor finds the specs' own TypeScript configuration
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Where specs need Bun's types and the program does not, the program's configuration is `tsconfig.src.json`, the specs' is `tsconfig.test.json`, and `tsconfig.json` holds no files and references both (`specs-checked-by-their-own-config`).
- **Rejected.** The program's configuration as `tsconfig.json` with the specs left out: an editor reads only `tsconfig.json`, so it opened every spec without the `ESNext` lib, Bun's types or the decorator options and reported errors the check never saw.
- **Why.** The solution-style configuration, as Vite's templates use it, gives each file its own configuration in the editor and in the check alike (found in droneey/kit).

## ADR-0131 — Bun takes the program's options from tsconfig.json
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Under `specs-checked-by-their-own-config`, `tsconfig.json` extends `tsconfig.src.json` and keeps `files` and `include` empty, beside its references to both configurations. Amends ADR-0130.
- **Rejected.** A `tsconfig.json` with references alone (ADR-0130): Bun's transpiler reads only `tsconfig.json` and follows no reference, so a spec run by `bun test` lost the program's transpiler options, such as its decorators.
- **Why.** Extending the program's configuration gives Bun its options, while TypeScript still reads a file with no files of its own as a solution and opens each file with the configuration that holds it (verified on Bun 1.4.2 and TypeScript 7.0.2).

## ADR-0132 — One script for each area of the check, whatever the language
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Each area of the check has one `<area>:check` script, or Poe task, that runs every tool of that area in each language of the repository: `lint:check` runs Biome and Ruff, `type:check` tsc and ty, `test` both runners (`check-chains-area-scripts`, `check-chains-area-tasks`, which replace `check-chains-tool-scripts` and `check-chains-tool-tasks`).
- **Rejected.** A prefix for the second language, `python:lint:check`: two families of names, and `lint:check` would quietly check one language.
- **Why.** A person, CI and the hooks run one name per area, and a language added later joins the areas instead of adding names.

## ADR-0133 — NestJS's decorator options are written where Bun reads them
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** `experimentalDecorators` and `emitDecoratorMetadata` are written in the `tsconfig.json` that `bun test` runs from, the root's in a repository of packages, besides the nestjs part it extends (`decorator-options-where-bun-reads`).
- **Rejected.** A Bun built from the open fix (oven-sh/bun#43110), which no release carries; the options through the presets alone, which Bun 1.4.2 drops.
- **Why.** Bun's transpiler ignores an `extends` array (oven-sh/bun#43097), so a spec fails at its first decorated member while tsc passes; the rule goes with the Bun release that follows the array.
