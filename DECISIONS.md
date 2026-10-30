# Decision Log

> A journal of the decisions behind the constitution and the reasoning behind them. **Not a rulebook** — the blocks say *how things are*; this log records *why it was decided and what was rejected*.
>
> **Conventions:** one entry per choice between real alternatives — one a later reader could propose again — naming what was rejected and why; a rule placed by the constitution's own instructions needs no entry. Entries are numbered and kept. A new decision is a new entry; the entry it replaces takes the status `Superseded by ADR-NNNN`, and one it changes in part keeps its status and names the part and the new entry in a line **Superseded in part.** Statuses: `Accepted` · `Proposed` · `Superseded by ADR-NNNN`.
>
> Its entries record the decisions of the constitution 1.0 in number order, each with the date it was taken.

| Theme | Entries |
|---|---|
| Scope | ADR-0001 |
| Blocks and layers | ADR-0002 – ADR-0005, ADR-0007 |
| Project files | ADR-0009, ADR-0010, ADR-0102, ADR-0208, ADR-0231 |
| Rules and roles | ADR-0013 – ADR-0016, ADR-0144, ADR-0219, ADR-0226, ADR-0232, ADR-0240 |
| Overrides and precedence | ADR-0020 |
| Delivery | ADR-0026 |
| The anatomy | ADR-0029, ADR-0032, ADR-0033, ADR-0035, ADR-0036, ADR-0141, ADR-0143, ADR-0157, ADR-0158 |
| The rest | ADR-0043, ADR-0045 |
| Testing | ADR-0046 – ADR-0049, ADR-0220 – ADR-0222, ADR-0236, ADR-0255 |
| Code | ADR-0050, ADR-0052 |
| Core | ADR-0053 – ADR-0055, ADR-0057, ADR-0058, ADR-0060, ADR-0062, ADR-0063 |
| Blocks | ADR-0064, ADR-0066 – ADR-0076, ADR-0092, ADR-0095, ADR-0206, ADR-0209, ADR-0210, ADR-0211, ADR-0214 – ADR-0216, ADR-0233, ADR-0242 |
| Tools and tests | ADR-0077 – ADR-0084, ADR-0086, ADR-0096, ADR-0097, ADR-0099, ADR-0101, ADR-0103, ADR-0105, ADR-0138 |
| Axes | ADR-0088 – ADR-0091, ADR-0093, ADR-0094, ADR-0098 |
| The 2026 audits | ADR-0104, ADR-0106 – ADR-0110, ADR-0113 – ADR-0115 |
| A real application | ADR-0116, ADR-0118 – ADR-0123 |
| Delivery of the constitution | ADR-0124 |
| Workspaces and distribution | ADR-0125, ADR-0139, ADR-0150, ADR-0151, ADR-0159, ADR-0207, ADR-0213, ADR-0217, ADR-0218, ADR-0227, ADR-0228, ADR-0229, ADR-0237, ADR-0238, ADR-0245, ADR-0248 – ADR-0250 |
| Line width and licences | ADR-0126 |
| Python | ADR-0127 – ADR-0129, ADR-0140, ADR-0142 |
| TypeScript configuration | ADR-0130, ADR-0131, ADR-0133, ADR-0257 |
| Scripts of the check | ADR-0132, ADR-0241 |
| Dependencies | ADR-0134, ADR-0145, ADR-0251 |
| Levels | ADR-0135 |
| Domains | ADR-0136, ADR-0137, ADR-0253, ADR-0254 |
| The expert review of #271 | ADR-0146 – ADR-0149 |
| The fifth audit | ADR-0152 – ADR-0154 |
| What a tool holds, not how it runs | ADR-0155, ADR-0234, ADR-0235, ADR-0243, ADR-0244, ADR-0246, ADR-0247 |
| The sixth audit | ADR-0156 |
| One home per rule | ADR-0160 – ADR-0186 |
| The program's tree | ADR-0187 – ADR-0190, ADR-0194, ADR-0195, ADR-0199, ADR-0239, ADR-0256 |
| A project's decisions and the cost of its work | ADR-0191 – ADR-0193 |
| The 2026 expert audit | ADR-0196 – ADR-0198 |
| What a tool holds and what review holds | ADR-0200 – ADR-0202, ADR-0258 |
| The plugin and the project's rules | ADR-0203 – ADR-0205, ADR-0212 |
| The whole-repository review of #383 | ADR-0223, ADR-0225 |
| Formatters | ADR-0224, ADR-0230 |
| Evans' layers, the model that decides and the cohesion review | ADR-0259 – ADR-0268 |

---

## ADR-0001 — Not now: versions per block, rules for other AI tools

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** The constitution is versioned as a whole, and it is written for Claude Code alone.
- **Rejected.** Versions per block, which multiply the combinations a project must reconcile; rules for other AI tools, which no project uses yet.
- **Why.** Neither has a present consumer.

## ADR-0002 — Four layers: core, domains, contexts, implementations

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** Blocks sit in four layers, from the most abstract down: `core`, true for any program; domains, an aspect a project has or has not whatever its technology — `ui`, `api`, `i18n`; contexts, where the code runs (a platform such as `browser` or `cli`) or what it is written in (a language such as `typescript`); and implementations, a framework, library or tool — `react-dom`, `bun`, `git`. There is no `web` block: a browser application is `browser` plus `ui`. Implementations carry no framework, library or tool tag.
- **Rejected.** A `web` block: a browser program is `browser` plus `ui`, and a block bundling both would repeat each for a program that has one without the other.
- **Why.** Each layer combines freely with every element of the others and reduces to none of them; a combination lives in the more specific block or in a seam file.

## ADR-0003 — Two links between blocks: requires and extends

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `requires` names a block that must also be active; it points up the layers, or to a host of the block's own layer — one it cannot work without, because it imports it, runs it, configures it or is defined over it (`fastapi` on `pydantic`, `mutmut` on `pytest`, `rest-api` on `http-server`, `design-system` on `ui`). A pair where each works on its own is a seam in `with/`, and the links among implementations are acyclic. `extends` inherits an abstract base of the block's own layer, which comes with its heir (ADR-0004). A tool never adds a domain: the project lists every domain, environment properties such as `untrusted-client` included. Choosing a tool, or using one that has no block, is not a departure.
- **Rejected.** An `activates` link through which a platform switched domains on, and inheritance from several bases.
- **Why.** Every block a project follows stays visible in its own file; nothing is added behind its back except an abstract base, which comes with its heir.

## ADR-0004 — Abstract blocks on every layer but core

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** An abstract block is one never used alone — `_react` among implementations, `_api` among domains — on any layer but core. Its id starts with `_` exactly when `abstract: true`, its folder sits flat beside its heirs, and it has at least one heir and names none of them. `extends` inherits only an abstract base of the block's own layer (`react-dom` from `_react`, `rest-api` from `_api`) and names one; a concrete block another builds on is a `requires`. Requiring an abstract block is satisfied by any of its heirs, and a project never lists one. Every rule of a base holds for every heir, and an heir's rules bind only what its own kind serves, so two heirs active in one program never bind each other's operations. A new abstract block waits for its second heir.
- **Rejected.** A block with two bases; `extends` of a concrete block, which added a block to a project's list behind its back, while `requires` names the same host and its rules reach the same parents.
- **Why.** A base holds what its heirs share and nothing one of them lacks, so an heir adds rules and never has to undo one; a base no project lists cannot be followed without the heir that gives it meaning.

## ADR-0005 — Seam rules live in with/ files

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule that needs two blocks lives in a `with/<other>.md` of the block it refines — at the block's root for the base, in `architecture/` or `workflow/` for those axes — named after a block of its own layer or above: `ui/architecture/with/remote-data.md`, `browser/with/ui.md`. A project receives the file only when both blocks are active. It is the one place a block names a sibling it works without. A seam named after an abstract block, `with/_api.md`, applies when any of its heirs is active.
- **Rejected.** Conditional sections inside a block's main file.
- **Why.** A file per seam stays readable as seams multiply, and its name says when it applies.

## ADR-0007 — Every schema is complete

**Date:** 2026-09-25 · **Status:** Superseded by ADR-0102

- **Decision.** A block's front matter declares every field of the schema, in the schema's order, with `[]`, `null` or `false` where it has nothing to say; the constitution's check rejects a missing or extra field. `constitution.yaml` lists every key the same way, with `[]` or `{}` where empty, and the hook warns about a missing one.
- **Why.** No reader, hook or check has to guess whether an absent field means empty or forgotten.

## ADR-0009 — A project keeps constitution.yaml and PROJECT.md

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project declares the blocks it follows, its applications, its check command and its overrides in `constitution.yaml`, and describes the product — what it is, for whom, its domains, entities and glossary — in `PROJECT.md`. A project keeps no `DECISIONS.md`: a departure is an override, and git history keeps its record.
- **Rejected.** A `DECISIONS.md` or ADR log in each project: a departure is an override with its reason, and git history keeps the record.

## ADR-0010 — A project pins a released version

**Date:** 2026-09-25 · **Status:** Superseded by ADR-0208

- **Decision.** `constitution.yaml` pins a released version; until 1.0.0 it pins the current 0.x one.

## ADR-0013 — Rules: one format, global slugs

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule is a heading with its slug, its statement, and an **Example** where one is needed; ADR-0089 gives the heading and the table under the statement. A slug is kebab-case, unique across the whole constitution and carries no number. It is renamed whenever its rule's statement outgrows it, with no entry in this log; a project's override that names an old slug is reported by the hook. Blocks, labels and hook output are written in English.
- **Rejected.** Numbered rules, which shift with every insertion.

## ADR-0014 — No rule above the implementations names a tool

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** No rule of core, a domain or a context names a tool, and no rule's check does: a rule names the role of its check; the tool's block says which roles it checks and how to build its configuration. The configuration is a separate file — a preset of the constitution's release archive or the project's own — built to hold every active rule of its roles.
- **Rejected.** A rule that names its tool or its setting; the preset's `bindings.yaml`, ADR-0094, maps them instead.
- **Why.** A tool can then be swapped without touching a rule.

## ADR-0015 — A tool-checked rule names its role

**Date:** 2026-09-25 · **Status:** Superseded by ADR-0054

- **Decision.** A rule's check is `test`, `review`, or `tool — <role>` with a role from a closed list: `format`, `lint`, `types`, `architecture`, `names`, `unused`, `versions`, `tests`, `coverage`, `mutation`, `secrets`, `audit`. A language or an implementation lists the roles it checks in `checks`. When a tool-checked MUST rule's role has no tool for a language the rule applies to, the hook warns and the constitution's check reports it.
- **Why.** Only MUST rules count, so a missing tool for an advisory rule raises no noise.

## ADR-0016 — Every rule carries a lens

**Date:** 2026-09-25 · **Status:** Superseded by ADR-0089

- **Decision.** Every rule has at least one tag from a closed list of lenses — `a11y`, `security`, `performance`, `ux` and the rest — so a review can run by lens across all layers at once.

## ADR-0020 — Overrides: any rule, with consent and a reason

**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** An override lowers one rule to SHOULD or MAY — any rule, core MUST included. It is added only with the user's explicit consent in the chat, for that override; `reason` is required and `until` is optional. Written in a member's own `constitution.yaml`, it applies to that unit's files.
- **Rejected.** Rules no override may lower; blanket waivers.

## ADR-0026 — Generated files are committed only here, in digests/

**Date:** 2026-09-25 · **Status:** Superseded by ADR-0062

- **Decision.** The pieces the hook reads are generated into `digests/`, committed, and verified by regeneration. This is the one repository that commits generated files; the `workflow` rules keep forbidding them in projects.

## ADR-0029 — Every grouping folder has a surface

**Date:** 2026-09-24 · **Status:** Superseded by ADR-0052

- **Decision.** Every folder that groups modules has a surface file that re-exports what its consumers may couple to — the module's offer — and nothing else.

## ADR-0032 — What dead code is

**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Dead code means unused files, dependencies and internal code. An unused export of a surface is not dead code: a surface offers what its consumers may use.
- **Rejected.** Counting a surface's unused exports as dead code, as knip does by default: a surface offers what its consumers may use.

## ADR-0033 — Coverage is 100 percent on every gated layer

**Date:** 2026-09-24 · **Status:** Superseded by ADR-0048

- **Decision.** Every gated layer is held at 100 percent. UI code, and a project that adopts the gate late, reach it through a ratchet floor that only rises.

## ADR-0035 — A UI application composes through its providers and binding units

**Date:** 2026-09-25 · **Status:** Superseded by ADR-0066

- **Decision.** In a UI application, providers build the shared transport and configuration, adapters are module objects over them, each binding unit binds its operation's adapter, and tests replace the transport through the test sandbox. It is stated in `ui/with/remote-data.md`.
- **Why.** It is the form of the owner's reference web application.

## ADR-0036 — Vendor libraries stay out of the domain

**Date:** 2026-09-26 · **Status:** Accepted

- **Context.** The first validator of this repository parsed YAML and checked schemas with a validation engine inside its domain code, reading the purity law as "no side effects".
- **Decision.** No vendor library is imported under `domain/`, a pure one included. Parsing a format and checking its wire shape happen in an adapter behind a port, with the wire shapes as that adapter's models, and the domain checks its own rules on the parsed data.
- **Rejected.** A pure vendor library — a YAML parser, a validator — in `domain/`, read as allowed because it has no side effects.
- **Why.** The core imports only itself and the shared kernel, so a vendor's types and upgrades never reach it.
- **Superseded in part.** A library of one outside format or arithmetic one value object imports is admitted by ADR-0262.

## ADR-0043 — Python configs and tools live in devkit

**Date:** 2026-09-24 · **Status:** Superseded by ADR-0091

- **Decision.** The shared configurations of the Python tools live in devkit, under `packages/python/`, until a project needs them in the constitution's archive.

## ADR-0045 — oxlint is not adopted now

**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** oxlint is not adopted now; Biome keeps holding the lint rules, as far as it can.
- **Rejected.** oxlint beside or instead of Biome: a second linter splits one role between two tools and two configurations.

## ADR-0046 — A spec proves the behaviour of a boundary

**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A spec proves one boundary — a use case, a command, an adapter, a screen, a reusable component, a library primitive, a module of pure rules — and is named after it. What a boundary uses is proven through its spec; a helper gets a spec of its own only when its logic is worth cases of its own, and is then a module of pure rules. A case checks what a caller observes — a returned value, a changed state, what a user sees — and a call on a fake only when the call is the behaviour. Types, constants, schemas, composition, entry files, generated files and third-party code get no spec; a constant does only when a reader outside the code relies on it, as one table. Unit tests prove the domain with fakes; integration tests prove each adapter against the real engine in a sandbox, in `<name>.integration.test`, one case for each port operation and each failure it maps; end-to-end tests prove each critical scenario the project names, through the delivery layer. A file in `__tests__/`, or in the folder of end-to-end specs, is a spec named after the file or the scenario it proves (`<name>.test`, `<name>.integration.test`, `<name>.e2e.test`), a fake (`<port>.fake`) or fixtures (`<name>.fixtures`), and nothing else: a spec named otherwise would not run. The linter holds the names.
- **Rejected.** One spec per source file; checking the calls of mocks; the `fake-<port>` prefix.
- **Why.** A spec per file mirrors the layout, not the behaviour: it breaks when a helper moves and the behaviour stays, and its cases repeat what the boundary's spec already proves (#49).

## ADR-0047 — A case earns its place, and mutation measures the tests

**Date:** 2026-09-26 · **Status:** Accepted

- **Decision.** A case earns its place by failing for a plausible bug no other case catches; a case that cannot — a restated constant, a check of the library or the framework, a duplicate — is deleted. Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment. A bug fix begins with the test that reproduces the bug. When a behaviour is described before it is built, in an issue or a plan, an agent writes its tests from the description first; a person may write the code first. Mutation testing measures the tests, and every mutant of the logic a change touches is killed. A mutant in code no test runs survives, so the rule also holds every line of logic to a test.
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

- **Decision.** Internal code spells absence as `undefined`. `null` lives only in wire types and in the adapters, which map it to `undefined`, and where a platform API returns it, which the code compares and never passes on. The compiler runs with `exactOptionalPropertyTypes`; the linter forbids `==` with `null` and, through a GritQL rule, any `null` outside the adapters but a comparison. The constitution's presets carry the three, so every project gets them.
- **Rejected.** Holding the rule by review alone; banning every `null`, comparisons included.
- **Why.** Two spellings of absence make every check ask twice, and a rule held only by review slips.

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

**Date:** 2026-09-27 · **Status:** Superseded by ADR-0160

- **Decision.** A rule's check is `test`, `review`, or `tool/<role>` with a role from this closed list: `format`, `lint`, `types`, `imports` (ADR-0103), `names`, `unused`, `versions`, `tests`, `coverage`, `mutation`, `secrets`, `audit`, `commits`. `names`, `secrets` and `commits` hold in any language; the others are checked per language. A language or an implementation lists the roles it checks in `checks`. When a tool-checked MUST rule's role has no tool for a language the rule applies to, the hook warns and the constitution's check reports it.
- **Rejected.** Checking commit messages and branch names under `lint`, which is checked per language and would report a missing tool for every language.
- **Why.** A commit message belongs to no language, and a rule held by a tool must say so to be counted.

## ADR-0055 — The laws of 1.0

**Date:** 2026-09-27 · **Status:** Superseded by ADR-0163

- **Decision.** The laws are the MUST rules of `principles`, and the only MUST rules there. The fourteen laws of 0.8 stay; mechanical enforcement becomes the law that every rule whose check names a role is held by a tool of that role; extension by addition, contracts shaped by the role that uses them, and untrusted input parsed once at the edge join them.
- **Rejected.** Dropping mechanical enforcement as a mechanism rather than a law.
- **Why.** Each of the added three was already required by several blocks; as laws they are stated once and bind everywhere.

## ADR-0057 — A block never cites the decision log

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A block states its rules, with their reasons, without citing an entry of this log; the constitution's check reports a citation.
- **Rejected.** Citing an entry of the log from a rule, as many rulebooks do.
- **Why.** A rule must stand on its own when a project reads it, and the log explains the constitution's history, not a project's duty.

## ADR-0058 — Placement lifts on the second consumer, abstraction waits for the third

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** Code moves to the nearest common level when a second consumer needs it; a shared abstraction over similar code waits for its third occurrence. Don't-repeat-yourself applies to knowledge, not to text that looks alike.
- **Rejected.** One threshold for both, which either shares code too late or abstracts it too early.
- **Why.** Moving code changes where it lives, not what it means; an abstraction commits to an axis of variation, which two cases cannot yet show.

## ADR-0060 — A YAML file ends in .yaml

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A YAML file ends in `.yaml`, never `.yml`, in every repository; the `names` role holds it. A file a tool reads only by a fixed name keeps that name: GitHub reads issue forms in `.github/ISSUE_TEMPLATE/` only as `.yml`.
- **Rejected.** `.yml`, the shorter spelling many tools write by default; renaming the issue forms too, which switches them off.
- **Why.** One spelling of one format lets every glob, tool and reader find all of them.

## ADR-0062 — Generated files are not committed by default, and the check only checks

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** A project does not commit generated files by default; an application that commits some of them chooses which. The check verifies and never changes a tracked file: it generates, formats and rewrites nothing.
- **Rejected.** Forbidding every committed generated file in projects; a check that regenerates what it checks.
- **Why.** Which generated file is worth committing depends on the application, and a check that writes can pass by changing what it checks.
- **Superseded in part.** What the check may write, by ADR-0229: a step may write untracked build output that the check then reads, never a tracked file.

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

## ADR-0066 — An adapter receives its transport

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** An adapter receives the transport and clients it speaks through, and never imports a shared instance — in every kind of application, a user interface included. In a UI application the providers are the composition root: they build the configuration, the transport and the cache client, build each adapter from the transport, and hand the adapters to the binding units.
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

**Date:** 2026-09-27 · **Status:** Superseded by ADR-0094

- **Decision.** A tool block says which roles it checks and what its configuration holds. The configuration — a preset, a project's own file — carries no comment per setting naming the rule it holds.
- **Rejected.** Naming each setting's slug in a comment: nothing would check the names, and they would drift.
- **Why.** The block's text is the one place the constitution and the tool meet; a second mapping in every configuration is a detail nobody keeps.

## ADR-0073 — The constitution carries the presets that name its folders

**Date:** 2026-09-27 · **Status:** Superseded by ADR-0076

- **Decision.** A tool preset whose rules name the constitution's folders, files or suffixes — Biome's plugins scoped to `adapters/` or `.hooks.ts`, dependency-cruiser's layer sets — ships in the constitution's own package as `@droneey/constitution/<tool>`, in the version of its blocks. devkit's presets hold only what any team can take. A spec fails when the constitution's preset names a folder or suffix its blocks do not write.
- **Rejected.** Keeping that preset in devkit, where the folders are written a second time and a rename switches a rule off unnoticed; generating devkit's preset from the blocks, a build between two repositories.
- **Why.** A folder renamed in a block and in its preset changes in one pull request and ships in one version, and a project pinned to a version of the constitution gets that version's preset.

## ADR-0074 — betterleaks holds the secrets

**Date:** 2026-09-27 · **Status:** Accepted

- **Decision.** The secrets role is held by betterleaks: the `betterleaks` block replaces `gitleaks`. The check scans the history the clone holds and the uncommitted changes, every report is redacted, and a false positive is allowed by `betterleaks:allow` or by its fingerprint in `.betterleaksignore`, each with its reason.
- **Rejected.** gitleaks, which is feature-frozen; scanning `origin/main..HEAD`, which a clone of one commit cannot resolve; `betterleaks dir`, which reads ignored files such as a local `.env`.
- **Why.** betterleaks is maintained by gitleaks' author, reads the same configuration and finds more; the scan the rules name then works on a laptop and on a shallow CI clone alike.

## ADR-0075 — A tool outside the package manager takes its configuration from devkit's archive

**Date:** 2026-09-27 · **Status:** Superseded by ADR-0091

- **Decision.** The configuration of a tool that is not JavaScript — lefthook, betterleaks — comes from devkit's release archive, which mise installs pinned by version and checksum and links as the ignored `.devkit`; mise's `postinstall` hook also installs the git hooks. npm carries only the configuration of JavaScript and TypeScript tools.
- **Rejected.** npm packages for those tools, which a repository of another language cannot take; a git submodule, which every clone and every CI checkout must fetch; lefthook's remotes, which put the version into every path and hide the files in `.git`; a branch of built files, which grows the history with each release.
- **Why.** The configuration then arrives like the tools themselves — pinned, verified against its checksum, the same in every language — and a release can carry built files as well as sources.

## ADR-0076 — The constitution ships the presets that name its folders in its release archive

**Date:** 2026-09-27 · **Status:** Superseded by ADR-0091

- **Decision.** A tool preset whose rules name the constitution's folders, files or suffixes ships with the constitution, in the version of its blocks, as `presets/` in its release archive `constitution.tar.gz`. A project installs the archive with mise and links it as `.constitution`, as it links devkit's archive as `.devkit`; the constitution links itself there. A spec fails when a preset names a folder or suffix the blocks do not write.
- **Rejected.** Keeping the preset in devkit, where the folders are written a second time; exporting it from the constitution's package and taking it from git by tag, a second way beside devkit's archive; generating devkit's preset from the blocks.
- **Why.** A folder renamed in a block and in its preset changes in one pull request and ships in one version, and the preset arrives like devkit's configuration — pinned, verified against its checksum, at one path.

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

**Date:** 2026-09-28 · **Status:** Superseded by ADR-0188

- **Decision.** With TanStack Router, a screen's specs live in the `__tests__/` of its `-components/` or `-hooks/`, beside the pieces they prove, never in a `__tests__/` of the route folder.
- **Rejected.** A `__tests__/` beside the route file with `routeFileIgnorePattern` set in every project, a setting each router configuration must repeat.
- **Why.** The route generator skips only names that start with a dash; a `__tests__/` elsewhere under `routes/` is read as route files and warned about on every generation.

## ADR-0081 — osv-scanner holds the audit, and any known vulnerability fails the check

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** The `audit` role is held by osv-scanner: the `osv-scanner` block replaces `bun`'s `audit-in-the-check`. It checks the lockfiles of any language for known vulnerabilities and every licence against the shared allowlist, in one run. `known-vulnerabilities-fail-the-check` now fails on a known vulnerability of any severity, not only a high or critical one; an accepted one is an `[[IgnoredVulns]]` entry with its reason and expiry. `audit` becomes a language-free role, as `names`, `secrets` and `commits` are: a block with no language, such as osv-scanner, holds it for every language.
- **Rejected.** `bun audit --audit-level=high`, which checks no licence, reads only Bun's lockfile and keeps an accepted advisory as a bare `--ignore` flag with no reason or expiry; running both tools, since osv-scanner fails on a medium vulnerability all the same and each one would be recorded twice.
- **Why.** One tool and one configuration hold vulnerabilities and licences in every language, and every exception carries its reason and date. osv-scanner has no severity floor, so the rule takes the stricter line rather than a second tool.

## ADR-0082 — A YAML name a tool fixes keeps its extension

**Date:** 2026-09-28 · **Status:** Superseded by ADR-0060

- **Decision.** `yaml-files-end-in-yaml` excepts a file a tool reads only by a fixed name: GitHub reads issue forms and their `config.yml` in `.github/ISSUE_TEMPLATE/` only with `.yml`. The ls-lint base leaves that folder out.
- **Rejected.** Renaming them, which switches the forms off; leaving the rule without the exception, which every repository with issue forms would break.
- **Why.** A name the reading tool fixes is not the project's to choose, as `file-carries-its-role-suffix` already says of other fixed names.

## ADR-0083 — At most three positional arguments; a whole travels as one object

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `named-arguments-past-the-first` becomes `parameters-at-most-three-wholes-as-one-object`: a function takes at most three positional parameters, and values that make one whole travel as one named object, whatever their number. `useMaxParams` at three holds the count; whether values make one whole is reviewed. The typescript block's `options-object-for-named-arguments` becomes `options-object-has-a-named-type`, reviewed. The constitution's `named-arguments.grit`, which refused any second parameter, goes.
- **Rejected.** One positional parameter everywhere, which turns `(subject, options)` and a comparator's two sides into objects or suppressions; the first argument positional and every other named, which the plugin contradicted and a tool cannot tell from a whole.
- **Why.** Clean Code counts two arguments as natural, a third as needing a reason, and a group of values as an object of its own; a position is an order to remember, and a whole is one concept.

## ADR-0084 — Mutation testing keeps no earlier results

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `mutants-all-killed` runs over the lines a change touches and every new file, and no longer reuses earlier results.
- **Rejected.** Stryker's incremental report: with no test reported per mutant Stryker cannot tell which tests meet it, so a cached result hid a survivor in one run and kept a killed mutant as surviving in another.
- **Why.** A result is trusted only when it was run; mutating the changed lines keeps the run short without a cache.

## ADR-0086 — zod is kept out of the domain by the domain law alone

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `zod-only-at-the-edge` and its dependency-cruiser part are deleted. A schema is written wherever input crosses a boundary — an adapter's models, a route's search parameters, a form — and `domain-imports-only-itself-kernel-and-contracts` keeps zod, like every vendor, out of `domain/`. Under the table of packages by folder role (ADR-0158), the edge takes zod with any package, the screens included, and zod's home reaches past it to a UI's forms and the document of `composition/` (`zod-imported-by-forms` and `zod-imported-by-the-document`).
- **Rejected.** Widening the rule's list of edges to routes and forms, which names the router's and the form library's folders in zod's block.
- **Why.** The rule forbade the schemas `search-params-validated-by-schema` and the form rules require, while what it protected — a domain free of the schema library — the law already holds. Router and form libraries take any Standard Schema validator, so a schema at the delivery layer is the boundary, not a leak.

## ADR-0088 — Every block lays its rules out on three axes

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** A block lays its rules out on three axes: its base, what any team wants, and two optional axes, `architecture/` and `workflow/`, a folder each with its chapters and its `with/` seams; since ADR-0211 every axis, `foundation/` the base's, is a folder of one form. Two questions place a rule, each apart from the other: its layer by what must disappear for it to lose its meaning, and its axis by whether a team with another architecture, or another workflow, would still want it. Architecture is the structure of a system in the sense of Clean Architecture, DDD and hexagonal architecture — layers and their duties, the direction of dependencies, boundaries with ports and adapters, the homes of input, output and state, the composition root, the isolation of parts, read and write apart, and the tree that spells them; workflow is how a change travels from the idea to the release. The layout of tests is the base's. Across blocks, an `architecture/` or `workflow/` rule may tighten a base rule, a base rule only a base rule, and the two never each other. A project lists the optional axes it follows in `constitution.yaml`. Every rule moved to its axis by a census of all 614; a rule that bundles two axes is split.
- **Rejected.** Two parallel trees `foundation/` and `architecture/` above the layers, which give a block two homes; a suffix `.architecture.md` beside a default axis; a mark on each rule, which a hook cannot drop as a whole and which drifts, as the `architecture` tag did; one architecture block that places every other block's rules, which would name every library from above; folder names as the test of architecture, which misses the dependency rule itself.
- **Why.** A team adopts the foundation the way it adopts a tool's recommended preset, whatever its own architecture and workflow, and the axes make that choice one line. The literature separates the three the same way: style guides and Clean Code for the craft, Clean Architecture, hexagonal architecture and DDD for the structure, and engineering practices — Clean Coder, Accelerate, the code-review guides — for the process.

## ADR-0089 — A rule sits on one axis and names the rule it carries out

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** Every rule that bundled two axes is split into one rule per axis, and where one half repeated another rule it was dropped instead. A rule that carries out another names it in its heading beside its own level, `### <slug> → <rule> · <level>` since ADR-0164: it takes that rule's tags, never states a looser level, and carries out one rule at most. A rule of the base carries out only a rule of the base, and `architecture/` and `workflow/` never each other; `blocks:check` reports any other reference, a looser stated level, a cycle and a missing rule. A rule's Why and Tags are one table under its statement, the same columns in every rule, and a list written as in the front matter, `[]` when empty. The tags are the lenses that cross every axis — `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux` — optional, since a full review reads every rule. Twelve duplicates are merged into the rule that keeps their meaning, `fast-source-updates-once-per-frame` moves to ui, `pipeline-stages-under-steps` and `dependencies-imported-from-their-entries` to core, and an abstraction waits for its third occurrence in the principles as in ADR-0058.
- **Rejected.** The Implements label beside the heading; labels on consecutive lines, which render as one run-on paragraph; lenses that name a chapter's topic — design, naming, types, process — or an axis.
- **Why.** A block below is checked never to loosen the rule it names, and a lens is worth filtering by only when it crosses the axes.
- **Superseded in part.** The tags and the lenses, by ADR-0226.

## ADR-0090 — Each axis keeps its words, and process choices sit on workflow

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0093

- **Decision.** `vocabulary.yaml` lists the words the `architecture` and `workflow` axes own; `blocks:check` reports an architecture word outside `architecture/`, a workflow word outside `workflow/`, and either in a card. The check catches the plain leak; placing a rule stays with the two axis questions. A review by meaning then moved what plain words had hidden. To `workflow/`: `changes-reach-main-line-through-review`, `required-check-blocks-integration`, `one-integration-strategy-no-work-in-progress`, `small-reviewable-change-requests`, `merged-branch-deleted`, `hook-rewrites-only-staged-files`, `bug-fix-starts-with-failing-test`, `sub-agent-never-touches-live-systems` and `ci-runs-the-pinned-toolchain`; split, with the choice as a child of the outcome: `main-line-protected` (`main-line-takes-no-direct-push`), `every-commit-passes-the-check` (`check-run-by-hooks-and-ci`, which takes over from `one-check-command` that CI runs the check), `no-secret-in-repository` (`secrets-scanned-before-each-commit`) and `consent-before-irreversible-actions` (`consent-given-in-the-chat-per-action`). To `architecture/`: `adapter-built-by-factory-or-module-object`; split: `spec-per-boundary` (`spec-per-boundary-of-the-tree`) and `query-for-reads-mutation-for-writes` (`query-hooks-only-in-binding-units`); the suffix clause of `test-files-named-by-role` joins `file-carries-its-role-suffix`. Foundation slugs that named the architecture are renamed to their statements: `invariant-checked-at-construction`, `one-contract-suite-per-contract`, `one-fake-per-contract`, `absence-has-one-value`, `integration-tested-against-the-real-engine`, `query-for-reads-mutation-for-writes`, `keys-only-from-the-key-factory`, `query-signal-reaches-the-request` and `data-result-is-union-by-status`. Each sense keeps one word: what a fake or a contract suite stands in for is a contract, a module's API is its public entry, and a user interface is never a bare "interface"; the slugs follow.
- **Rejected.** Picking the words out of a markdown glossary by its file name; the words alone as the judge of an axis.
- **Why.** A team with another architecture or workflow takes foundation as it is, so foundation must neither speak our words nor state our choices in plain ones.

## ADR-0091 — The constitution's archive carries every tool configuration, laid out by axis

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** devkit's presets, starter files and `mutation-check` move into the constitution, and its release archive `constitution.tar.gz` is the one way a project takes them, in any language: `presets/`, `templates/project/<block>/`, and `tools/mutation-check/dist/main.js`, built at release. A preset is split into parts, `presets/<scope>/<tool>/<axis>/<block>.*`, the axis `foundation` for the base since ADR-0211: the tool folder is the tool's block, the axis folder the optional axis of the rules the part holds, and the part is named after the block its settings need — the one without which they mean nothing, an abstract block's underscore included: `noTailwindArbitraryValue` sits in `tailwind` though it holds a rule of `ui`. Settings that need no block beyond the tool sit in `core` when they hold a rule of core, and in `self` when they are the tool's own. A GritQL rule is `plugins/<rule-slug>.grit` in the folder of its axis, and an architecture part narrows a foundation part's GritQL rule by listing the same path. mise's `tool-configuration-from-the-kit-archive` becomes `tool-configuration-from-the-constitution-archive`, and osv-scanner's `licences-checked-against-devkit-allowlist` becomes `licences-checked-against-the-shared-allowlist`. The node environment's parts are dropped; Python's configurations stay in devkit until a project needs them.
- **Rejected.** npm packages for the TypeScript tools beside an archive for the rest, which released the same rule twice — most of devkit's changes came paired with one of the constitution's; naming the tool's own part after the tool, which reads `biome/biome.jsonc`; dropping an abstract block's underscore in its parts, which gives one block two names.
- **Why.** A rule and the setting that holds it change in one pull request and ship in one version; a project that leaves an axis out leaves out its parts; and every part names the block that owns it, which a check can hold.
- **Superseded in part.** The parts and the starter files, by ADR-0234: the archive carries the presets the program writes from; `tools/` and the layout by axis stay.

## ADR-0092 — docker, its two linters, and nestjs get blocks

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** The `docker` implementation describes both files a project writes for containers. A Dockerfile pins its base image, copies rather than adds, runs its command in exec form, fails a piped step, pins and trims its system packages, runs as a numeric unprivileged user and takes a secret only through a secret mount. A Compose file keeps devkit's order of keys, has no `version`, quotes every published address and binds it to an interface, and its shared settings, variants, health waits and test services follow devkit's conventions. The check lints both, and any finding fails it: `hadolint` holds a Dockerfile with `failure-threshold: style`, `dclint` a Compose file with every rule an error, each from its preset in the release archive. `nestjs` keeps the decorator metadata its injector reads; a provider takes its dependencies through its constructor, a rule on the architecture axis. Its Biome part no longer turns `noEmptyBlockStatements` off, which Biome never raised on an empty module or constructor.
- **Rejected.** One block per file, which splits the images a Compose file runs from the Dockerfiles that build them; the linters' defaults, which leave half their findings as warnings the check passes; turning a rule of core off for NestJS in its Biome part, which a block may not do.
- **Why.** A container is built and run by the two files together, and each has a linter that holds most of its rules; what a linter cannot see is reviewed.

## ADR-0093 — An agent judges the placement

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** The meaning of a rule is judged by the `rule-placement` agent of this repository, which answers the layer and axis questions for every rule a change adds or rewrites and reports each rule that sits elsewhere; its answers go into the pull request.
- **Rejected.** The agent inside `bun run check`, which must give the same answer on the same code.
- **Why.** A check of words catches a plain leak cheaply, and the placement itself needs the reading of meaning the two questions ask for.

## ADR-0094 — Each preset binds its settings to the rules they hold

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0234

- **Decision.** A preset holds, beside the parts of each axis, a `bindings.yaml` in that axis's folder — `presets/<scope>/<tool>/bindings.yaml` for the base, `…/architecture/bindings.yaml` for architecture: by part and rule, the settings that hold the rule, wholly or in part, each as the part's file spells it. It is the one record of what a tool holds; a rule names no tool and no check (ADR-0160). A binding must be real: its rule exists and sits on the part's axis or on the base, which any axis may carry out; its rule belongs to the part's block, a block above it or a seam with it, never a block below; its part exists; its file spells the setting. Whether a part is the block its settings need is judged by the `rule-placement` agent. A setting that holds no rule is never reported. A preset file is a part named after a block or `self`, a plugin named after a rule of its axis, or `bindings.yaml`. The configuration carries no comment per setting.
- **Rejected.** A Bindings table in the tool block's chapters, which filled a tool's chapter with other blocks' rules and made a language name the frameworks below it; a check that every setting holds a rule, since a tool's own opinions need none; a comment per setting in the configuration, which nothing checks; dependency-cruiser rules renamed to their slugs, since several of its rules hold one slug and it drops a repeated name across `extends`.
- **Why.** A block keeps its own rules and nothing else, the presets keep the tools' side, and the check reads the one place they meet: a renamed setting, a moved part or a rule a tool only claims to hold fails the check instead of drifting.

## ADR-0095 — CSS is a language block, and the stylesheet's rules move into it

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `css` is a language context, beside `typescript`, for a program's stylesheets whatever writes the classes. Its rules: every style rule in a named cascade layer, the order of layers declared once, no `!important`, selectors of at most three classes that never descend in specificity, no id selector, custom properties declared before they are read and registered with `@property` where they are animated or typed, Baseline features only, classes declared and used and named for what an element is, container queries for components, global styles only in the entry stylesheet. A rule that carries out a rule of `ui`, `a11y` or `i18n` sits in css's seam with it: values from the theme's custom properties named after their tokens and, on the architecture axis, a component's own stylesheet in its folder with `ui`; logical properties with `i18n`. The rules that were written in CSS but kept in the browser's seams move into the css seams: `focus-ring-from-design-system`, `text-scales-and-content-reflows` and `hover-styles-behind-hover-media` to `css/with/a11y`, `cascading-variant-by-data-attribute` to `css/with/ui`. HTML stays with `browser`: its elements, ARIA and focus mean something only in a browser's document. `tailwind` requires `css`. Biome's CSS rules move from the `browser` part to a `css` part, with a GritQL rule against id selectors; the `tailwind` part parses Tailwind's directives and turns `noUndeclaredClasses` off, since its utilities are declared by the library.
- **Rejected.** The CSS rules in the `ui` or `browser` part, which gave a domain or a platform a language it may not have: a browser program need not write a stylesheet, and React Native has none; an `html` language block, which would repeat the browser platform.
- **Why.** A rule sits where it loses its meaning: without CSS these rules mean nothing, and without a browser neither does HTML.

## ADR-0096 — A tool names the languages it covers

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A block's card declares `languages`: the language blocks whose files a tool's presets cover, which decides the scopes of its parts. `biome` covers `typescript` and `css`; `dependency-cruiser`, `knip`, `stryker`, `syncpack` and `bun-test` cover `typescript`. A tool that lists none — `betterleaks`, `osv-scanner`, `lefthook`, `hadolint`, `dclint` — reads any language's files. Only an implementation lists languages; `blocks:check` reports an entry that is no language block, and the field on any other layer.
- **Rejected.** Coverage through `requires`, which took every language for a programming language: Biome, which lints CSS, would count only for TypeScript, and `biome` requiring `css` would bring CSS into every Biome project.
- **Why.** What a tool reads is a fact of the tool, not of what it depends on.

## ADR-0097 — A tool-checked rule claims only what its tool holds

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0101

- **Decision.** A rule that a tool holds only in part is split into the part a tool holds and the part that is reviewed: `files-copied-never-added` keeps local files in `COPY` and `downloads-verified-archives-unpacked` reviews downloads and archives; the Biome suppression rule becomes `biome-suppression-states-its-reason`, held, and `biome-suppression-names-one-rule`, reviewed; `dependencies-imported-from-their-entries` is reviewed, and `react-native-imported-from-its-entry` holds it for React Native; `typescript-file-forms` holds the forms, and `tsx-only-where-markup-is-written` is reviewed. Where a setting holds a rule or its half, that half says so: `error-cause-preserved` (a MUST now that `useErrorCause` holds it) and `error-logged-once`; `consumers-import-package-entries` under `package-entries-curated`; `bundle-reads-no-build-environment` under `runtime-configuration-served-beside-bundle`. A rule that bundled two axes is split: `no-import-cycles` on core's foundation and `dependencies-point-inward` on its architecture; `test-code-unreachable-from-production` and `stories-unreachable-from-production` move to foundation, with their dependency-cruiser rules. `tanstack-router-file-names-kept` joins `expo-router-file-names-kept`. A branch's name holds no digit but its issue's number.
- **Rejected.** A Check that names a tool for a whole rule the tool holds in part, which hides the part nobody checks; a rule kept whole on its stricter axis, which denies a team the half it would take.
- **Why.** A Check says who holds the rule; when it says a tool, the tool must hold all of it.

## ADR-0098 — Presets are laid out by scope first, and the compiler gets its block

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A preset's part is `presets/<scope>/<tool>/<axis>/<block>.*`, `foundation` the base's axis (ADR-0211), with the bindings and the GritQL rules `plugins/<rule-slug>.grit` of each axis in its folder. The scope is the files the part reads: `common` for any language, or a language block its tool lists in `languages`. Every tool has a scope, even one that reads one language, so no tool is laid out apart. The compiler becomes the implementation block `tsc`, which checks `types` and governs `tsconfig.json`, and `compiler-is-the-type-gate` moves to it from `typescript`; its strict options sit in its `self` part again. Vite's `build-is-not-the-type-gate` moves to its seam with `tsc`, and `nestjs` requires `tsc`, whose options it relaxes.
- **Rejected.** A language folder inside a tool's axis folder, which appears in some tools and not in others and names the axis before what the part reads; the language block `typescript` doubling as the compiler's tool, which gives one block two roles; a separate scope for the parts of one block, which a part's name already carries.
- **Why.** A project takes a scope whole — `common` and the scope of each active language — and a language added later brings its own folder beside the others, with the same tools inside.

## ADR-0099 — A cast is refused, and a value from outside is parsed or narrowed

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** Biome's `noUnsafeTypeAssertion` holds the `as` cast of `no-unchecked-escape-hatches`, in specs as in production; only `as const` passes. `boundary-values-unknown-until-parsed` makes a value from beyond the boundary known by the project's schema or by plain checks — `typeof`, `in`, `Array.isArray` — the same way in specs and in production.
- **Rejected.** A schema for every value from outside, which brings a dependency into a small tool that reads one field; casts left in specs, which let a spec pass on data in a shape the tool never gave.
- **Why.** A cast over data nobody read promises a shape nobody checked; a schema or a narrowing check reads it, and the first unexpected field fails where it enters.

## ADR-0101 — A rule a tool holds in part is reviewed, and a child says what the tool holds

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0160

- **Decision.** Where a tool holds only part of a rule, the rule keeps its slug and its statement and becomes `review`, and a child `→` it states exactly what the tool holds, with the tool's Check and its bindings. So it is for 39 rules: among them `access-only-through-curated-surface` (`surface-is-the-only-way-in`), `commit-header-type-and-subject` (`commit-header-format`), `coverage-holds-all-logic` (`coverage-gate-on-loaded-files` in `bun-test`), `every-control-has-an-accessible-name` and `native-semantics-first` (`jsx-controls-named`, `jsx-roles-and-aria-valid` in `react-dom`'s seam with `a11y`, which `labels-bound-with-use-id` joins, so a React Native project claims no setting it lacks), `tokens-single-source-of-appearance` (one child each in `react-dom`, `react-native` and, under `utilities-only-from-tokens`, `tailwind`), `components-dumb-widgets-smart` (a child in `ui`, and one in each of `ky` and `tanstack-query` for the library it keeps out), and `primitives-take-text-by-props` (`primitives-import-no-message-catalog` in `lingui`'s seam with `ui`). `side-effects-at-the-edges`, `suppression-states-its-reason` and `folder-named-for-purpose-or-role` become `review`, their held parts already held by children. The same holds where a binding sat on a reviewed rule: `commit-scan-redacted` (`lefthook` with `betterleaks`) and `stryker-runs-the-archive-runner` take theirs, and a setting that wires a hook, which no role checks, holds no rule. Three statements lose a clause another rule holds: `yaml-only-at-the-edge` the `unknown` result (`boundary-values-unknown-until-parsed`), `known-vulnerabilities-fail-the-check` the accepted vulnerability (`accepted-vulnerability-states-reason-and-expiry`), and `no-dead-code` the unreached branch (`coverage-holds-all-logic`) for the unreachable statement the compiler refuses.
- **Rejected.** Narrowing each rule to what its tool holds, which would drop the judgement half a reviewer still needs; a sibling rule beside each rule for what the tool holds, which name two rules where one carries out the other.
- **Why.** A Check says who holds a rule. A child that states only what its setting refuses keeps that true, and the rule above it stays whole for the review.

## ADR-0102 — A project without a check command writes check: null

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** Every schema is complete: a block's front matter declares every field in the schema's order, and `constitution.yaml` every key, with `[]`, `{}`, `null` or `false` where there is nothing to say. `check` stays a required key of `constitution.yaml`; a project with no command that runs its checks writes `check: null`, and the hook asks for nothing more. The hand-back gate of step 5 then has no command to require and only reminds of the review.
- **Rejected.** Dropping the key when there is no command, which a missing key cannot tell apart from one forgotten; an empty value, which the hook already reads as unfinished.
- **Why.** A project the constitution governs may have no checks yet, and saying so is different from not having answered.

## ADR-0103 — The role that checks imports is named imports

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0160

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

- **Decision.** Four rules change so that a tool holds what each says.
  - `stryker-runs-on-node` is removed: Stryker 10 runs under Bun 1.4, JSX included, and `[run] bun = true` already ran it there.
  - `trusted-dependencies-listed-by-name` requires `trustedDependencies` always declared, `[]` when no dependency may run a script, since without the field Bun runs the scripts of its own list of popular packages.
  - `no-skipped-or-empty-tests` also refuses a case run only under a condition or expected to fail — Bun's `if`, `skipIf`, `todoIf` and `failing` — and Biome's test domain is turned on for `bun:test` specs, which it never detects by itself.
  - `integration-specs-ignored-by-bunfig` leaves out `tests/` as well, by `pathIgnorePatterns`.
- **Rejected.** The TypeScript checker: TypeScript 7.0 ships no compiler API until 7.1.
- **Why.** A rule a tool claims to hold and does not is worse than a reviewed one: everyone trusts the check.

## ADR-0106 — Value objects, thrown failures and the TypeScript rules of the 2026 audits

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - A business value with an invariant is a value object of the domain (`value-object-built-only-by-its-check`, MUST, on the architecture axis): built only by the domain's function that checks it, immutable, compared by value, never a class. A boundary gets one only through that function, and a zod schema never brands one itself. In TypeScript it is a branded type with `create<Name>` and `is<Name>`. A meaning without an invariant stays a vocabulary alias, and an existing alias is used instead of the bare type.
  - Expected failures are thrown as errors of the kit, not returned: a contract lists them as one type beside it, a `catch` narrows by code and rethrows the rest, and only errors are thrown.
  - A boolean is never positional; parameters of one type travel as one object or are told apart by their types.
  - Shared shapes are composed of small ones; domain types are `readonly`; a type parameter appears twice; cancellation travels as an `AbortSignal`; resources are held by `using`; a module exports by name; text is made deliberately; a return type is no wider than what is returned; `process.env` is read only in the root and the entry files.
- **Rejected.** A `Result` type for expected failures: the owner keeps the language's own `throw` and `catch`. A value object as a class: its instance loses its methods in a cache, a URL and storage.
- **Why.** The rozumchik-web audit found value objects unstated and rules about failure, arguments and types missing; the best-practices audit of 2026 found the rest.

## ADR-0107 — Ownership, one writer per resource, and the data and import rules of the 2026 audits

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Whoever decides whether a change is valid owns the data: what the server decides stays plain; what the program decides itself — a draft, an optimistic item, a stream's folding, a grouping by period — is modelled in its domain. What concerns one entity alone is a pure function beside it, never a method. A query port or use-case has no side effect, and a command never calls a query (MUST). Ports are named `<Aggregate>QueryRepository` and `<Aggregate>CommandRepository`. A stateful client is built by the root.
  - `one-writer-per-shared-resource` (MUST): every resource the program shares with its host has one writer; a block that brings its own claims it, and the default writer yields. `react-dom` yields the head when another block claims it, and `tanstack-router` claims it.
  - The web tier may hold one session proxy that keeps the user's tokens on the server behind an `HttpOnly` cookie and forwards calls, with no business rule (the OAuth best current practice for browser applications).
  - TanStack Query's own status union replaces our flags, the data already shown stays beside a failed refetch, and a screen's read may suspend into its route's pending and error components. A read is declared once as `queryOptions`; the router's context carries the adapters; a screen's reads start in its loader; a write stays pending until its refresh lands; an error component's retry resets the failed read; links are typed; search falls back to defaults; a loader declares its search; routes split automatically; `routeTree.gen.ts` is committed.
  - Imports held by dependency-cruiser: the query library and the router each kept to its home (ADR-0158), binding units neither an adapter nor UI, components no widget, nothing inside the screens' folder, and a route's pieces never its route file. A feature's UI imports its entities — their types, enums and the functions `entity-behaviour-beside-entity` asks it to call — so the setting `ui-takes-entities-as-types` is removed, and `ui-layer-imports` is reviewed, with a child for what the tool still refuses.
- **Rejected.** A wider BFF that shapes data for screens: the rules belong to the API that owns the data. HTTP libraries out of `libs/`: a vendor client there may be one.
- **Why.** The rozumchik-web audit and the best-practices audit of 2026 found these unstated or contradicting current TanStack, OAuth and modelling practice.

## ADR-0108 — Base UI, the component rules and the CSS of the 2026 audits

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Every project builds its primitives on Base UI through shadcn source: `complex-widgets-on-radix` and `slot-behind-as-child` give way to `complex-widgets-on-base-ui` and `polymorphism-through-render`, Base UI's `render` prop being the kit's only polymorphism. A pattern the platform's own element carries whole — `<dialog>`, `popover`, `<details>` — uses that element, and the top layer replaces a portal there.
  - A primitive's markup is never re-created (MUST, split from `compose-before-authoring`); `compound-over-prop-regions` names its signs, and a compound's surface exports only its root. A component is controllable or not through one interface, a primitive passes its element through, a refresh never replaces content already shown, and a hidden part that keeps its state uses `<Activity>`.
  - React: rendering is pure inside `StrictMode` (MUST), props are never assigned, components are named in PascalCase, a component that renders nothing returns `null` — a React variant of the GritQL rule on absence, over `.tsx` files only, allows `return null` — render errors are reported at the root, and memoisation's exception is a value an effect or a library the Compiler skips depends on.
  - An inline `style` is an object literal of custom properties only, held by GritQL instead of `noInlineStyles`; images declare their size, held in JSX by `useImageSize`; the Core Web Vitals are kept within budget. In the browser, a primitive passes its class and attributes through; `tailwind` merges the class by `cn()`, and `shadcn` marks the parts with `data-slot`.
  - CSS and Tailwind: `svh` by default, `w-screen` refused, a `max-*` breakpoint only after a minimum, cascading variants by `@custom-variant`, Tailwind's own layer order imported layer by layer, `!important` only in the reset layer, newly available features behind a feature query, `color-scheme` on the root, no hexadecimal colour outside the theme, the class merger configured with the theme's scales. The theme follows the system until the user chooses, lives in `libs/ui/theme/`, and its tokens are kept in the interchange format where a design tool or a second platform reads them. `data-states-shown` names only the states a view's data can have.
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
  - Core: a flaky test is fixed or deleted, never retried; a case passes alone and in any order; a test never waits a fixed delay; a case holds no logic; a fixture builds a valid value and takes overrides; a property test's counterexample is kept as a fixed case; a unit case runs in milliseconds; captured responses of a vendor are verified against it, which `tests-run-in-a-sandbox` now allows next to a person.
  - A case holds no branch or loop, whatever the runner. With `bun:test`, no case retries or sleeps, the order is random, and a preload refuses the network. `async-ui-awaited-with-find` becomes a child of the rule against fixed sleeps.
  - `ui`: behaviour that depends on layout, visibility or real focus is proven on the platform, never only in a simulation. A TypeScript package's exported generic and conditional types get type cases.
  - A `playwright` block for end-to-end specs, on TypeScript: locators by role, label and text; waits only through locators and web-first assertions, held by Biome; web-first assertions awaited; no forced actions; retries off; a trace kept for each failure.
- **Rejected.** A unit timeout in `bunfig.toml`: Bun ignores the key, so the speed of a unit case stays with review. Biome's `playwright` domain: it enables none of the nursery rules, so the part lists them.
- **Why.** The best-practices audit of 2026 found flaky, order-dependent and sleeping tests unruled, the sandbox held only by review, captured responses never re-checked, and no tool behind `end-to-end-per-critical-scenario`.

## ADR-0113 — Redundancy removed from the 2026 audit changes

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Rules that repeated a neighbour or a parent are removed or merged: `browser-checklist-before-shipping` into `interactive-checked-by-hand`; `boundary-builds-value-objects-through-the-domain` into `value-object-built-only-by-its-check`; `view-transitions-honour-reduced-motion` into `reduced-motion-honoured`; `screens-imported-by-nothing-inside` into `dependencies-point-inward`, which `routes-imported-by-no-inner-layer` now carries out, and so becomes a MUST. The line between a brand and an alias is drawn once, in `semantic-alias-names-a-shared-meaning`.
  - `catch-narrows-and-rethrows` carries out `errors-surfaced-never-swallowed`, and lets a catch around a library's call map its exceptions to coded errors.
  - `nothing-rendered-as-null` is reviewed: its plugin only allows `null`, and never refuses `undefined`. `query-client-through-router-context` is reviewed too: its import rule exempts the root route, which is where the client is mounted.
  - `toolchain-downloads-verified-by-the-lock` drops the `MISE_LOCKED=0` workaround, which loosened the lockfile rule for one machine.
  - Biome's nursery rules change only through a reviewed update.
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
  - The distribution domain's `deprecation-names-replacement-and-removal` now carries out `retired-code-marked-deprecated`, and adds the removing version.
  - The theme writes no hexadecimal colour: the exemption that let it is dropped, and `noHexColors` holds `no-hexadecimal-colour` there as well (owner).
  - A value object lives in `domain/value-objects/<name>.value-object`.
- **Rejected.** A wire type inferred from its schema: the model is declared without the schema library, and `schema-held-exactly-to-its-model` holds the schema to it, as nydra does.
- **Why.** The review of the 2026 audits against the constitution found these accepted gaps unwritten.

## ADR-0116 — What adopting the constitution in a real application ran into

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - A file an author's step generates and the program's code imports — not a build output — is committed; `route-tree-committed` carries that out for TanStack Router, whose guidance counts the route tree as part of the runtime.
  - TanStack Start names its entry files (`src/router.tsx`, `src/client.tsx`) and its wiring (`__root.tsx`); its Stryker and knip parts leave them out of mutation and enter them for knip.
  - Under `bun test`, React DOM specs get a DOM from a preload registered before the sandbox. A browser program's specs are type-checked by a config of their own that adds Bun's types.
  - `bun build` is required only where no other active block owns the program's build.
  - Compose's top-level `include` takes its place after `name`.
  - OFL-1.1 joins the licence allowlist: self-hosted fonts carry it, and it binds only redistribution of the fonts themselves.
- **Rejected.** Making the check pass with no specs, a mutation mode for untested files, and a fixture that loads every file for coverage: a project without tests leaves `test:unit` and `mutation:check` out of its check until the first specs land, and changed lines are held by mutation.
- **Why.** The audit of rozumchik-web against constitution 0.62 found these gaps where a real application meets the rules.

## ADR-0118 — The architecture gaps a real application found

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - `file-carries-its-role-suffix` names a binding unit's plain form, named after its operation in its own folder, among its exceptions; a domain use-case keeps its `.use-case` suffix.
  - `repositories/` has no surface joining its two sides, and a shape both sides use — the page a read returns and a write updates in the cache — is an entity, so an optimistic command imports the entity, never the read port.
  - The kernel holds structural types, not contracts, which are the ports of `contracts/`.
  - The shared mapper of transport failures lives in `shared/<transport>/`, and adapters may import `shared/` for what knows the program.
  - A module that ships styles offers them through a stylesheet surface, `index.css`, beside its script surface, which the program's root imports by path (`module-stylesheet-surface`, CSS); the import rules already let any `index.*` through, so a path past it stays refused.
  - `services-reach-loaders-through-router-context` replaces `adapters-reach-loaders-through-router-context` and carries out `one-explicit-composition-root`: every service the providers build reaches loaders and guards through the router's context. The query client's own rule in the seam with TanStack Query goes, since this one holds it, and `root-imported-only-by-entry-and-delivery-wiring` still keeps routes off `root/`.
- **Rejected.**
  - Letting a command import a read port's types: the shared shape belongs to the entities.
  - Opening `root/ui` to route files: an application shell that knows no feature belongs in `shared/ui`.
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
  - Loaders read a `queryOptions` through the query client; the rule no longer names `ensureQueryData`, which TanStack Query 5.104 deprecates.
- **Rejected.**
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

**Date:** 2026-10-04 · **Status:** Superseded by ADR-0150

- **Decision.** A repository of packages keeps each product in `packages/<product>/`: its language-free files — specification, fixtures, hooks — in `packages/<product>/common/`, and each package at `packages/<product>/<language>/<name>/`. A package reaches its own product's `common` and nothing of another package or product; the bun workspaces are `["packages/*/<language>/*"]`.
- **Rejected.** `packages/<language>/libs/<name>/` with one `packages/common/`, which scatters one product — its contract, its fixtures and its packages in each language — over several trees.
- **Why.** The kit's products ship one contract in TypeScript and Python, proven by shared fixtures; one folder per product keeps them together, changed in one pull request (owner).

## ADR-0126 — Lines of 100 characters, and PSF-2.0 and MIT-0 on the licence allowlist

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - Biome formats at a line width of 100, not 80, in the common part every project extends.
  - The licence allowlist gains `PSF-2.0` and `MIT-0`, as it gained MPL-2.0 before: its copyleft is per file and binds only changes to those files, and its packages here are build and test tools.
- **Rejected.** A line width of 80, Biome's default.
- **Why.** At 80 a typed signature or a call of a few arguments breaks over lines that each say little; at 100 this repository's code is about a thousand lines shorter (owner). Both licences are permissive and ask no more than `MIT` or `Python-2.0`, already on the list; `typing-extensions` is `PSF-2.0` and `cffi` is `MIT-0`, and FastAPI and MCP applications load both at runtime (owner).

## ADR-0127 — Python is a language, with uv, Ruff and ty

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** `python` is a language context held to every role, its source root `src/<import name>/` of each package, its specs in `tests/` beside `src/`, its entry `main.py`. On foundation it fixes the forms of core's rules: snake_case modules and packages; `test_<name>.py`, `<contract>_fake.py`, `<name>_fixtures.py` and the runner's file of shared fixtures — pytest's `conftest.py` — in `tests/`, the kind of a spec told by its folder; `None` as the only absence; no `Any`, held in signatures and generics; PEP 695 generics; aware datetimes; `@override` on every override; frozen, slotted, keyword-only dataclasses for business data; keyword-only parameters past the third; task groups; no `except` that only passes; Google docstrings only where core allows one; suppressions with their code and a reason after ` -- `; `sys.path` never touched; tools pinned with `==` in the `dev` group, floors for the program's dependencies, `requires-python` at the pinned minor — Python 3.14.8 until 3.15 is out and past the cooldown; with `package`, `py.typed` in every published package. On architecture: role files `<name>_<role>.py` in role folders spelled in snake_case, `__init__.py` as the surface — only re-exports and a sorted `__all__` — and empty in a layer folder; relative imports inside one feature at any depth, never out of it, absolute imports across features; a value from outside `object` until parsed; the environment read only under `root/`. Three implementations: `uv` — the only package manager, `no-build`, no Python of its own, a workspace and a capped `uv_build` with `package`, `uv version` writing every member; `ruff` — two spaces, single quotes with docstrings in double, lines of 100, families chosen by name, a chain of parts `self.toml` ← `core.toml` ← `python.toml` since `extend` takes one file; `ty` — every rule an error, warnings failing, `# type: ignore` unread, passed as `--config-file`, under which ty reads no `[tool.ty]`. lefthook's `ruff` part fixes and formats staged files; `templates/project/python/` carries the `pyproject.toml` of the settings with no preset and the `.gitignore` of the bytecode. This repository pins Python and uv in mise and the Python tools in its own `dev` group, which the e2e specs run; OSV-Scanner reads `uv.lock` as it is.
- **Rejected.** Pyrefly, the reviews' choice, for ty, from the makers of uv and Ruff, though it is in beta (owner); double quotes and four spaces, the experts' choice, for single quotes and two, as in TypeScript (owner); `ban-relative-imports = "all"` (`TID252`), which forbids the relative imports a feature keeps inside itself (owner) — a small AST check will hold them, and the 100 and 500 line limits, from the archive's `tools/`; an architecture part for Ruff, whose only candidate — `os.environ` banned outside `root/` — needs per-file ignores that resolve against the part's own folder, or match any path with a `root` in it.
- **Why.** A second language takes the same rules as the first in its own forms, held by the tools its practice has settled on, so a product written in TypeScript and Python is reviewed and checked the same way in both.

## ADR-0128 — Python is tested by pytest, Hypothesis and mutmut, and checked by import-linter, deptry, vulture, complexipy and python-check

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Seven implementations, each held to core's testing and code rules in Python. `pytest` — strict, `importlib`, warnings as errors, a coverage gate of 100 percent of lines and branches through pytest-cov with `--cov` never in `addopts`, pytest-randomly's order, no rerun plugin, `tests/integration/` and `tests/e2e/` left out of the unit specs by `norecursedirs`, the network refused by an autouse fixture of `tests/conftest.py` that the integration folder overrides, no `unittest.mock` and no patched module, async specs on anyio's plugin; run in each package with `pythonpath = ["tests"]`. Ruff's part `pytest.toml` extends `python.toml` as the last link of the chain, with `PT` and the bans of skips, expected failures, the `flaky` mark, `unittest.mock` and `pytest_asyncio`, and a project lifts only `S101` and `INP001` in `tests/`. `hypothesis` — properties written with `@given`, counterexamples kept by `@example`, and under `CI` its own `ci` profile, which already derandomizes and keeps no database. `mutmut` — every mutant killed, an equivalent one marked on its line by `# pragma: no mutate -- <reason>`, each mutant run without randomness or coverage; its gate is the archive's `tools/mutmut-check`, which clears `mutants/`, mutates the functions a change touches and a new module whole, and fails on every mutant not killed — survivor, untested or timed out. `import-linter` — core's import rules as contracts named after them, written over wildcards (`*.kernel`, `*.features.*`) so one template fits any package. `deptry` — unused dependencies and dev tools imported by the program. `vulture` — unused code from a confidence of 60, over `src` alone so code only the specs reach is dead, names a framework reaches in `ignore_names` with a reason. `complexipy` — cognitive complexity within core's limit. `python-check`, the constitution's own Python tool in the archive's `tools/`, holds a function of at most 100 lines and a file of at most 500 outside `tests/`, and a relative import kept inside its module — a feature, a top-level folder, or the package root — with a feature never importing its own absolute path. The settings of the tools without `extends` start from `templates/project/python/pyproject.toml`, and `tests/conftest.py` beside it; Both Python tools are members of this repository's uv workspace and are held by its check — format, lint, types, their own limits, coverage, mutation and unused code — and the release builds them as `.pyz` archives the project's interpreter runs.
- **Rejected.** Extending `tools/mutation-check` to drive mutmut, which would make a repository without JavaScript install Bun to run one gate; a threshold below every mutant, which core forbids; `mutate_only_covered_lines`, which hides the mutants no spec reaches; a profile of the project's own for CI, which Hypothesis already ships; a whitelist module for vulture, which Ruff then flags as a module of useless expressions outside a package; vulture at 80, which reports no unused function or class; per-file ignores in a Ruff part, which resolve against the part's own folder; a Python tool installed from the archive as a package, which a project would have to build, for a zip archive the interpreter runs as it is.
- **Why.** Python's specs are measured as TypeScript's are — by coverage of every branch and by every mutant killed — and its imports and sizes are held by tools, not by review, so a package written in both languages meets the same bar in each.

## ADR-0129 — Python's libraries: pydantic at the edge, FastAPI, FastMCP, structlog and httpx2

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Five library blocks, each held to core's rules in its own forms, the tool-held part of each a child in the tool's seam with it.
  - `pydantic` answers the convergence domain's three requirements — `extra='forbid'`, `Field(discriminator=...)`, `model_json_schema()` — and stays at the edge: an adapter's wire models, the delivery layer's request and response models, `libs/` and `shared/` code that parses, the settings under `root/`, while `kernel/`, `contracts/` and a feature's `domain/` hold the frozen, slotted, keyword-only dataclasses of the language block. An owned document's model is strict and forbids unknown keys, a vendor's ignores them; models are frozen; secrets are `SecretStr`; a `ValidationError` becomes the details of one coded error without the rejected values; the published schema comes from the model; the environment is read by one `BaseSettings` that the root builds; only pydantic 2's forms are written. python-check holds its home, the edge and `shared/` (ADR-0158), and ty holds the forms pydantic marks deprecated, which its part already makes errors.
  - `httpx2` answers the remote-data domain's transport requirements, its retries in part: a timeout of the system's own on every client and no `timeout=None` (MUST), one `AsyncClient` per system built by the root and open for the program's life, bodies parsed by their model and never through `response.json()`, failures mapped in the adapter, retries written in the adapter, and `MockTransport` in specs that refuses an unexpected request; python-check keeps it to its home, the adapters, `libs/`, `shared/` and `root/` (ADR-0158).
  - `structlog` renders every record of the standard library's `logging` through one chain — `ProcessorFormatter` with the same `foreign_pre_chain`, secret keys masked, `merge_contextvars` and a trace id the middleware binds, JSON in production and console lines in development, events with fields in `extra`; code logs through `logging.getLogger(__name__)`, and only `root/` configures and imports structlog, which python-check holds by structlog's home (ADR-0158). Seams with FastAPI and FastMCP send Uvicorn's records (`log_config=None`) and fastmcp's (its handler removed, or `FASTMCP_LOG_ENABLED=false`) through the same chain.
  - `fastapi` requires pydantic: parameters and dependencies in `Annotated` (`FAST002`) and every path parameter taken (`FAST003`), held by Ruff's new part `fastapi.toml`, the last link of the chain after the specs' part; the program raises the error kit's errors, never `HTTPException`, which the part bans; the `lifespan` opens and closes what the app keeps; async handlers never block; the root assembles the app and registers the error kit's handlers; an unexpected failure is logged once, with `uvicorn.error`'s second record filtered; specs run through `ASGITransport`.
  - `fastmcp` requires pydantic: every tool and parameter described for the model (MUST), arguments bounded by their annotations, one middleware the root adds answers every failure with `mask_error_details=True`, a validation error inside a tool masked as internal, no `ToolError` raised by the program, specs through the in-memory `Client`.
  - The template's `[tool.importlinter]` turns on `include_external_packages` so a contract can name a module from outside, and its cycle contract names the package, since `*` would match the packages from outside too. This repository pins pydantic in its `dev` group for ty's specs.
- **Rejected.** `protected` contracts listing where a library may be imported, which fail when the library is absent from the graph; Ruff's `FAST001`, which reports nothing under Python 3.14's lazy annotations; a Ruff part for FastMCP, whose chain would then run through FastAPI's part; the libraries' bans in `extend-banned-api` without the specs' bans repeated, since a part's `extend-banned-api` replaces the one it extends; structlog's own logger API in the program, for the standard logger every library already writes to.
- **Why.** The kit's Python packages and the owner's APIs are built on these libraries; each gets the rules its practice settled on, held by the tools the language block already runs, so the edge, the network and the logs are kept as in TypeScript.

## ADR-0130 — An editor finds the specs' own TypeScript configuration

**Date:** 2026-10-04 · **Status:** Superseded by ADR-0131

- **Decision.** Where specs need Bun's types and the program does not, the program's configuration is `tsconfig.src.json`, the specs' is `tsconfig.test.json`, and `tsconfig.json` holds no files and references both (`specs-checked-by-their-own-config`).
- **Rejected.** The program's configuration as `tsconfig.json` with the specs left out: an editor reads only `tsconfig.json`, so it opened every spec without the `ESNext` lib, Bun's types or the decorator options and reported errors the check never saw.
- **Why.** The solution-style configuration, as Vite's templates use it, gives each file its own configuration in the editor and in the check alike (found in droneey/kit).

## ADR-0131 — Bun takes the program's options from tsconfig.json

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Where specs need Bun's types and the program does not, the program's configuration is `tsconfig.src.json`, the specs' is `tsconfig.test.json`, and `tsconfig.json` extends `tsconfig.src.json`, keeps `files` and `include` empty and references both (`specs-checked-by-their-own-config`).
- **Rejected.** The program's configuration as `tsconfig.json` with the specs left out: an editor reads only `tsconfig.json`, so it opened every spec without the `ESNext` lib, Bun's types or the decorator options and reported errors the check never saw. A `tsconfig.json` with references alone: Bun's transpiler reads only `tsconfig.json` and follows no reference, so a spec run by `bun test` lost the program's transpiler options, such as its decorators.
- **Why.** Extending the program's configuration gives Bun its options, while TypeScript still reads a file with no files of its own as a solution and opens each file with the configuration that holds it (verified on Bun 1.4.2 and TypeScript 7.0.2).

## ADR-0132 — One script for each area of the check, whatever the language

**Date:** 2026-10-04 · **Status:** Superseded by ADR-0155

- **Decision.** Each area of the check has one `<area>:check` script, or Poe task, that runs every tool of that area in each language of the repository: `lint:check` runs Biome and Ruff, `type:check` tsc and ty, `test` both runners (`check-chains-area-scripts`, `check-chains-area-tasks`, which replace `check-chains-tool-scripts` and `check-chains-tool-tasks`).
- **Rejected.** A prefix for the second language, `python:lint:check`: two families of names, and `lint:check` would quietly check one language.
- **Why.** A person, CI and the hooks run one name per area, and a language added later joins the areas instead of adding names.

## ADR-0133 — NestJS's decorator options are written where Bun reads them

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** `experimentalDecorators` and `emitDecoratorMetadata` are written in the `tsconfig.json` of the folder `bun test` runs from, a unit's own when its specs run from its folder, besides the nestjs part it extends (`decorator-options-where-bun-reads`).
- **Rejected.** A Bun built from the open fix (oven-sh/bun#43110), which no release carries; the options through the presets alone, which Bun 1.4.2 drops.
- **Why.** Bun's transpiler ignores an `extends` array (oven-sh/bun#43097), so a spec fails at its first decorated member while tsc passes; the rule goes with the Bun release that follows the array. Bun 1.4.2 also takes the options from the working folder's `tsconfig.json` alone: a unit's decorated spec passes from the unit's folder and fails from the root, whose `tsconfig.json` lacks them.

## ADR-0134 — Tools pinned exactly in both languages

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** A build, test or lint tool is pinned to one exact version, as a development dependency of the manifest or in the toolchain's file, in TypeScript as in Python (`tools-pinned-exactly-by-the-repository`): Syncpack's `typescript` part asks for exact versions in `devDependencies` and caret ranges in `dependencies` only. The program's dependencies keep their ranges, and the lockfile pins what is installed.
- **Rejected.** Caret ranges for the tools, which TypeScript had: an update inside the range moves a tool through the lockfile alone, and a new version of a linter or a type checker changes what the check reports, so it belongs in the manifest where a reviewer sees it (owner).
- **Why.** Python already pinned its tools with `==`; one meaning in both languages lets one core rule state it.

## ADR-0135 — Shipped types and the environment's readers are MUST

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** A published package ships the types of every entry a consumer imports (`ships-its-types`), and only `root/`, the configuration provider a lower block names, the entry files and the specs read the environment (`environment-read-only-by-the-root`); both are MUST. Eight SHOULD rules that #269 re-parents onto a MUST become MUST: `every-tool-runs-on-bun` carries out core's `tools-run-on-the-pinned-runtime`; `no-deprecated-import` carries out core's `deprecated-forms-never-used`; `error-boundary-catches-render-errors` and `error-component-per-route` carry out what is now ui's `failure-contained-to-its-screen`; `one-writer-of-the-head`, React's rule for the document's head, carries out core's `one-writer-per-shared-resource`; `files-list-what-ships`, split from TypeScript's `manifest-exports-with-types-condition`, carries out distribution's `ships-only-the-files-it-names`, the foundation half of what is now core's `package-entries-curated`; `one-transport-instance-per-system`, with ky's and httpx2's forms of it, carries out core's `one-explicit-composition-root`; `data-failures-rendered-as-state` carries out ui's `data-result-is-union-by-status`. Three more follow from the placement review of #271: `decorators-applied-at-composition-root` carries out core's `one-explicit-composition-root`, `form-reuses-domain-predicates` core's `value-object-built-only-by-its-check`, and analytics' `sinks-behind-one-contract` core's `extension-by-addition`. Ten more follow from the judged review of #271 (#286): `real-effects-chosen-at-composition-root` carries out core's `side-effects-at-the-edges`, and mobile's `device-capabilities-behind-ports` with it; `adapter-receives-its-dependencies` core's `one-explicit-composition-root`; `data-ports-split-by-reads-and-writes` core's `contracts-shaped-by-role`, while owned-data's `command-repository-per-aggregate-root`, which carries out `changes-through-the-aggregate-root`, states MUST; `feature-speaks-in-its-own-contracts` core's `features-blind-to-each-other`, and convergence's `document-lives-in-composition` with it; `contract-lifts-on-the-second-feature` core's `code-lives-with-its-reason-to-change`; `file-is-one-semantic-unit` core's `one-reason-per-unit`; and ky's `ky-timeout-and-signal-kept` states MUST, as httpx2's `timeout-on-every-client-and-call` does. Two naming conventions that sat under them, `ports-named-by-entity-and-side` and TypeScript's `file-named-after-its-export`, stay SHOULD as rules of their own. Three more rise with the fourth audit: `composition-on-the-second-consumer` carries out core's `code-lives-with-its-reason-to-change`; `elements-found-by-role-label-text` states MUST, so testing-library's `queries-by-role-label-text` and playwright's `locators-by-role-label-text` agree with it; and browser's `entry-document-declares-the-viewport`, the viewport clause taken out of CSS's `mobile-first-additive-breakpoints`, carries out `wcag-aa-conformance`. With the fifth audit, `diagnostics-through-the-logging-port` becomes MUST, and with the sixth it carries out core's foundation rule `diagnostics-through-the-logging-facade`, a MUST, and observability's `logging-configured-by-the-root` no longer states it. A rule that carries out a MUST cannot be looser than it.
- **Rejected.** SHOULD, which TypeScript's `manifest-exports-with-types-condition` and core's `environment-read-only-by-the-root` had, while Python's forms were already MUST: one meaning cannot bind one language and advise the other (owner). MUST for the two naming conventions, whose name a reason may leave without breaking the rule they once carried out (owner).
- **Why.** Each exception the SHOULD left room for is named in the rule — the entry files and the specs for the environment — so nothing reasonable is left outside it.

## ADR-0136 — A rule stays in core only when no domain gives it its meaning

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** Core keeps only rules that mean something with no domain active; a project lists the domains it has. The rules of logs a collector reads go to `observability`; of version control to `version-control`, where core keeps who decides what is recorded or shipped and version control the commit, push and merge forms; of callers who sign in with different rights to `access-control`; of a repository anyone can read to `open-source`; of aggregates to `owned-data`, with core's data ports named per entity; of a transport to another system, and of the vendor's captured answers in the specs, to `remote-service`, split from `remote-data`, which keeps the cache. `diagnostics-through-the-logging-port` and `ci-steps-pinned-to-immutable-references` stay in core.
- **Rejected.** Keeping the rules in core so that existing projects keep them without listing a domain (owner: correctness over compatibility; the projects are updated). `public-repository` as the name of the domain (owner: `open-source`). The logging port in `observability`, since a program that keeps diagnostics needs a port whether or not a collector reads them (owner). The pin of CI steps in `version-control` (owner). `remote-data` requiring `remote-service`: a domain requires nothing, so the two meet in seams (owner).
- **Why.** A core rule binds every project, so one that needs an aspect a project lacks is noise there, and the project cannot tell which rules apply to it.

## ADR-0137 — Accessibility is a chapter of the user interface

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** The outcomes of accessibility are the chapter `a11y` of `ui` (`ui/foundation/a11y.md`). A platform states its mechanisms in its `with/ui.md`, and an implementation that requires the user interface keeps them in its own file. `a11y` stays a tag.
- **Rejected.** A separate domain `a11y`, which a project with a user interface could leave out of its list and so drop WCAG without an override.
- **Why.** Every user interface must be accessible, so leaving accessibility out must be a departure someone writes down, not a domain someone forgets.

## ADR-0138 — Each mutant runs against the specs that load its file

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** Stryker runs `bun test` through the archive's runner `bun-specs` (`tools/mutation-check/dist/runner.js`), which runs each mutant against only the specs whose imports reach its file, the nearest first; a mutant in a file no spec loads survives (`stryker-runs-the-archive-runner`).
- **Rejected.** Stryker's command runner, which ran every spec for every mutant: a run cost its mutants times the whole suite, and a change to 24 specs ran 2,416 mutants past CI's 15 minutes. The specs in the `__tests__/` folders above the file, which left 119 mutants of this repository alive in helpers proven through the specs of the boundaries that use them, as `spec-per-boundary` asks. A community runner for Bun with per-test coverage, which over 986 mutants took 58 s against 52 s for the command runner and has one maintainer.
- **Why.** The full run of this repository, about 3,500 mutants, took 1 min 3 s against 5 min 25 s and left alive no mutant the command runner killed; the cost of a mutant follows the specs that prove its file, not the size of the program.

## ADR-0139 — The tools' folders skipped in each package, four folders down

**Date:** 2026-10-05 · **Status:** Superseded by ADR-0200

- **Decision.** The ls-lint part of each tool that writes a folder — `.venv`, `node_modules`, `mutants`, `.stryker-tmp` and the caches — skips it at the root and under one to four folders, `*/<folder>` to `*/*/*/*/<folder>`.
- **Rejected.** `**/<folder>`, which ls-lint expands by walking the whole tree once for each pattern before it lints: kit's check went from 0.07 s to 5.1 s, and this repository's from 0.1 s to 8 s for one part, and in a checkout that holds agents' worktrees it had not finished after ten minutes. The folders of each package listed in the project's `.ls-lint.yaml`, as kit did, which every repository of packages would write again.
- **Why.** The bounded patterns take 0.4 s in kit and 0.9 s in a checkout with eight worktrees, and four folders hold the layouts in use, `packages/<name>` to `packages/<group>/<language>/<name>`; a package deeper lists its folders in its project's `.ls-lint.yaml`.

## ADR-0140 — pytest's hidden folders kept beside the folders the unit run leaves out

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** The template's `norecursedirs` is `[".*", "integration", "e2e"]` (`integration-folders-not-collected`).
- **Rejected.** `["integration", "e2e"]` alone, which replaces pytest's defaults, so Hypothesis warns that it skips `.hypothesis/` and `filterwarnings = ["error"]` fails the run; pytest's whole default list, whose `build`, `dist`, `venv` and `node_modules` never sit under `tests/`, the only path `testpaths` collects, and would skip a folder of specs that bears one of those names.
- **Why.** `.*` is the one default a collection from `tests/` meets: the folders the tools write at the package's root.

## ADR-0141 — A container wires only from the bindings the root composes, and partly names the rule that covers the rest

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** `one-explicit-composition-root` lets a container do the wiring when every binding is written in the declarations the root composes — its own, or those of a feature's module the root names in its imports; a container that finds its bindings by scanning, by name or by convention, or that a unit asks for what it needs, is the magic the rule forbids. NestJS meets it: the root module imports each feature's module by name, a contract is injected by a token bound with `useClass` or `useFactory` (`contracts-injected-by-token`), no unit takes `ModuleRef` or `DiscoveryService` (`injector-never-asked-for-a-dependency`), and no module the program writes is `@Global()`, a library's being imported only by the root (`no-global-module`). Its compiler part keeps `verbatimModuleSyntax` and `strictPropertyInitialization` on: tsc 7 passes kit's NestJS package and a fixture of injected classes and request bodies with both, a field the framework fills is marked `!` (`framework-filled-fields-marked-definite`), and Biome's `useImportType` is off in the NestJS part, since its fix turns an injected class into a type import whose metadata is `Object` (`injected-classes-imported-as-values`). A Requirements answer means: `yes`, the library meets the rule as written; `partly`, it meets the rule's purpose or part of its letter, and a rule of the answering block covers the rest; `no`, it cannot meet the rule, and a rule of the answering block replaces it. A `partly` or `no` answer names that rule in backticks, `blocks:check` fails one that does not, and `/ratify` lists every such answer of the blocks it proposes before it writes.
- **Rejected.** Bindings written only in the root's own declarations, which would move every feature's providers into the root module and leave a feature's module nothing to declare; an override of `one-explicit-composition-root` in every NestJS project, which records a framework's nature as each project's choice and silences the rule repository-wide; leaving `partly` undefined, which let an answer admit a gap no rule covers; loosening a rule in the block that answers it, which ADR-0092 already refused.
- **Why.** A container that follows written bindings keeps every concrete choice in one readable place, which is what the rule asks; one that discovers them does not. An answer that names its covering rule tells a project what it follows instead of the requirement, so no gap is left silent.

## ADR-0142 — Python's value, command line and package floor

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** Core's `invariant-values-are-plain-immutable-data` asks for each language's plain immutable record; Python's is a frozen dataclass of immutable fields that checks its invariant in `__post_init__` (`invariant-value-is-a-frozen-dataclass`), TypeScript's a branded primitive or readonly plain object. A Python command is a module `<name>_cli.py` in `cli/`, its shared flags in modules of one word, listed by the surface of `cli/`, registered by `root/wiring.py` and run through `main()` by `[project.scripts]` and `__main__.py`. A published package may declare any `requires-python` floor, raises it only in a minor release, and lists every minor from the floor up in its classifiers; a package published for the public should floor it at the oldest minor of SPEC 0's three-year window; an application no registry distributes keeps its floor at the pinned minor. The toolchain pins every minor the floor admits — `mise.toml` takes a list, `python = ["3.14.8", "3.13.16"]` — and with `python-downloads = "never"` and `python-preference = "only-system"` uv takes mise's 3.13 and downloads none.
- **Rejected.** A `NamedTuple`, which equals any tuple of the same items, and a pydantic model or a msgspec `Struct` inside the program, which tie a value to a parsing library; plain modules of any snake_case name in `cli/`, which no tool could tell from a role file once Python spells the role as the last word; the pinned minor as a public package's floor, which drops every consumer one minor behind; SPEC 0's window as every published package's floor, which makes a package only its own team installs carry and test minors no consumer runs.
- **Why.** Each form is the one the language's community uses in 2026, and each was run before it was written: the dataclass's equality and hash, Typer's script and `python -m`, and uv finding each minor mise pins while an unpinned one resolves to whatever Python the machine has.

## ADR-0143 — A server's delivery layer is `api/`, and one handler answers every failure

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** The delivery layer of a program that serves requests is `api/`, which TypeScript's dependency-cruiser parts admit and guard as they do `cli/`. One handler, registered by `root/`, answers every failure of every request: an expected error from its code and any other with a masked internal error; no error the program raises carries a status. A server framework passes every failure, its own included, to that one handler, and parses a request before its route or tool runs; NestJS, FastAPI and FastMCP meet both, as a probe of each showed: an unknown route or tool, a wrong method and a malformed body or argument all reached the handler the program registered. Such a refusal is the caller's failure of its kind, answered with what was refused; only a failure neither expected nor refused is masked. `client-checks-repeated-on-server` stays in `untrusted-client`.
- **Rejected.** `handlers/` as the folder's name, which says what every delivery layer holds rather than which entry surface it serves, as `cli/` does.
- **Why.** Every request, whatever its protocol, is answered by one handler from codes the program owns, so a framework's own failures cannot leak past it.

## ADR-0144 — Core states an adapter's dependencies, an error's code and an options object by meaning; the blocks give the form

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** An adapter receives its dependencies explicitly, as a factory's parameters or through its constructor, and keeps no hidden state (`adapter-receives-its-dependencies`); `adapter-is-a-factory-module-object-or-class` replaces `adapter-built-by-factory-or-module-object`: its form is a factory, a module object or a class whose constructor takes its dependencies. Each block says its default: `_react` a factory or a module object, never a class (`adapter-is-a-factory-or-module-object`); `nestjs` an `@Injectable()` class (`adapter-is-an-injectable-class`). `expected-failures-typed-with-codes` asks for a stable code a caller can branch on, and the code's format is the error library's. TypeScript's options object has a named type, `options-object-has-a-named-type`, whatever its name.
- **Rejected.** A factory as core's only form, which would set a NestJS program's adapters apart from every other part its injector wires, each an injectable class; `_react`'s form stated in `typescript`, which would forbid NestJS's class in the same language; the format `<MODULE>_<ENTITY>_<KIND>` in core, which is one error library's convention; the name `<Function>Input`, which a type shared by several functions or named after its concept cannot follow.
- **Why.** Core keeps what holds in every program — dependencies a test can replace, a code a caller can branch on, a whole with a name — and a form one framework or library imposes belongs to that block.

## ADR-0145 — Images pinned by version and digest

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** An image in a Dockerfile, in a Compose file or run by a script names its most specific version and its digest, `image:x.y.z@sha256:<digest>` (`images-pinned-by-version-and-digest`), and carries out core's `downloads-pinned-by-version-and-checksum`: the digest is the image's checksum. hadolint and dclint keep holding the untagged and `latest` forms only: neither has a setting that requires a digest, and hadolint 2.15.1 and dclint 3.1.0 both pass a tag with a digest, a tag alone and a digest alone, so the digest is reviewed.
- **Rejected.** The patch tag alone, which ADR-0116 accepted: a registry lets any tag, a patch's included, be pushed again, so two builds of one source can run different images, the drift the rule's own Why forbids. The digest alone, which tells a reader and an updater nothing of the release it pins.
- **Why.** Only a digest names content that cannot change; the version beside it keeps the pin readable and lets an updater move both together.

## ADR-0146 — An active library of accessible primitives takes the dialog, the popover and the accordion from the browser's elements

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** Browser's `dialog-popover-and-details-native` binds only when no other active block brings accessible primitives for these patterns, as react-dom's `one-writer-of-the-head` yields to another block that claims the head; browser's `native-popover-anchored-to-its-trigger`, which places a native popover by anchor positioning, yields the same way to primitives that place their own popovers. shadcn builds the dialog, the popover and the accordion on Base UI with the rest of its kit (`complex-widgets-on-base-ui`).
- **Rejected.** The browser's `<dialog>`, `popover` and `<details>` beside a primitive library: Base UI gives a dialog scroll lock, light dismiss in Safari and a controlled state, a popover an opening on hover after a delay and a modal focus, and an accordion's headers arrow, Home and End keys, none of which the elements carry, and a kit that mixed both would show two behaviours of one pattern. The elements whatever the project brings, which made shadcn's rule contradict the browser's.
- **Why.** The platform's element is the right primitive while it carries the whole pattern; once a project has chosen a library that carries more, that library is the accessible primitive `complex-patterns-on-accessible-primitives` asks for.

## ADR-0147 — A package is laid out by what it does, whether a registry distributes it or not

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** Distribution changes no package's tree. An application distributed through a registry — a command-line tool installed from a package registry — keeps the application's tree (core's anatomy, Python's `import-package-holds-the-tree`), floors its `requires-python` as a public package does (`requires-python-floor-in-the-support-window`) rather than at the pinned minor (`requires-python-at-the-pinned-minor`, now for an application no registry distributes), and is not bound by `libs-import-no-application-code`, which binds code of `libs/`. A package others import has the same tree without `root/` and `entrypoints/` (ADR-0157).
- **Rejected.** Every distributed unit laid out as one kind of package, which left a distributed command-line tool without the tree its own delivery layer and features need; the pinned minor as a distributed application's floor, which drops every user one minor behind as it would a consumer of an imported package; a domain of its own for distributed applications, which would restate the publishing rules `distribution` holds for every distributed package.
- **Why.** What a consumer does with a package decides its shape: one that is imported has nothing that runs it, and one that is run is a program like any other, whatever channel delivers it.

## ADR-0148 — The logging port is the language's standard facade, and the domain logs nothing

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** `diagnostics-through-the-logging-port` names the port: the language's standard logging facade, whose sinks only `root/` configures, where the language has one — Python's `logging`, which structlog configures (`code-logs-through-the-standard-logger`) — and a contract of the program's own where it has none, as TypeScript's programs keep one over pino (`code-logs-through-the-port`). The domain, its use-cases included, logs nothing: it returns a result or an error, or emits an event, and a binding unit of `app/` or the delivery layer logs. Python's template holds it with the import contract `domain-imports-no-logging`; structlog's contract already keeps structlog to the root.
- **Rejected.** A contract of the program's own over a standard facade, which every library already writes to, so a wrapper adds a layer and splits the program's records from theirs; a domain that logs, which would choose what an operator is told in the code that should know only the business, and give every pure function an effect.
- **Why.** One pipeline for every record, configured in one place, and a domain whose every outcome is a value its caller can test.

## ADR-0149 — A constructor the NestJS injector calls is exempt from the limit of three positions

**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** `decorated-constructor-takes-every-dependency` carries out the exemption `parameters-at-most-three-wholes-as-one-object` gives a signature a framework imposes: a provider's constructor takes one parameter for each dependency. Biome's `useMaxParams` is off in the files that hold such classes — NestJS's own suffixes in the foundation part, the roles of the tree (`.use-case`, `.adapter`, `.repository`, `.sink`) in the architecture part — and on everywhere else; Biome 2.5.13 counts a constructor's parameters and has no option to leave constructors out, and an override scoped by these globs lifts it there alone.
- **Rejected.** `useMaxParams` off for every file of a NestJS program, which drops the limit from the functions it was written for; dependencies gathered into one object, which the injector, resolving each parameter by its type, cannot fill; a GritQL rule that counts parameters outside decorated constructors, a second implementation of a rule Biome already holds.
- **Why.** The injector, not the author, fixes the constructor's signature; a class with too many dependencies is split by its responsibilities, which the limit on positions never showed.

## ADR-0150 — A workspace and a distributed package are two domains, and core lays out every package

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** The `package` domain is removed and its meaning split three ways. Core's anatomy lays out every package (ADR-0157): an application keeps the application's tree whether or not it is distributed, and a package others import has the same tree without `root/` and `entrypoints/`, offers its entries and nothing else (`package-entries-curated`) and knows nothing of those that use it. The `workspace` domain holds a repository of several units, with the roles and the direction they have inside a program: the products in `packages/<name>/`, never importing one another; what two or more of them need in `shared/`, laid out by meaning like a program's `shared/` — `contracts/`, `kinds/` — a part appearing when a second product needs it; what knows nothing of the product in `libs/<name>/`; imports from `packages/` to `shared/` to `libs/` and never back; and a root that holds only the workspace and its tools' configuration. A unit in one language is the package itself; a unit in several holds `shared/`, its data in no language laid out by meaning (`schema/`, `conformance/`), and one package for each language in `<language>/`, the language's folder appearing with the second language (`unit-is-one-package-per-language`); `shared/` and a unit of `libs/` take the same form. Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module of its one package per language, an integration in `integrations/<framework>/`. A unit is imported by its name, which follows its folder under the repository's scope (`unit-named-after-its-folder`): in TypeScript `@<scope>/<name>`, `@<scope>/shared`, `@<scope>/libs-<name>`, an integration the subpath `@<scope>/<name>/<framework>`, and `#/` inside a package; in Python the distributions `<scope>-<name>`, `<scope>-shared` and `<scope>-libs-<name>`, imported as `<scope>_<name>`, `<scope>_shared` and `<scope>_libs_<name>`, an integration installed by the extra of its framework. dependency-cruiser and import-linter hold the direction by the folder an import resolves to, so a wrong name never hides a wrong direction. In TypeScript every package keeps `#/` with its `paths` mirror (ADR-0069) and is a project of its own: `composite`, its declarations and `.tsbuildinfo` emitted into its ignored `.tsc-cache/`, and the packages it imports in `references` (`unit-compiled-by-its-own-options`, `unit-built-as-a-composite-project`); an importer is checked against the imported package's declarations, so neither its `paths` nor an option it turns off, such as `allowImportingTsExtensions`, reaches the imported package's source. Bun resolves each file's `#/` by the `tsconfig.json` of its own package, so the packages run from source. Data in no language that several packages read is parsed by each at its edge, and its specs read the file itself by its path (ADR-0159). The `distribution` domain holds a package others install from a registry, one whose code they import or an application such as a command-line tool: what it ships, its versions, its deprecations and its publishing; `versions-follow-semver` moves with it unchanged. Every package, those of `shared/` and `libs/` included, is a unit with blocks of its own. dependency-cruiser holds the direction from the root's configuration (`product-units-blind-to-each-other`, `units-import-toward-libs`), counting a unit's folder as the unit whatever its languages, and refuses a relative import into another unit's folder by its `local` type without `aliased-workspace`; import-linter holds it with an `independence` contract and a `layers` contract over the import packages the project names, in the root's `pyproject.toml`.
- **Rejected.**
  - One `package` domain mixing a package's tree, the workspace and publishing, which bound a repository of applications that publishes nothing to publishing rules and left a distributed application without its tree.
  - A unit per shared need, `shared/<name>/`, which scatters what the product shares over many manifests while one unit with a part per need is found in one place.
  - A product split into several packages of one language — `core`, `wire`, `nestjs` — each with its manifest, which made the tools and the rules tell a group of packages from a unit and gave a consumer three installs for one product; its parts are modules of one package, and an integration an entry of it (owner).
  - `#/` only in applications, a package another imports reaching its own files by relative path: it split one alias rule into two, and still left the importer's compiler options reaching the imported source, so an importer with `allowImportingTsExtensions` off failed on the shared package's `./x.ts`.
  - Tier scopes, `@libs/<name>` and `@shared/<name>`, which a registry may not let the project own; a path alias, `@/libs/<name>`, which no manifest declares; `@<scope>/libs/<name>`, which npm and Bun refuse, a package's name holding one slash only.
  - Python namespace packages, `<scope>.libs.<name>` and `<scope>.shared` (verified on uv_build 0.12, ty 0.0.84, import-linter 2.15 and mutmut 3.8): deptry 0.25.1 maps an import by its top-level name, the one namespace every unit shares, so it reports correct dependencies as unused and passes after a dependency is removed; the import package's folder `src/<name>/` that python-check reads would become the namespace.
  - The `#*` alias with an explicit `index.ts`, which ADR-0069 rejected; `preserveSymlinks` to tell an import by name from one by path, which hides every import by name behind `node_modules/` and lets the direction pass whenever a unit is imported by name.
- **Why.** Each meaning loses its sense without a different thing: a package's tree without nothing, a workspace without several units, a release without a registry. Kept apart, a repository takes only what it has, and each rule is stated once. A package compiled by its own options alone is checked once, by its own rules, however many packages import it.

## ADR-0151 — Each unit is checked by the parts of its own blocks

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** In a workspace, each unit's files are held by the parts of its own blocks, and no unit's parts reach another's (`unit-checked-by-its-own-parts`, a rule of `workspace`, which it means nothing without). Each tool's seam with `workspace` gives the form: Biome as ADR-0213 has it, dependency-cruiser a configuration per unit (`cruiser-configuration-per-unit`) beside the root's, which holds the imports between units (`imports-between-units-held-at-the-root`), and knip a configuration per unit since ADR-0213. Bun's coverage gate leaves out `../**`, the files of the units a unit imports, which their own specs hold (`coverage-gate-on-the-unit-alone`). Each unit with code its specs run has its own `stryker.config.mjs` (`stryker-configuration-per-unit`), and Stryker's part loads the archive's runner by its path from the preset's own file, which finds it from any folder. Each was verified on a workspace of the presets in `tests/e2e/workspace.e2e.test.ts`.
- **Rejected.** One run from the root with every unit's parts joined, which applies a framework's names or layers to the units that do not use it; overrides per path in one configuration, which only some tools have and which then differ from tool to tool; a coverage ignore that names each imported unit, which changes with every new dependency; a `plugins` path written into each unit's `stryker.config.mjs`, which every unit would write again.
- **Why.** A unit's blocks are the rules it is held to; a part applied beyond it changes another unit's rules, and one written for `src/` that runs from the root holds nothing at all.
- **Superseded in part.** The root's configuration holding the imports between units (`imports-between-units-held-at-the-root`), by ADR-0245: each unit's own holds the imports it makes into the others.

## ADR-0152 — A semantic alias is a type exported by its module

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** A semantic alias is a type exported by the module whose meaning it names, a vocabulary several features share lives in `kernel/`, and a term that keeps an invariant is a value object (`semantic-alias-exported-where-it-belongs`); code imports an alias with `import type` (`semantic-alias-names-a-shared-meaning`). The template `types.d.ts` is removed.
- **Rejected.** One ambient `types.d.ts` at the source root, which `ambient-aliases-are-project-vocabulary` asked for: it reaches every file unseen, `libs/` included, so no import rule can keep it out, and in a workspace the ambient file of one unit is not the one the units it imports compile with (owner).
- **Why.** An alias imported from its module is a type like any other: its file shows where the meaning comes from, and the import rules place it.

## ADR-0153 — A command loads what it changes and returns nothing

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** A port or use-case answers or changes, never both, and a command may load what it changes — the entity, or the aggregate whose invariants it keeps — through its own port of the write side (`ports-and-use-cases-answer-or-change`). A command returns nothing; returning the identity of what it created is strongly discouraged and avoided wherever the caller can supply it, by making the identifier and passing it in (`command-returns-nothing`, SHOULD). `reads-and-writes-apart` and its dependency-cruiser and import-linter settings already allow it: they refuse an import between `queries/` and `commands/`, and the load sits in the command's own repository.
- **Rejected.** A command that may read nothing, which leaves it no way to keep an invariant over what it changes; a command that returns the created identity as a rule, which makes it half a query its caller depends on and keeps the caller from retrying it safely (owner).
- **Why.** Command and query stay apart where it matters — what a command decides on is only what it changes and what its caller gave it.

## ADR-0154 — The fifth audit's merges, levels and placements

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.**
  - `shipped-configuration-asserted-by-spec` carries out `spec-per-boundary` and states MUST, the level it had; the coverage of a distributed unit's code is `coverage-holds-all-logic`'s, unrestated.
  - `no-hexadecimal-colour` is one tool-held rule, bound once to Biome's `noHexColors`: no stylesheet writes a hexadecimal colour, the theme's included.
  - `props-drilled-at-most-two-levels` is a SHOULD of its own, and `system-increased-contrast-honoured` a MUST of its own, held by a test.
  - `one-error-handler-per-transport` states MUST, and the rules under it no longer state it.
  - `command-repository-per-aggregate-root` carries out `changes-through-the-aggregate-root` and states MUST.
  - Browser's `native-popover-anchored-to-its-trigger` names the declarations that place a native popover, and CSS's `popover-placed-by-anchor-positioning` is folded into it.
  - `no-second-model-of-remote-data` carries out `server-owns-remote-data`, and so is MUST.
- **Rejected.** Two rules bound to one setting, one inside the theme and one outside it, which said one thing twice; `talk-only-to-neighbours` as the parent of a drilled prop, which is about calls through another object's collaborators, not props; increased contrast under `wcag-aa-conformance`, which asks nothing of the system's setting; a CSS rule for the popover beside the browser's, which held one meaning twice, and a CSS seam with `browser` for its declarations, which cannot reach a rule of browser's seam with `ui` (owner).
- **Why.** A rule carries out the rule whose meaning it narrows, and one meaning is stated once.

## ADR-0155 — The constitution holds what a tool is configured to hold, never how the project runs it

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** The constitution holds a program's structure, boundaries and code, the design of its tests, and the configuration of each tool that holds a rule; it prescribes none of the project's commands, script entries, command-line flags, the order of its runs, the folder a tool runs from, its installs, its CI steps, its schedules or its release procedure.
  - `one-check-command` asks only that the project has one check that runs every tool holding a rule and fails on a violation, and that `constitution.yaml` names its command, which `/check` and the hand-back gate read. The check's entries per area (`check-chains-one-entry-per-area`, `check-chains-area-scripts`, `check-chains-area-tasks`) and the Poe the Poet block go, and the template's `[tool.poe.tasks]` with them.
  - Removed: `check-only-checks` and its children (`biome-check-never-writes`, `ruff-check-never-fixes`, `check-writes-no-snapshot`); `integration-specs-in-their-own-run`, `unit-without-specs-passes-empty`, `each-unit-linted-in-its-folder`; the scanners' runs (`secrets-scanned-on-every-change`, `history-scanned-once-on-adoption`, `hadolint-over-every-dockerfile`); the installs (`installs-follow-the-lockfile`, `installs-follow-uv-lock`, `lowest-direct-run-isolated`); `stryker-runs-each-mutant-against-the-specs-that-load-it`, whose child `stryker-runs-the-archive-runner`, a configuration, now carries out `mutants-all-killed`; `lingui-cli-on-bun-or-noted-exception`; git's commands (`move-with-git-mv`, `force-push-with-lease-to-own-branch-only`, `clean-tree-with-safe-cleanup`); the publishing procedure (`npm-publishes-in-the-release-workflow`, `distributions-attested-before-upload`, `publish-skips-published-versions`, `release-job-owns-publishing`, `release-cut-by-automation-promoted-by-person`); CI and schedules (`required-check-blocks-integration`, `program-built-after-the-check`, `pull-request-title-checked-in-ci`, `ci-runs-the-pinned-toolchain`, `whole-program-mutated-periodically`, `contract-run-scheduled-outside-the-check`, `updates-grouped-and-scheduled`, `toolchain-pins-updated-by-bot`). The templates lose `bunfig.integration.toml` and Docker's `scripts/run.sh` and `test.sh`; `bunfig.mutation.toml` stays, since the archive's mutation runner reads it.
  - Rewritten to the property or the configuration they held, the run dropped: `check-run-by-hooks-and-ci` becomes `commit-checked-by-the-hooks`; `stage-by-name-and-read-staged-diff` becomes `commit-holds-only-its-task-files`, a rule of version control under `commit-is-one-logical-change`, stating the MUST it had; `worktree-one-branch-own-dependencies` becomes `worktree-one-branch-no-linked-folder`; `vulnerabilities-scanned-in-the-check` becomes `every-lockfile-scanned-for-vulnerabilities` and `unused-check-in-production-mode` becomes `production-set-marked-in-the-entries`, each still the tool's own account of `audit` and `unused`; the rest keep their slug or take one that names what they hold — `biome-rules-set-as-errors`, `yamllint-rules-set-as-errors`, `dclint-rules-set-as-errors`, `network-refused-in-unit-specs`, `integration-specs-ignored-by-bunfig`, `integration-folders-not-collected`, `catalog-ships-with-its-code`, now in `i18n`, which names no library, `each-entry-has-a-size-budget`, `supported-minors-classified-and-pinned`, `tools-reach-the-programs-engines`, `cruiser-configuration-per-unit` on foundation and `imports-between-units-held-at-the-root` on architecture, `stryker-configuration-per-unit`, `syncpack-holds-versions-and-field-order`.
  - Where a run's flag gave a property no setting held, the parts now hold it: Biome's common part sets to `error` each of the 84 recommended rules, outside the nursery, whose default is `warn` or `info`, and yamllint's sets `level: error` on `comments`, `comments-indentation` and `truthy`, whose defaults are warnings. Biome 2.5.13 and yamllint 1.38 exit with 0 on a warning and have no setting that fails on one.
  - Two Requirements answers need a rule of their block, so each keeps the narrowest one: Bun's `no` to `publishing-with-provenance-supported` names `units-published-by-npm`, and uv's `partly` names `distribution-uploaded-with-its-attestation`.
  - Kept: the lefthook block, its parts, bindings and rules; Renovate's configuration; `every-commit-passes-the-check`, `release-marked-by-immutable-tag`, `release-tags-annotated`, `main-line-takes-no-direct-push`, `publishing-by-workflow-identity` and `publishing-with-provenance-supported`.
- **Rejected.** The commands kept as SHOULD rules or as a template every project copies, which still bind a project to one way of running its tools and change with each tool's flags; the CI steps kept for what they gave — a red check blocking a merge, a build after the check — which the forge and the project's own workflow decide; `--error-on-warnings` and `--strict` as the way to fail on a warning, flags of a command the constitution no longer names; the publishing rules kept whole behind the Requirements answers, where one rule per tool says what the answer needs (owner).
- **Why.** A rule about how a tool is run says nothing about the code it checks, differs between equally good projects, and goes stale with every release of the tool; a setting the presets carry holds the same property in every project, whatever runs it.

## ADR-0156 — The sixth audit's fixes

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.**
  - A function that changes state reads nothing but what it changes (`function-answers-or-changes-state`), as ADR-0153 lets a command load only what it changes.
  - Diagnostics are split by axis: core's foundation rule `diagnostics-through-the-logging-facade` (MUST) sends them through the language's standard logging facade, or the program's own logger where the language has none, never straight to the console; `diagnostics-through-the-logging-port` carries it out on architecture — only `root/` configures the sinks, and the domain logs nothing. structlog's rule splits the same way: `code-logs-through-the-standard-logger` on foundation, `only-the-root-imports-structlog` on architecture, which import-linter's `structlog-imported-only-by-the-root` now carries out.
  - `one-error-handler-per-transport` and `domain-names-free-of-vendor-and-storage` move to core's foundation; the handler loses its clause on a screen's nested boundary, which `ui` holds. `api` registers one handler on each server framework the root mounts. Core's foundation `code` passed 500 lines, so its types are the chapter `types`, which core's reading order names.
  - `transport-failures-mapped-once` states MUST and that nothing of the transport's library crosses the adapter; ky's and httpx2's children state no level of their own, and `unauthorized-acted-on-once-by-the-cache` rises with it from SHOULD to MUST.
  - Levels and parents: `deprecated-packages-replaced` is a SHOULD and `events-from-a-closed-vocabulary` a MUST of their own, as they were; `stories-render-from-fixtures` is a SHOULD of its own, below the MUST it took from `tests-run-in-a-sandbox`; `form-submits-through-a-binding-unit` carries out `components-dumb-widgets-smart`, and so rises from SHOULD to MUST; Expo's `native-projects-generated-by-prebuild` carries out `generated-files-not-committed` and states the MUST it had; `ci-profile-left-to-hypothesis` carries out `flaky-test-fixed-or-removed`; zod's `schema-never-brands` moves to foundation under `invariant-value-is-a-branded-type`, with its GritQL rule; `layer-and-module-have-one-reason` is folded into `one-reason-per-unit`'s list of units, and `cache-is-the-only-home-of-server-data` into `server-owns-remote-data`.
  - Python: the root of a uv workspace has no `[project]` (`workspace-root-has-no-project`); a distributed package names what it ships beyond its code by `source-exclude`, `source-include` and `license-files` (`files-shipped-named-in-pyproject`), since uv_build 0.12 packs the import package's folder whole, a stray `.env.local` included, leaves it out of the source distribution and the wheel alike under `source-exclude`, and ships the licence only when `license-files` names it. tsc: the specs' configuration references the program's where that is `composite`, or the specs fail with TS6307 (tsc 7.0.2).
  - Also: the active library of accessible primitives comes first, the platform's element without one (ADR-0146); dependency-cruiser's rules on importing units by name move to its architecture part, since they spell `shared/` and `libs/`, and hold `no-unit-reached-by-path`, workspace's architecture child of `units-imported-by-their-entries`; `scanner-reports-redacted`, which with its flag gone names nothing of Betterleaks, moves to core under `no-secret-or-personal-data-in-output`; `# type: ignore` is refused by ty alone; core names no widget and no cache key, and the domains say the input of a pending write; the wiring file is `root/wiring` unless a framework's block names its own; TanStack Query's rules name `useSuspenseQuery`; a route's private binding units, not its components, reach it through `getRouteApi`; `security-headers-set-in-route-rules` names its headers; `dynamic-viewport-classes` is `no-screen-sized-classes`; one rule each says no `ADD` and `oklch()`; `spec-per-boundary` gives no spec to types, constants, schemas, entries and generated files unless a rule asks for one.
- **Rejected.** An exception to the 500-line budget for core, or sections merged to fit, which the budget's own advice, a chapter per topic, answers; a role suffix for Python's `api/` modules, which no rule asks for; the rule against importing a unit by path left on foundation, whose part spells folders only the architecture axis owns; Ruff's `PGH003` for `# type: ignore`, which passes one that names codes, where ty's `respect-type-ignore-comments = false` silences none.
- **Why.** Each fix states one meaning once, at the layer and on the axis that gives it its sense, and at the level it had, or says where the level changes.

## ADR-0157 — One form of a module, and a package that nothing runs has no root

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.**
  - A module is a surface, the role folders it needs and modules of the same form, at any depth (`module-has-one-form`); the source of a package others import is such a module, and its folders are the layers of the top-level tree. A role folder may sit at any depth, the top of `src/` included. Behaviour, what a package does, lives in a feature with its layers; vocabulary — types, constants, kinds — in `kernel/` and the role folders; `utils/` holds only pure helpers with no meaning of the product; a set of interface primitives is a set of components, each a module of its own, and grows `features/` only when it gains behaviour of the product.
  - "Library" is no kind of package. A package that nothing runs, whose consumers import it, has a program's tree without `root/` and `entrypoints/`, and its `src/` has a surface, its main entry; `libs/` stays a folder role, code that knows nothing of the product. `library-has-the-form-of-libs` is removed, and `library-entries-curated` becomes `package-entries-curated`.
  - `integrations/<framework>/` is a layer of core's tree: a package's integration into a host framework, which the framework calls. Its surface is an entry of its own; nothing else in the package imports it, and integrations never import each other (`nothing-imports-an-integration`, held by dependency-cruiser's `integration-never-imported` and `integrations-blind-to-each-other` and by import-linter's `protected` and `independence` contracts). A distributed package offers it as an entry with the framework optional (`integration-is-an-entry-with-an-optional-framework`): in TypeScript an `exports` subpath, the framework an optional peer and a development dependency at its exact version, since Bun 1.4.2 installs no optional peer; knip 6.38's production run counts only `dependencies` and the required peers, so the package's configuration ignores the framework with `!` (`optional-peer-ignored-in-production`), and syncpack 15.3.3 passes the peer's `>=` floor beside the exact development copy under the distribution part; in Python a submodule and an extra of the framework's name, which deptry 0.25.1 counts as declared with no configuration and uv_build 0.12 writes as `Provides-Extra`.
  - A folder appears with its first file, stated once in core's foundation (`folder-appears-with-its-first-file`). `kernel/` may import the data files its values are read from, which import nothing.
  - The tools hold one form everywhere: dependency-cruiser counts `integrations/` among the module layers.
- **Rejected.**
  - A library as a form of its own — `libs/<name>/` taken out of a program, its modules by meaning beside its surface and no `features/` — which gave one thing two layouts, and put behaviour where no domain, adapter or binding unit sits around it (owner).
  - A preset part for libraries, which would hold the same tree twice.
  - An integration as an adapter of a port: an adapter is called by the package's own code, while a framework calls the integration; and an integration as a package of its own, which a consumer installs beside the core and keeps in step with it.
  - Role folders only below a layer, which a set of primitives at the top of a package's `src/` broke.
- **Why.** One form learnt once reads the same in every package and at every depth; a package's purpose, run or imported, changes only what wires it.

## ADR-0158 — Packages are imported by folder role, and each block names its package's home

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.**
  - Core's table, naming no library (`packages-imported-by-folder-role`): `domain/`, `kernel/` and `contracts/` import no package; the edge — `adapters/`, `libs/<name>/`, `root/` and the entry files, the delivery folder and `integrations/<framework>/` — imports any; every other folder only a package a block gives a home there. A block names every folder its package is imported in, so a home may reach past the edge or keep to a part of it; a package with no home is imported only at the edge. The repository's own units are its code, held by the workspace's direction.
  - The homes: React and React Native in a UI's components and widgets and the binding units; the form library in a UI; NestJS in `app/`, `composition/` and `providers/`; zod in a UI's forms and `composition/`; a story anything it renders with; TanStack Query in the binding units and `root/`; the router in `root/` alone, its route files and its file; Lingui where text is rendered; yaml in the adapters and `libs/yaml`; in Python pydantic at the edge and in `shared/`, structlog in `root/`, httpx2 in the adapters, `libs/`, `shared/` and `root/`. The per-library bans they replace are removed: ky's `components-import-no-http-client`, TanStack Query's `components-import-no-query-library`, `adapters-never-import-the-cache-library` and `libs-import-no-query-library`, TanStack Router's `libs-import-no-router` and its two dependency-cruiser rules, Lingui's `primitives-import-no-message-catalog` and its two rules, and the template's pydantic, structlog and httpx2 contracts with their seams. `domain-imports-no-logging` and Biome's ban of date libraries stay.
  - TypeScript: dependency-cruiser's `allowed` mode, composed from the parts (verified on 18.4.0): every part's `allowed` rules are concatenated, and a dependency no rule allows is `not-in-allowed`; `allowedSeverity` defaults to `warn` and the first part in `extends` with `allowed` rules fixes it, so each such part sets `error`; an `allowed` rule takes no name, so a binding names its `comment`; a `forbidden` rule still reports what `allowed` permits, so a home narrower than the edge adds one rule, `<package>-only-in-its-home`. Core's part tells a package by its `npm` types, leaving an undeclared or unresolvable one to its own rule, and names the delivery folder as any top-level folder that is no layer or role folder. A component importing `x-api` or `x-component-button` fails and `react` passes.
  - The change surfaced three faults of the presets, now fixed: the foundation part's `exclude` of `(^|/)\.[^/]+/` matched `../` and `node_modules/.bun/`, and `(^|/)dist/` every package resolved into its `dist/`, so a package cruised from its own folder in a workspace, or built into `dist/`, reached no rule — the exclude now keeps out only the project's hidden and built folders; dependency-cruiser 18.4.0 types a package that `peerDependenciesMeta` names `npm-no-pkg`, as it does any manifest key holding "ependencies", so `no-undeclared-dependency` leaves out a package a dependency field declares; and stories import the development dependencies Storybook brings, so Storybook's part restates `no-development-dependency-in-production` without them, before the language's part, as every block's part comes before the parts above it.
  - Python: python-check holds the table in its code and reads the homes from `[tool.python-check]`: `extend` lists the parts `presets/python/python-check/architecture/<block>.toml`, each a `[homes]` table, `edge` naming the whole edge, and the project's own `[tool.python-check.homes]` comes last; the units its `[tool.uv.sources]` links from the workspace are code (`packages-kept-to-their-homes`).
  - The global `fetch` in a component: Biome 2.5.13's `noRestrictedGlobals` in an override on `**/components/**` (`components-call-no-global-fetch`); `globalThis.fetch` and `window.fetch` escape it and stay with the review, and a second override of the rule over the same files would replace its denied globals, so no other part denies one there.
- **Rejected.** Per-library bans, one rule for each folder a library must not reach, which leave every library nobody wrote a rule for free in every folder and grow with each block; import-linter contracts per package, where `forbidden` holds only the packages it names and `protected` fails when the package is absent from the graph (ADR-0129); homes that only add to the edge, which cannot keep the query library out of an adapter; `allowed` rules alone, which only widen; a configuration of homes generated into the project.
- **Why.** The edge is where a program meets what it does not own; a table by folder role says once where any package may go, and a block says only where its own belongs.

## ADR-0159 — One workspace per language, and data in no language taken by each build from its one source

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.**
  - The root holds one workspace for each language and no package holds one (`one-workspace-per-language`): Bun 1.4.2 ignores a `workspaces` field in a package and never links what it names, failing only once another package depends on one; uv 0.12 refuses a nested `[tool.uv.workspace]`. Bun's `workspaces` are `packages/*`, `packages/*/typescript`, `libs/*`, `libs/*/typescript` and the path of `shared/`'s package (`workspaces-globbed-by-the-tree`): Bun skips a folder a glob matches without a `package.json` and fails on a path without one. uv's `members` are `packages/*/python`, `libs/*/python` and the path of each unit in Python alone (`uv-workspace-globbed-by-the-tree`): uv refuses any folder a glob matches without a `pyproject.toml`, one holding only a `package.json` included, and `exclude`'s `*` crosses a slash.
  - A file several packages need lives once; a package takes it in its build and no copy is committed (`file-lives-once-across-units`), and `generated-copy-guarded-by-spec` goes. Bun 1.4.2's `bun build` writes a YAML file imported from outside the package into the bundle, for `--target=bun` and `--target=node` and with `--packages=external`, and the bundle runs with the file gone, so a package ships its bundle (`shared-data-bundled-by-the-build`); bun-types declares `*.yaml` as `any`, so the reader parses it. uv_build 0.12 refuses `..` in `source-include` and keeps `data` inside the project, ignores an absolute path without a word, fails on a directory symlink, and follows a file symlink, writing the file's content into the sdist and the wheel, so a wheel built from the sdist alone holds it; a package links the file into its import package and a spec reads it through the package's resources (`shared-data-linked-into-the-import-package`), which fails where a checkout without symbolic links holds the link's path as text.
- **Rejected.** A copy committed and guarded by a spec, a second original; a copy step before `uv build`, which a fresh clone builds without the data and without an error; `packages/**` for Bun, which took a fixture's `package.json` under `conformance/` for a package; `packages/*` with `exclude` for uv, whose list grows with every product of another language; one pair of globs for both managers, which uv's refusal of other folders rules out.
- **Why.** One source of the data is reviewed once and reaches every language's package as it is, and each manager links exactly the packages of its language.

## ADR-0160 — A rule is an H3 heading, and the bindings alone say what a tool holds

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** A rule is a third-level heading — `### <slug> · <level>` or `### <slug> → <rule>` — and a second-level heading opens a section, which is no rule. A rule's table is `| Why | Tags |`: the Check column goes, and with it the closed list of check roles, the fields `checks` and `roles` of a card, the hook's warning about a role no tool covers, and the advice on role coverage. `bindings.yaml` is the one record of which setting holds which rule, wholly or in part. The 50 children that only restated their parent for a tool's Check are deleted, each sentence one of them added folded into its parent, and their bindings go to the parent; a GritQL rule named after a deleted child takes its parent's slug.
- **Rejected.** A Check column that lists several checks, which still writes a rule with an eye on what a tool can do and states twice what the bindings already say; keeping the roles to warn about a language no tool covers, which a rule could claim without a tool ever holding it; rules and sections on one heading level, which rendered a flat outline where a section read as a rule.
- **Why.** A rule is written for what it means; which tool holds it, and how much of it, is a fact of the tool, kept once beside the tool's settings.
- **Superseded in part.** The Tags column, by ADR-0226: a rule's table is `| Why |`.

## ADR-0161 — No rule carries out a rule of its own block

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** An arrow leaves its block: a rule carries out a rule of core, of a block it requires or extends, or of the block its `with/` seam names, never a rule of its own block, in any file or on any axis. Across blocks the axes keep their order: a base rule tightens only a base rule, an `architecture/` or `workflow/` rule one of its own axis or a base rule. Of the 150 arrows inside a block, the 50 children ADR-0160 removes go; the other 100 stand alone with the level and the tags they had taken from their parent.
- **Rejected.** Arrows inside a block only into its `principles`, which kept a chapter whose laws every other chapter leans on; `extends` or `requires` between the axes of one block, which would state what is always true; cutting the arrows between blocks too, which would drop the check that a block below never loosens the one above and the cascade of an override.
- **Why.** Two rules of one block are of one generality; written with one meaning each, they say different things and need no link, while an arrow between layers carries a principle down to its form.

## ADR-0162 — Each block's base lives at its root

**Date:** 2026-10-07 · **Status:** Superseded by ADR-0211

- **Decision.** The base, always followed, sits at the block's root: the card `<id>.md` holds the front matter, the summary and the rules of the base's main chapter, beside the base's other chapters and its `with/` seams; only the optional axes keep a folder, `architecture/` and `workflow/`. `constitution.yaml` lists only the optional axes, `axes: [architecture, workflow]`, and a listed `foundation` is a warning. The presets follow: a base part is `presets/<scope>/<tool>/<block>.*`, an optional axis's `presets/<scope>/<tool>/<axis>/<block>.*`, and each axis's folder carries its own `bindings.yaml`, part → rule → settings. The digest and the index name a base file by its name alone.
- **Rejected.** A `foundation/` folder beside the two optional ones, which drew three equal axes where one is always present and the other two stand on it; the base named in paths or messages, which gave one thing a name nothing needs to choose.
- **Why.** The layout says what is true: a block is its base, and a team adds architecture and workflow to it or leaves them out.

## ADR-0163 — Core's chapters are named for what their rules govern

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** A third question places a rule after its layer and its axis: its chapter, the one named for what its statement governs, which the statement names first. Core's base has `code`, `names`, `functions`, `relations`, `types`, `errors`, `effects`, `security`, `dependencies`, `tools`, `changes`, `layout`, `comments`, `tests` and `agents`; `code` takes only what no other chapter names. Its architecture has `layers`, `layout`, `ports`, `root`, `domain` and `tests`; its workflow `agents`. Every rule of core is rewritten to one meaning, its slug starting with what it governs, naming no tool or language of a lower layer; the philosophy of the old principles becomes rules — `structure-appears-by-symptom`, `dependency-points-toward-stability`, `port-justified-by-its-boundary`, `business-rule-lives-in-the-domain` — and the tie between two choices, cohesion over coupling, goes to `core.md`.
  - New: `failure-is-expected-or-defect`, `closed-set-branched-exhaustively` and `name-case-by-kind` (both lifted from TypeScript, whose rules carry them out), `exact-quantity-never-binary-float`, `state-never-global-and-mutable`, `unit-usable-once-built`, `implementation-keeps-the-whole-contract`, `literal-with-a-meaning-is-named`, `outside-read-bounded`, `outside-input-reaches-interpreters-as-parameters`, `outside-input-never-rebuilt-as-objects`, `security-primitive-from-a-vetted-library`, `dependency-resolved-from-its-declared-registry`, `check-never-weakened-to-pass`, `change-seen-working-before-hand-back`, `optional-part-isolated-from-its-faults`, `tidying-shipped-before-the-behaviour`, and `change-moves-a-file-never-rewrites-it`, back from version control since a file written anew loses content whether or not history keeps it.
  - Merged: the facts of one home and DRY of knowledge; logging and debug output; secrets in output, URLs, artefacts and scanner reports; configuration and its declared names; downloads and the runtime of tools; the failure rules into ten around expected failures and defects.
  - Levels: `invariant-checked-at-construction`, `resource-released-on-every-path`, the timeout of an outside call, and the agent's least privilege, restated as never holding untrusted input, private data and a way out at once, rise to MUST; reading and writing apart falls to SHOULD; the sections of a test case, opened by the comments Arrange, Act and Assert, rise to MUST.
  - Gone from core: `read-governing-rules-first`, `review-against-active-rules-before-hand-back`, `no-silent-departure` and `project-files-at-root`, which `core.md` states; the shared configuration and template rules, the mechanism of the constitution's own delivery; `package-entries-curated`, a repeat of the surface rule; the pin of CI steps, which leaves core with CI; `program-dependencies-ranged-lockfile-pins` to `distribution` as `dependencies-declared-by-range`, and `one-version-per-dependency` to `workspace`.
- **Rejected.** Chapters by broad topic — `code`, `principles`, `anatomy` — whose rules a writer could put in two of them; a chapter of laws the others carry out, which needed arrows inside the block; `vibing` for the chapter on agents, which names the habit of accepting code unread that its rules forbid; lifting a rule to core with its language's form, which names the language from above.
- **Why.** When a rule's first words name its chapter, where it goes is answered by reading it, and two rules about one thing meet in one file, where a duplicate shows.

## ADR-0164 — Core's clashes settled where they meet, and every rule that carries out another states its level

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** Three independent reviews of core agreed on what follows.
  - Levels: every rule that carries out another states its level, never looser; `blocks:check` reports one that states none, and an override lowers the one rule it names.
  - Clashes: two rules of one layer that disagree are a defect, and until it is amended the one naming the narrower case wins (`core.md`). The exception is written into the broader rule: a defect is caught to carry on only at the boundary of an optional part; the environment is read where the root's rules allow and a unit outside the domain writes diagnostics through the logging facade, both outside the ports; a test case's Arrange, Act and Assert are no sections to split; a property case states its invariant instead of a literal; a test reaches the engines it started on the loopback, and a unit case reads its fixtures; a surface's re-export gives a type no second home. How a block claims a resource the program shares with its host moves from `shared-resource-has-one-writer` to `core.md`.
  - Contracts: `contract-offers-a-caller-only-what-it-calls` becomes `contract-shaped-by-its-callers-role`, the operations one role of caller needs.
  - Agents: reading from an outside service needs no go-ahead, and a new module needs none either.
  - Chapters: `comments` keeps comments, documentation and the mark of deprecation; dead code goes to `code` and the use of a deprecated form to `relations`. `tidying-shipped-before-the-behaviour` moves to the base `changes`, and core's `workflow/changes` goes; `change-moves-a-file-never-rewrites-it` keeps only its meaning without commits, and version control's rules on one change and the passing check carry out core's.
  - New: `kept-collection-bounded` and `outside-input-bounded-before-it-is-parsed`.
  - The digest prints each chapter of core with its Governs line, written short.
- **Rejected.** A level taken from the parent, which the reader of a rule had to look up and an override carried down unseen; a contract cut per caller, which multiplies contracts that change together; renaming `comments` to `documentation` with the readme rules, which moved more than the misplaced rules; core's Governs lines printed whole, which pushed the block list of a large project past the 9,400 bytes a hook's context holds.
- **Why.** A rule read alone says how strongly it binds, and two rules of core that seem to clash state the exception in the rule that would otherwise forbid it, where a reader looks.

## ADR-0165 — A surface is the door of a module or a set of one kind, and core's second review

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** A second round of three reviews of core, read against rozumchik-web, settled these.
  - Surfaces: a module has a surface, its door, and a role folder, whose members are of one kind, has one; a layer folder, whose members lie on different sides of the boundaries the imports hold, has none, and neither has the source of an application (`surface-only-on-a-module-or-one-kind`). The kernel is such a layer: its role folders have surfaces and it has none, `#/kernel/errors` rather than `#/kernel`, and dependency-cruiser's `kernel-role-reached-through-its-surface` and import-linter's contract on `*.kernel.*.*` hold it; the source of an application has none either.
  - Adapters: an adapter imports the domain of the owner whose ports it implements — contracts, entities, value objects, errors — as hexagonal and clean architecture both have it.
  - Changes: a squashed change request is one commit, so a refactoring the task needs ships apart only when it reaches beyond the files the behaviour change touches, and the commit-level move and refactor rules of version control go. A format others read or that is stored changes in steps (`format-changed-in-steps`).
  - Bounds and stopping: outside input is bounded in size before it is read and in depth while it is parsed, in `security`; an outside read is bounded at MUST; a concurrent fan-out runs a set number at a time; a program told to stop finishes or cancels its work within a bound.
  - Wording: a comment may label a section, and `function-does-one-thing` drops its sign of sections opened by comments, which a test case's steps contradicted; a case asserts strict equality, a property case its invariant; a unit case reads only its golden files; the logging facade is the one global and needs no handing in; a sub-agent may read an outside service (`sub-agent-never-acts-on-a-live-system`); the line limit binds code the project writes; the data port and the command's load through it are SHOULD, as the split of reads and writes is; a contract lifts to the shared contracts and a shared type follows the kernel's own rules; a spec is found from its unit's path; `core.md` says an override lowers the one rule it names and drops "names first" from the chapter test.
- **Rejected.** A surface on every folder, which joins layers and isolated modules in one import; a surface at every layer but the kernel's role folders, the form ADR-0118 kept; a separate change request for every refactor and move, which a squash makes the only way to keep them apart and which small cleanups do not earn; exceptions that name another rule's case, which link two rules of one block.
- **Why.** A surface is where a caller may couple, so it sits only where coupling to the whole is safe; every other rule was made to read alone and agree with its neighbours.

## ADR-0166 — Core's third review: the seams of the second, and four gaps

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** A third round of three reviews graded core 8.3 to 8.6 and found the seams the second round left.
  - A file imports a file of its own folder directly and another folder of its module through that folder's surface; a module holds the layers or role folders it needs.
  - `contracts` is a role, a folder of ports at the top of the source or in a domain, so it has a surface.
  - A failure ends the program only at the handler of last resort; a clean stop and a success end it elsewhere.
  - The edge is defined once, in the layers chapter, as adapters, libs, the root, the entry files, the delivery layer and integrations.
  - A comment states what the code cannot show, or is one another rule asks for, and no other is kept.
  - A command returns no data, only its success or its expected failure.
  - A changed format reaches its readers before its writers.
  - New: `write-lands-whole`, `write-on-read-data-is-conditional`, `text-encoded-as-utf-8`, `outside-input-matched-in-linear-time`, `cryptographic-algorithm-approved-by-current-guidance`.
- **Rejected.** A comment rule that names the cases of other rules, which ties it to them; structured, correlated logs and tracing's globals in core, which belong to a domain of observability; a glossary in `core.md`, whose budget has no room.
- **Why.** A seam between two rules is closed where both are read, and the gaps that three reviews in a row named are the ones core's other rules already assume.

## ADR-0167 — The domain layer re-cut: an abstract API, HTTP apart, and one area per domain

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** Three independent reviews of the domain layer (7, 7 and 7 of 10) settled its cut; each domain holds one area, and what needs two lives in a seam.
  - The API: `_api`, abstract, holds what every style of API shares — failures, contract, limits, collections, requests, values in JSON — and `rest-api` and `mcp-api` extend it; a style with no block is a local block that extends it. HTTP is a domain of its own, `http-server` — methods, origins, bodies, caching, TLS — which `rest-api` requires and a tool server over HTTP meets in `mcp-api/with/http-server.md`. A style's rules bind only the operations it serves. NestJS requires `_api`, FastAPI `rest-api`, FastMCP `mcp-api`.
  - Renamed: `consent` is `privacy` and gains the opt-out signal and the person's rights over their data; `logging` is again `observability`, with logs, traces and metrics; `document` is `config-file`, since core's "document" is prose. `design-system` leaves `ui` and requires it, so a product on another's kit lists `ui` alone. `unreliable-network` folds into `remote-service`, which now also holds what other systems push, its webhooks; `remote-data` requires `remote-service`, and `convergence` requires `config-file`. `analytics` meets privacy through `with/privacy.md`, so measurement the law exempts carries no consent machinery.
  - Rules made one meaning each, numbers no standard fixes left to the project, Requirements for implementation that only restated a rule removed, and arrows that inverted or skipped their parent re-pointed. A commit's footer holds trailers; a branch name may hold digits, and stays `feature/`, `fix/` or `hotfix/` until the release automation reads a commit's type instead.
  - New rules: authentication by NIST SP 800-63B-4 — passwords judged by length and breach lists, a memory-hard hash, passkeys offered, recovery no weaker than sign-in, no account existence revealed; fields filtered by the caller's rights; isolation of direction and the reader's zone in i18n; WCAG 2.2's focus not obscured and a single-pointer alternative to dragging; the opt-out signal, retention, export and erasure; trace context propagated and metric labels bounded; backups restored; an SBOM and a private channel for vulnerabilities.
  - Moved to tools: a placeholder commit subject to lefthook, updates by a bot to renovate, the settings of the forge to a future `github` block.
  - Convergence's chapter on engines leaves for the local block of the program that drives them, with mise's rule that put them on the path, and a distributed unit's name is left to taste.
  - A second round of three reviews graded the re-cut 8 of 10 and settled its clashes: the origin check passes a request no browser sent; a public answer without credentials may allow any origin; a protocol's session id is no credential, a cookie session is; analytics sends no data that names a person, and its pseudonymous identifier follows consent; `401` and `403` are HTTP's, beside an object answered as not found; a session's absolute limit is at least twenty hours unless essential, as WCAG 2.2.1 allows; a restore re-applies erasures; `If-Match` is required with `428`; an audit record kept for security, in core, holds the identifier and the address its event needs. New: a client's address only from a trusted proxy, a time bound on reading a request, spans and the rate, errors and duration of what a program serves, re-authentication before a sensitive change, keys the program issues, data minimisation and correction, outbound certificates verified, signed webhooks the program sends, and information never asked twice.
  - Read against rozumchik-web, the third pass placed the authoring of a kit of primitives in `design-system`, let screens and widgets — never components — consume binding units, checked access at an operation's entry point, gave a changed MCP tool a new name and an open enumeration a string in its schema, let a command line's code map hold a code for a plan that found changes, kept a convergence's declared state out of its flags, signed release tags, and gave a log level one meaning.
  - Two domains join: `messaging`, a program that publishes or consumes messages, jobs and scheduled work through a broker or a queue — a stable identity and a machine-readable contract per message, a publish confirmed by the broker, processing once in effect and acknowledgement after the work, bounded and dead-lettered retries, one run per tick, and its delivery layer `consumers/` and `jobs/` — meeting `owned-data` for the outbox and the inbox and `observability` for traces and lag; and `language-model`, a program that prompts models and acts on their output — pinned snapshots, prompts as code that never stand in for a control, untrusted text kept as content, outputs parsed by the program's schema and used only when finished, tools narrowed to the task and consequential calls approved by their person, budgets per call, run and caller, retrieval scoped to the caller's rights, evals as the gate of a change, and the model behind a port of its task. Both require nothing: a broker or a model may be an engine the project runs itself. Read against utm-api, rozumchik-gateway-api and rozumchik-ecosystem-api, the experts' practice prevails where theirs differs: an outbox over a publish after commit, bounded retries, a lease longer than the handler, a stable model in production.
  - A third round of three reviews graded the layer 8.5 and settled what kept it from 9. A message refused by a rule of the domain is acknowledged as handled and its outcome recorded, and one naming what has not arrived yet is retried; only an unreadable message, an unknown type and a defect go to dead letters. `messaging` covers scheduled jobs with or without a broker, and a business process compensated step by step moves to core's effects, since it names no message. `401` and `403` are two sentences; an MCP answer is bounded by a number the project sets; a breaking change ships beside what was released, as a new version or a new name; a session's absolute limit shorter than twenty hours is one a standard sets or ends in a sign-in that keeps the input; a password may be hashed by PBKDF2 where only FIPS 140's functions may run; an agent with no person present acts only within a standing grant and with a service identity scoped to its task; the inventory of personal data is a MUST, since erasure stands on it. New: a request for a person's rights verified first, a refresh token rotated or bound, an outside identity linked by issuer and subject, `Vary` for what an answer reads, the program's own origin from configuration, WebSocket origins checked, span attributes masked like logs, migrations applied once and without long locks, the client cache cleared with the session, outside tool definitions pinned, model answer caches keyed by the caller's rights, a contribution's CI without secrets, a version published only by a run, an exploited vulnerability reported in time, contrast in `ui` for a product on another's kit, a message's acting identity and its retention in the broker.
  - Rejected in that round: scheduled jobs as a domain of their own, since their rules bind only a program that lists them and a cron without a broker shares the area; page numbers beside the opaque cursor, which Google's AIP-158 and the experts keep out of a list that grows, though utm-api's admin lists use them; an opaque user identifier of the program's own in analytics after consent, since the library's pseudonymous one measures the same and leaves nothing a third party can join to the person.
  - A fourth round graded the layer 9, 8.8 and 8.8 and closed what the third left behind: the masks of logs and spans match a key by its words, so `input_tokens` passes and `refreshToken` does not; the origin checks bind only what the browser attaches itself, so an API authenticated by a token in its headers serves any origin; a cache of one person's remote data and a session ended by a failed call are a client's; an apply locks its target as a conditional write; an unattended agent sends only to the addresses its grant names; a version is published only by a run; a person corrects their data and is told of a breach in time; a privileged account signs in with a phishing-resistant factor, and a changed credential ends the other sessions. MCP follows its 2026-07-28 revision: no session id, a `requestState` verified when it returns, a long call answered with a task, a composed schema closed by `unevaluatedProperties`, and a provider's `iss` checked.
  - A fifth round graded the layer 9.0, 8.9 and 8.9 and closed the seams the fourth opened: personal data reaches a listed recipient, a processor or a controller with a legal basis of its own, and crosses a border only under a transfer the law allows; an unattended agent sends only to the addresses its grant names; a log key is masked when it holds a listed name's words in order; the origin check covers signing in; a socket answers any origin unless the browser attaches its credentials; an uploaded file is never rendered from the program's origin; a webhook's signature covers its timestamp, and a sender that signs nothing is read back; a disabled account or a revoked right takes effect on the next request; a privileged sign-in through a provider is checked by its `acr` or `amr`; owned data is backed up as a MUST; the root chooses the active analytics sinks; a unit's first version may be published by a person with a second factor.
  - A sixth round graded the layer 9.0, 8.9 and 8.9 and closed the seams the fifth opened: the inventory records each purpose's legal basis, its recipients and its regions, and a notice follows it; an erasure is passed on to the recipients; a webhook is signed over its identifier, its time and its body on both ends, and a sender that signs no time is refused a repeat; a revoked right is read from the store on the next request that needs it, while a disabled account ends its sessions; the answer of an identity provider passes the origin check its `state` guards; an upload is served from another registrable domain or sandboxed; a model's provider is a recipient like any other, under privacy's listed recipients alone; a screen declares its language; owned data is encrypted at rest and reached over verified TLS.
  - A seventh round graded the layer 9.0, 9.0 and 9.0, and core 8.9, 8.9 and 8.9, which ended the rounds; its convergent residue closed in a sentence each: an agent holding untrusted content and private data writes nowhere more public than that data; the edge is again the outer ring alone; a transient failure stays expected once its retries are spent; a revoked right leaves the next token, and an access token lives minutes; a call to another system runs over TLS; a webhook's repeat is recognised by what its signature covers and acknowledged; the inventory lists what the program passes on, not only what it stores.
  - The three questions that place a rule move from `core.md` to core's chapter `placement`, read when a rule is written, so every session's digest keeps its room for the blocks a project lists.
- **Rejected.** A concrete `api` that the styles require, which lets a project list the base, forget its style and lose the style's rules unseen; one `api` with a chapter per protocol, the conditional sections ADR-0005 rejected; HTTP's rules in the base, which bind a tool server over standard input for nothing; `privacy` without opt-out and rights, which models one region's law; `analytics` requiring consent, which forced consent's MUSTs on products that never ask; `model-tools` as the name of the tool server's domain, whose rules are MCP's throughout.
- **Why.** A domain is an area a product has or lacks; when each holds one area and the seams hold what two share, a project lists what it is and gets exactly the rules that bind it.

## ADR-0168 — Core's fourth review: one meaning per word, and the gaps of agents

**Date:** 2026-10-08 · **Status:** Accepted

- **Decision.** A fourth round of three reviews graded core 8.6, 8.6 and 8.6, with the owner's settled concepts held fixed, and its findings are closed inside them.
  - One meaning per word: the axis of any team is the base, never the root; a package's published entry is what keeps an export alive; files and modules alike form no cycle; an open set is one whose members bring their own code, and a set the logic decides on is closed; an instant is an exact time in UTC or with its offset, and a duration is read from a monotonic clock.
  - Clashes closed: a forwarding unit stays where it is a surface's re-export or a seam at a boundary; an implementation promises no less than its contract, as a MUST; a vulnerability may be accepted by name with its reason and a review date; an address whose hosts cannot be known is reached only when it resolves to a public one; a contract suite runs against a real implementation where its engine runs in the sandbox; composition gets a spec where it derives a fact; the meaning-free pieces the domain needs, the base error among them, live in the kernel; the diagnostics facades, tracing's and metrics' included, are the one global state.
  - The strict canon for adapters: an adapter is imported only by the composition root and by specs, and every other unit receives it through its port. rozumchik-web's binding units, which import their feature's adapter and assign it to the port's type, move to receiving it from the root.
  - An enumeration in a contract another program reads is declared extensible in core, and its readers settle a value they do not know; `_api` and `messaging` no longer state it apart, and each style keeps only its own form.
  - New: a check of access or trust fails closed; state concurrent work reaches is owned by one task or guarded by one lock; no outside call per item of a loop; a reusable pipeline step is pinned by its digest; a choice between real alternatives is recorded with what was rejected; an agent never holds untrusted content, private data and an unchecked way out at once; an agent with no person present acts within a standing grant; a person reads an agent's change before submitting it.
  - A fifth round graded core 8.8, 8.8 and 8.8 and closed what the fourth left: the root and the entry files reach a feature's adapter through the adapter's own surface, which a feature's surface never offers, and dependency-cruiser and import-linter hold it alike, with NestJS's feature modules handed their adapters by the root's; an override leaves the rules that carry out its rule at their own levels; an open set is one of interchangeable members; an enumeration the program writes is extensible, one it reads maps the unknown to a member every branch names, and one in a request stays closed; a URL may carry a token made for it; a merge a pipeline deploys from confirms its run; state shared in memory may change by atomic operations; consent may be given in advance by a standing grant, a base rule, so the workflow axis loosens nothing; an agent's context holds no secret; a change to a trust boundary names its threats; a tidying keeps the specs of its boundaries.
  - A sixth round graded core 8.9, 8.9 and 8.9 and closed the seams the fifth opened: an adapter is imported by the root, the surface of a package that offers it and specs, the entry files included in neither preset; a standing grant is defined once, as an entry of the project's agent settings, and an agent never widens its own limits; a tidying lets a spec follow a boundary it renames or moves; a secret and personal data are two sentences, an identifier that names a record carrying no personal data; a set is open when its members share one contract; a transient failure is expected by its retrier; the domain's handled failure is logged by its caller; the typed scope the root fills is no service locator; a dependency's provenance is verified where its registry publishes it.
- **Rejected.** Letting the domain import a lib without effects, which reopens the layer matrix for what the kernel already holds; lowering 100 percent coverage and mutation, which the owner keeps; `version-control` in core, since a project may exist as code with no version control — a snippet, an archive, an export — so history is an aspect it may lack.
- **Why.** A word with two meanings lets two readers keep one rule two ways, and the gaps closed are those an agent at work in 2026 meets first.

## ADR-0169 — The contexts layer re-cut: a server platform, one layout for every language, and markdown and shell

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** Three researches of the contexts layer (graded 7.2) and three independent answers to each of the owner's three open questions re-cut the layer.
  - `server` joins the platforms, equal to `cli`, `browser` and `mobile`: a long-running process a host starts, routes to, restarts and stops — its probes, its stop, nothing kept that another copy needs, its configuration and secrets from the host, its log as a stream — with its own architecture axis and seams with `http-server`, `messaging`, `owned-data` and `observability`. A program that serves and renders its own pages lists `browser` and `server`, and what only the pair means lives in `browser/with/server.md` and its architecture twin.
  - A language or a platform names its sections after core's chapters on its axis, in core's order, and a seam after the other block's; a rule that tightens another sits in the section named like its parent's chapter, which `blocks:check` now holds. A language has a block of its own once three rules need it and no tool.
  - `markdown` and `shell` join the languages; `yaml` gains its hazards, and writes every collection in block style. TypeScript is written as ES modules only, a package others import declares its exports' types for isolated declarations, and a brand is the `unique symbol` form; its `enum` stays, split into rules of one meaning. No slug opens with `no-`.
  - A server reads a secret from a file its host mounts or with its host's identity, and from the environment only where the host offers no other way; a child process gets an environment built for it. Core gains that a secret is never a process's argument; `distribution` gains the runtime floor's support window, a check on every supported runtime and a floor raised only in a minor; `messaging` gains a consumer that takes no message once told to stop.
- **Rejected.** A `web`, `fullstack` or `ssr` platform, which names a pair of runtimes and multiplies with every pair; `worker` and `container` as platforms — the first is `server` with `messaging`, the second packaging, whose rules are `docker`'s; a layout of the languages' own, a second vocabulary for core's chapters that let one section grow into a catch-all; secrets from the environment as the norm, which every inspect, child process and crash dump reads; TypeScript's `as const` objects in place of `enum` and an erasable-syntax rule, which the owner rejected because his programs rely on `enum`.
- **Why.** A platform is a runtime a rule loses its meaning without, a language a syntax, and a layout shared with core lets a reader, an agent and a check find every language's form of a rule where core keeps it.

## ADR-0170 — Core, the domains and the contexts after their eighth review

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** Nine independent reviews of the three layers after ADR-0169, three per layer, and a placement review agreed on what follows.
  - Core: a transient failure is only named expected, and `failure-retried-only-when-transient` alone says who retries it — the code nearest the call, once — and what reaches the caller after. A secret reaches a process by any way no other user of the machine reads, a store the process reads included. The trifecta's way out, the consent a request gives for the action it names, a logger whose sink may be a standard stream, the deployment a reviewed change sets off, and the tools production code never imports are each one sentence. `placement` lists core's chapters in their order; a language's rules wait for their block in the project's local block, never in a domain; a language or a platform outgrowing one file splits into chapter files, and a rule whose parent sits in a language or a platform takes the section that parent sits in, both held by `blocks:check`. What two adapters share with an effect lives in libs; a contract one feature meets through another's surface is implemented in `composition/` from its first use; an end-to-end case repeats Act and Assert per step. New: `child-process-environment-built-for-it`, lifted from `server`, and `outside-path-confined-to-its-root`.
  - Domains: a revoked right is read from the store by every session and key the server keeps (`access-change-reaches-every-session-and-token`); a runtime floor is never raised in a patch, and in a minor only where the resolver skips a release the consumer's runtime cannot run, so TypeScript raises `engines` only in a major; a unit is checked on each release line its runtime's maintainers support; a TLS proxy on the host may verify for the program; a webhook's repeat is known for as long as the sender may redeliver; a config file may name a file its host mounts; http-server's personal answer is never cached by a rule given to a shared cache.
  - Contexts: TypeScript gains the floating promise, `const enum`, the shell-less process, the path checked by `path.relative`, the child's own `env` and the timing-safe comparison, and polyfills any missing built-in at the entry; its Types become a chapter file, and `domain-type-fields-readonly`, a repeat of `business-types-readonly`, goes. Python's port is a `Protocol` on the architecture axis. Shell quotes the right side of `[[ == ]]`, says `local` is Bash's and binds shell wherever it is written. Markdown's headings are unique among siblings. CSS's specificity holds within one cascade layer and its features beyond the target sit behind `@supports`, which the browser part of Biome's preset holds. Browser's strict policy allows a script only by nonce or hash, its anchored popover falls back behind `@supports`, and its rendering server only delivers where the API is another program. The CLI takes a secret from the environment where its caller offers nothing else, keeps its exit codes and ends quietly on a closed pipe. The server runs unprivileged and bounds its work in flight; the mobile app keeps personal data in the protected class.
- **Rejected.** A retry required wherever a transient failure is met, which retried at every level and clashed with the idempotency rule; a secret's channels listed closed, which the CLI's credential store and the server's workload identity stepped outside; a language's rules waiting in a domain, which bound every project of the domain to a language it may not use; a floor raised in a minor for every registry, which npm's resolver ignores.
- **Why.** The reviews found clashes between a rule and the rules that carry it out, and a few rules that stated the same thing twice; each is closed where a reader of the rule looks, without re-cutting a layer or an axis.

## ADR-0171 — Core, the domains and the contexts after their ninth review

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** Nine independent reviews, three per layer, and a placement review agreed on what follows.
  - Core: a path is confined by its real path, every link followed, in one rule only; a failure is retried at one level — the code nearest the call, or a broker or a scheduler that runs the whole unit of work again; consent lives in one base rule that every rule asking for it reads, and never carries over; a catch-all is allowed at the handler of last resort; a rotated secret is read again through its declared name. New: `artefact-built-once-for-every-environment`, which the server and browser rules carry out, `production-code-imports-no-tool`, split from the pinning of tools, and `outside-input-parsed-without-external-references`. An enumeration's reader and request halves join the rules that already held them. `effects-held-only-by-the-edge` is held by dependency-cruiser's `effects-reached-only-from-the-edge` and by python-check, and a role folder reaches a sibling's surface by `domain-role-` and `kernel-role-reaches-a-sibling-through-its-surface`.
  - No slug opens with `no-`, which `blocks:check` now refuses; the fourteen left in the implementations say what holds.
  - Domains: a refresh token is rotated or bound for a public client; `403` and the protective defaults of privacy are rules of their own; a failed optimistic write undoes only its own change; an answer's enumeration lists its known values in `examples`, as Zalando's rule 112 now does; the config file's seams with zod, pydantic and yaml-js leave `convergence`; Lingui's check holds the source catalog, so a translation may still follow. New: an alert on what users feel, a value typed parsed by its locale, an impact assessment before high-risk processing, sanitised markup from a model, and secrets kept as references in a convergence run's work folder.
  - Contexts: TypeScript's path check takes the real path, its secret comparison compares digests, a type-only import leaves no empty import, and `#/` is rewritten below the Node.js lines that resolve it; Python gains an `IntEnum` for outside number sets; shell binds embedded commands only by quoting, input and tracing; CSS's id rule no longer bans type selectors; YAML lets a format's own keys stand bare; the CLI's codes follow 128 plus the signal; the mobile app names its file protection class and verifies code it receives over the air.
- **Rejected.** A retry forbidden above the nearest call, which redelivery of a message breaks; strict compilation of every locale, which forbids the translations the i18n domain lets follow; an `x-extensible-enum` kept as the norm after its own guideline moved to `examples`.
- **Why.** The reviews found a duplicate the last round left, two clashes between a rule and the redelivery or rotation that carry it out, and a strong rule no tool held; each is closed where its reader looks.

## ADR-0172 — Core, the domains and the contexts after their tenth review

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** The tenth round graded every layer at least 8.9 with every reviewer; what two or three of them found is closed.
  - Core: markup to render may pass a sanitiser that keeps only what is allowed; a program stops taking work once nothing routes work to it; the logging facade is open to units outside the domain and the environment to the root alone; the base's errors read "At the entries", leaving "edge" to the tree; the consent rule is the agent's, and the rules that ask for it say "consent"; `one-artefact-serves-every-environment` replaces the built-once rule, so a release's travel stays out of the base. TypeScript's `IO` gains `sqlite`, `process`, `timers`, `perf_hooks`, `module` and `vm`, and Bun's own modules move to the bun part; python-check's effect modules gain `multiprocessing` and the rest, and leave `uuid`, `urllib` and `http`, whose types are pure, as `pathlib` stays out for its `Path`; python-check refuses an import past a role folder's or a sibling module's surface, as TypeScript does; both presets keep `kernel`, `shared` and `composition` from being imported as layer folders; dependency-cruiser's development-dependency check holds `production-code-imports-no-tool`.
  - Domains: focus is trapped only by a modal layer; a streamed answer stays out of live regions and a status announces it; sign-out refuses a store-free token at its expiry; a retired part and an unread message version may be removed; a migration runs once only for a shared store; a read may suspend to a boundary; an address is reached only if public; a package's published props stay; only a schema failure is asked again; an impact assessment binds where the law asks; a webhook's timestamp is checked where signed; `cache-undoes-only-the-failed-writes-change`; trace ids from pino and structlog are taken only from trusted callers.
  - Contexts: a package others install ships no `#/` specifier; Python resolves the root it confines a path to; text is clipped by no box but one visually hidden; sh uses `pipefail` where it has it; `component-reaches-no-io-global`.
- **Rejected.** A list of effect modules that flags a pure type such as `uuid.UUID`; trapping focus in every layer, which a tooltip or a combobox must not do.
- **Why.** Each fix closes a clash between a rule and the rules that carry it out, or a rule no tool held although one can.

## ADR-0173 — A domain or a platform governs the whole unit, and the config file is parsed at the edge

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** Two answers of the owner.
  - Every domain and every platform governs `**`, every file of the unit that lists it, as core does. Before, they governed only the globs of the blocks that bring them in, so `/check` never reviewed a server's `root/` against `server`, a browser program's headers against `browser`, or a command line's entry against `cli`, whose own glob held only `cli/`. A language governs the files written in it and a tool's block the files it configures, as before.
  - The config file is parsed at the edge: `config-file-parsed-by-its-adapter` puts its schema, and the parsing library, in the adapter that reads the file, which maps the result to `config-file-type-declared-with-its-port`, a type of the program's own in the top-level `contracts/` beside the port, since an adapter may not import `composition/`. zod's home in `composition/` goes, with its dependency-cruiser setting, and pydantic needs none; both languages now read the config file the same way.
- **Rejected.** Globs for each domain and platform, such as `**/root/**` for a server, which miss a file the moment a tree names its folders otherwise and bind a rule to a folder's name; a parsing library in `composition/`, the exception ADR-0086 gave zod, which leaves a vendor below the edge — Seemann's composition root, Cosmic Python's validation at the edge and Clean Architecture all keep the format of outside input at the edge.
- **Why.** A kind of program holds for every file of it, and the edge is where a format is known.

## ADR-0174 — Core, the domains and the contexts after their eleventh review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** The eleventh round graded core 8.9 by every reviewer, the domains 8.9 to 9.0 and the contexts 8.8 to 9.0; the owner asked for what weighs to be closed on every layer.
  - Effects reached without an import are held by tools: Biome's core architecture part denies the globals of input and output, storage and `performance` outside the edge — and, in the bun part, `bun-global-reached-only-from-the-edge` the calls through the `Bun` global — and its plugin `effects-held-only-by-the-edge` the calls that read the clock or draw randomness and identifiers — `Date.now()`, `new Date()` with no argument, `Math.random()`, `crypto.randomUUID()`; python-check refuses an effectful name of a pure module — `urllib.request`, `uuid.uuid4`, `datetime.now()`, `open()`. Ruff's codes that already held core rules are bound to them.
  - Core: a unit of work a broker or a scheduler runs again is not also retried by the code nearest the call; a time a person sets in a place is kept as its wall time with its zone; `process-runs-with-only-the-rights-its-job-needs` is new, and the server's unprivileged process carries it out; one artefact serves a program its host runs or serves; a secret encrypted to a key the repository holds counts as revealed; a log line takes outside input only as a parameter; the agent's consequential change and its project-wide permissions move to the base; "tool" keeps one meaning and "component" leaves core.
  - Domains: `consent-given-per-purpose-never-preselected`; `public-repository-offers-private-reporting`; the config file's adapter resolves its references through a resolver the root hands it; a consumer-owned dependency is a peer only where the ecosystem has peers; a model's read is free of approval only from an address the program chose; a committed generated file is one a fresh clone's check needs; a read that replaces the cache cancels the one in flight, any other joins it; ky gets a home in `shared/` for its failure mapper, as httpx2 has.
  - Contexts: shell passes a secret only to the command that reads it and keeps embedded commands short; CSS spares a published package's classes and allows fluid type in `rem`; a mobile sign-in's answer may come back through the provider's scheme inside the system's session, the per-app language ranks first, and its TLS rule carries out remote-service's; Python mirrors the import package under its spec folders and needs no `typing_extensions` for a sentinel; TypeScript's peer range names its majors.
- **Rejected.** Denying timers in the application layer, whose binding units debounce with them; flagging `uuid.UUID`, `http.HTTPStatus` or `pathlib.Path`, whose types are pure.
- **Why.** The strongest architecture rule was held by prose where tools could hold it, and each other fix closes a clash between a rule and the rules or the tools that carry it out.

## ADR-0175 — Names: antonyms in pairs, and a member never repeats its owner

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** Core's `names` gains two SHOULD rules the owner accepted from Vitaly Friedman's naming guide and the naming cheatsheet it links: `opposite-acts-named-by-a-verb-and-its-antonym` — `add` and `remove`, `create` and `delete`, `open` and `close` — and `member-name-never-repeats-its-owner` — `MenuItem.onClick`, not `MenuItem.onMenuItemClick`.
- **Rejected.** A name a module exports cut down to its verb, `list` in `orders`, which is read without the module wherever it is imported; component tokens in the token grammar, as Intuit's and Vodafone's taxonomies allow, which `token-never-named-after-a-component` refuses on purpose.
- **Why.** Clean Code's consistent antonyms and the cheatsheet's rule against duplicated context make a name say only what its place does not.

## ADR-0176 — Core, the domains and the contexts after their twelfth review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** The twelfth round graded core 8.9, the domains 9.0 and the contexts 8.9 with every reviewer; what weighs is closed on every layer, and the domains, at 9.0, leave the reviews.
  - Effects outside the edge are held further by the tools: Biome denies the `process` global and catches `Date()`, `randomUUID`, `randomBytes` and `randomInt`; python-check refuses `uuid6` to `uuid8`, the standard streams, `sys.argv` and `sys.exit`, and asyncio's processes and sockets, read as attributes as well as imports. ui's components keep core's whole list where `shared/` meets them.
  - Core: a program runs with only the rights its job needs, the server keeping the rest; a binding form made to test the value it binds, a binding unit's own timer and the delay the other side asks for each stand where the rule would otherwise forbid them; a framework's container alone may wire, and only where its block brings one; `placement` speaks in five sentences.
  - Domains: the broker's and the store's TLS verify the name; a peer range stands beside one version; a time set in a place travels with its zone; a distributed unit names its private intake; a rotated secret resolves again; MCP's caller-shaped results are cached privately; `event-names-no-person`.
  - Contexts: Android keeps a token encrypted by a Keystore key; the chosen theme narrows `color-scheme`; shell traps `TERM` in sh, starts what must not see its environment under `env -i`, and keeps embedded commands short as a rule; Python names `encoding='utf-8'` on every floor; TypeScript sorts text by a collator; a bearer-token API in the browser asks for a server of the program's own.
- **Rejected.** Making `node:crypto` an effect module, which would forbid a pure hash in the domain; `pathlib` among the effects, whose `Path` is a value.
- **Why.** Each fix closes a clash between a rule and the rule, the platform or the tool that carries it out.

## ADR-0177 — Core and the contexts after their thirteenth review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** The thirteenth round graded core and the contexts 8.9 with every reviewer; what they agreed on is closed, and the domains stay out of the reviews.
  - Effects outside the edge are held further by the tools: dependency-cruiser refuses every effect module of Node's and a delivery folder reached from below the edge; Biome denies the browser's stores and sockets outside the edge and catches the clock, `Math.random`, key generation and `Temporal.Now`; python-check refuses the effect modules and names of the standard library, a name imported from such a module, and an import of a module's own surface from inside it, while a package still reads its own data through `importlib.resources`.
  - Core: a retry's safety binds and its backoff stays a SHOULD; a credential's least privilege binds and its documentation and lifetime stay a SHOULD; the declared registry and the split of reads from writes bind, and one semantic unit to a file is a SHOULD; the remote service's rule that a call takes the time its caller has left rises to core, since every call across a process boundary has a timeout; an identifier from outside is normalised before it is compared; text for machines ignores the locale; a standard stream has one writer per kind of record.
  - Contexts: a format's rules that bind code reach it through a seam of the code's language — TypeScript and Python with YAML, one seam rule to each YAML rule it carries out, TypeScript with CSS and with shell, YAML with shell; the Markdown renderer's rule leaves, its subject being a program's output and not a Markdown file; a file name a framework reads keeps its spelling; TypeScript keeps synchronous input and output off the request path; Python's unpickling list names every object-building loader; the mobile release, attestation and backup rules each say one thing.
- **Rejected.** Moving `one-artefact-serves-every-environment` into `code`, where no section holds it and its children lose their chapter; a parent in YAML's seam for the package scripts, which TypeScript's seam with shell does not need.
- **Why.** Each fix closes a gap the reviewers agreed on: a rule a tool could hold but did not, a level looser than the harm, or a rule whose files never held the code it binds.

## ADR-0178 — Core and the contexts after their fourteenth review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** The fourteenth round graded core 8.7, 8.7 and 8.6 and the contexts 8.7, 8.8 and 8.8; what two reviewers or more found, and each fact a reviewer proved by running the tool, is closed.
  - The edge is the folders that may hold effects and import any package, and the chapter on layers opens with the inward order. A unit outside the edge reaches no effect through a lib either: dependency-cruiser follows the imports to the runtime's effect modules, and import-linter's `effects-held-only-by-the-edge` contract to the standard library's. A timer is held to the edge and the binding units — Biome by a TypeScript rule's plugin, python-check by `asyncio.sleep` and `threading.Timer` — and python-check refuses a read of the environment at the edge outside the root.
  - A generated file has no line limit, of a file or of a function, in core and in either language, and a function that returns one data literal lifts its own by Biome's suppression or python-check's reasoned comment.
  - Core: a function that answers changes nothing, and depends only on its input where it receives no dependency; the time reaches it as input or through a dependency it receives. A test run writes the snapshots and golden files it was told to update. A type lifts as any code does, at the same level; a set with one member is not yet open. The writer a block brings for a shared resource is claimed in that rule, not in the precedence. Integration specs stay out of the coverage gate. A supervisor may restart the work a defect broke. "Live system", "committed" and the decorator pattern are said once and plainly, and "entry" keeps the senses of a package's entry and a way in.
  - Contexts: Python's YAML seam carries each YAML rule that binds code, by a YAML 1.2 loader and by refusing an alias, since no Python loader bounds them; Python runs no text as code, keeps a synchronous call's `timeout=`, types an exact quantity by its unit, and makes an owned enumeration a `StrEnum` at the level TypeScript does. TypeScript changes no module-level value, awaits a returned promise inside a `using` scope, and reads `.mts` and `.cts`. A shell script logs through one function and unsets the secret it received. A rendering server may keep the tokens in a session store of its own. Markdown governs `.markdown`.
- **Rejected.** Folding Bun's reading of `#/` into the TypeScript block, which names no runtime; lowering `case-split-by-arrange-act-assert-comments`, which the owner's specs follow everywhere, until he decides it; widening the TypeScript block to `.js` files, which only tools' configuration uses.
- **Why.** Each fix closes a rule that contradicted another, a tool that held less than its rule, or a fact the tools disproved.

## ADR-0179 — Core and the contexts after their fifteenth review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** The fifteenth round, briefed as the thirteenth, graded core 8.8, 8.9 and 8.9 and the contexts 8.9, 8.9 and 8.8; what two reviewers or more found, and each defect a reviewer reproduced, is closed.
  - The tools: dependency-cruiser follows a lib to Bun's modules as it does to Node's, lets the package's surface offer an adapter, and leaves `node:timers` to the timer rule, which allows a binding unit's; its rule on the domain is named for the contracts it allows. import-linter protects Python's entry file. yamllint refuses an unused anchor and an octal value, and its bindings name what it holds.
  - Core: a supervisor catches as an optional part's boundary does; a transient failure is one the same request may not meet again; a function that answers depends on its input and on the dependencies it is handed, and the time reaches it through either; text for machines is independent of the locale at MUST; the coverage gate counts the unit specs alone, and a unit of the root other than the wiring is a boundary; choosing a member of an open set the root handed in is receiving, while asking a registry for a dependency is not; a forwarder stays only as a re-export or a seam that implements a contract; a component and a derived value are named for what they return; a second request to stop may end a program at once; a lock may be held across one call that has a timeout; the inward order is written whole; a credential's documentation and its life are two rules; a screen's failure is an optional part's.
  - Contexts: Python reads YAML by ruamel's pure loader with dates kept as text, makes an owned closed set a `StrEnum`, logs outside input as a field the formatter encodes, and lets a supervisor catch broadly. TypeScript keeps every module binding `const`, compares an object-shaped brand by `equals<Name>`, and awaits a promise returned inside a `using` scope. Shell declares `local` apart from the assignment. A touch target is 44 points on iOS and 48 dp on Android; a consumer retrying its broker is alive; a breakpoint in a media query repeats the theme's.
- **Rejected.** Counting integration specs toward the coverage gate for an adapter over an owned engine, which changes the gate the owner keeps; tool blocks for shell and Markdown in this round, which belong to the implementations layer.
- **Why.** Each fix closes a clash between two rules, a tool that held less than its rule, or a fact the tools disproved.

## ADR-0180 — No list of a runtime's members, and the sections of a case held by review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** No tool refuses the `Bun` global outside the edge: `bun-global-reached-only-from-the-edge` and its GritQL plugin go. A call through it that reaches an effect — `Bun.file`, `Bun.spawn` — is still refused by core's `effects-held-only-by-the-edge`, and a reviewer holds it; a pure one — `Bun.deepEquals`, `Bun.hash` — is allowed, as `node:util` is. `case-split-by-arrange-act-assert-comments` stays a MUST that a reviewer holds.
- **Rejected.** Refusing every member of `Bun`, which forbade its pure helpers that Node's own modules are allowed; a list of the pure members allowed, or of the effectful ones refused, which must follow every release of the runtime; a check of a case's comments, a parser of comments for each language that costs more than a reviewer's look at a case.
- **Why.** A list of a runtime's members goes stale with each release and needs keeping for little gain, and a rule a reviewer holds at a glance is not worth the complexity of a check.

## ADR-0181 — Core and the contexts after their sixteenth review

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** The sixteenth round graded core 8.9, 8.8 and 8.8 and the contexts 8.9 with every reviewer; what two reviewers or more found is closed.
  - Core: a tool holds a rule where its gain repays its cost, and a decision records a rule left to review; test code — a spec, a fake, a contract suite, fixtures — has no line limit, as both tools read it, and a contract suite is a kind of file, `<contract>.suite`; the delivery layer's own wiring is the one import of the root the inward order allows, and integrations stand beside the entry files; the domain may import the standard library's parts that hold no effect; a transient failure is one the same request might not meet again, defined once; a supervisor starts its worker again, never the unit of work that failed; a user interface, not each screen, has a handler of last resort; two slugs now say what their statements hold, `type-lives-beside-the-signature-that-introduces-it` and `function-answers-from-its-input-and-handed-dependencies`.
  - Tools: dependency-cruiser refuses only the `bun:` modules, and the `bun` module's pure helpers stand as the global's do; a vendor's package a lib wraps is left to a reviewer in both languages, the tools following only the runtime's own effects.
  - Contexts: TypeScript's module-level variables are `const` in one rule, save the diagnostics facades, and its plugin, named for that rule, refuses a module-level `let` or `var` whether exported or not; a spec's setup that its hooks set for each case is no state of the program, so specs stand outside the plugin; Python keeps an arriving number an `int` until compared, logs outside input only as an `extra=` field, and names `torch.load` with `weights_only=False`; a value a CI runner substitutes reaches a command only through the environment; an embedded command and a package script double-quote their expansions as a rule of their own; a script exports only what its commands read, as a rule of its own; `local` stands apart from a command substitution; pytest's fixtures and core's are told apart; zod checks an invariant before it brands; ui allows a breakpoint repeated where a token cannot be read.
- **Rejected.** Counting a vendor's package reached through a lib by a reachable rule to every package, which needs the homes of all packages in one more place; narrowing the tools' line limits to spec files, which would bind the fakes and fixtures the owner's tests share.
- **Why.** Each fix closes a clash between two rules, a slug that said less than its rule, or a tool that held more or less than its rule.

## ADR-0182 — Core and the contexts after their seventeenth review

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** The seventeenth round graded core 8.9 with every reviewer and the contexts 9.0, 8.9 and 8.9; what two reviewers or more found is closed.
  - Core: the kernel and a contract, like the domain, may use the parts of the standard library that hold no effect, and dependency-cruiser no longer refuses a pure built-in of the runtime in them; where a defect may be caught is said once, in the catch rule, a supervisor starting its worker again and never the unit of work that failed; a transient failure counts a model's answer that fails its schema; a path is opened beneath its root where another writer can change the tree; a spec replaces the code that speaks to an outside system without naming an adapter; the root alone reads the environment, its configuration provider included; a type's one home is beside the signature that introduces it or in the folder its kind has, and its slug is `type-has-one-home`; placement's workflow axis holds who submits, commits and ships; a script that only joins commands passes on its caller's environment with every secret it received unset.
  - Tools: python-check fails at start on a home that is no list of folders; a Python generated package is `<name>_gen/`, which python-check, coverage and mutmut leave aside.
  - Contexts: TypeScript reads `process.env` only under the root, a rule moved from bun to the language, since Node reads it alike; module-level and static state, and Python's class attributes and `functools.cache`, change after load nowhere but in the diagnostics facades and a spec's hook-set setup; `shopt -s inherit_errexit` where Bash is 4.4 or later, as macOS ships 3.2; a variable assigned from a command substitution is declared apart, as a rule of errors; an embedded command and a package script never trace; mobile's backup clause is a rule of its own, and background work may read data protected until the first unlock; structlog's logger carries out Python's.
- **Rejected.** Splitting the rendering server's session proxy into the browser's seam with server, whose rule could not tighten a rule of the browser's own block; a Bash floor for every script, which scripts the project pins Bash for do not need.
- **Why.** Each fix closes a clash between two rules, a tool that held more than its rule, or a form a language owed its parent.

## ADR-0183 — Core and the contexts after their eighteenth review

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** The eighteenth round graded core and the contexts 8.9 with every reviewer; what two reviewers or more found is closed.
  - Core: a sub-agent never acts on a live system, a rule of the base now, which a project without the workflow axis keeps; the agent's model provider, a recipient the project lists, is no way out of the trifecta; a credential's declaration names its owner, scope, issuer and rotation, as its slug now says; personal data kept out of output is what the program holds about the people it serves; a script passes each secret it received only to the command that reads it; a set of numbers another system defines is declared once, as both languages already said, and a set complete by its meaning stays closed; a resource that outlives its scope is released by its owner; one artefact is the program a host of the project runs or serves; the build backend a package's manifest requires is capped, not pinned, since whoever builds the package resolves it; an optional part shows itself unavailable rather than crash; `root/` keeps the surface the entry files import.
  - Tools: python-check also refuses `bz2.open`, `lzma.open`, `zipfile.ZipFile`, `Path.cwd`, `Path.home` and `uuid.getnode` below the edge; a shared adapter in Python imports no feature, as in TypeScript.
  - Contexts: Python's module state allows the diagnostics facades and a spec's setup, as core and TypeScript do, and its types move to a chapter file; both languages state how a path is opened beneath its root, how a pattern on outside input avoids backtracking, how an identifier is normalised, and how text for a machine avoids the locale; shell's failure rules carry out the catch rule, `.bash` files are governed, and an empty array is expanded safely below Bash 4.4; a destructive command line confirms or needs `--force`; mobile leaves personal data the server can restore out of backups and backs up what lives only on the device, its credentials already kept out by the keystore rule; the browser refuses `setHTMLUnsafe` and `parseHTMLUnsafe`; TypeScript's equality rule forbids only loose comparison; a server's settings may come from a store read with its host's identity.
- **Rejected.** Splitting core's rule on secrets and personal data in output, whose children in observability, messaging and the untrusted client hold both halves at once; exempting a generated file from the complexity limit, which no reviewer agreed on and complexipy's settings were not checked for.
- **Why.** Each fix closes a clash between two rules, a rule a project could lose with an axis, or a form a language owed its parent.

## ADR-0184 — Core and the contexts cleared of what the review rounds added beyond need

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** The owner ended the review rounds at 8.9 and asked that every layer hold nothing superfluous. An editor's audit of what rounds eleven to eighteen added to core and the contexts removed thirteen rules and trimmed eleven:
  - Deleted: tracing in a package script or an embedded command, which the length rules push into a `.sh` file; a credential's declaration, which no reader can check; the server's listening address; TypeScript's singular enum name and a type parameter's second use.
  - Merged: the root's building of stateful parts and its decorators into `composition-root-wires-everything`, whose text says it once; a function's handed dependencies into `function-answers-or-changes`; the contract suite into the fake's rule; a constant's spec into `spec-proves-one-boundary`; the sub-agent's limit into the person's decision to commit or ship; a script's exports into its secret rule.
  - Trimmed: the catch rule, the trifecta, the one writer of a shared resource, the identifier rule (a path is confined, not case-folded), the rendering server's session, the delivery unit's edge, the instant, the sandbox, a type's home, a transient failure and an agent's limits each lose a clause another rule already holds.
  - Renamed: the language forms of machine text and of a pattern on outside input name their form instead of their language.
- **Rejected.** Folding the remaining deadline into the timeout rule, which would raise a SHOULD to a MUST; shortening the catalogue of patterns, the one place they are named.
- **Why.** A rule added to answer one reviewer's edge case costs every reader; what a parent, a sibling or a tool already holds is said once.

## ADR-0185 — The domains cleared of what restates a parent, a sibling or a protocol

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** An editor's audit of the domains, which grew from 228 rules on the last release to 605, cut them to 551, with no domain merged and no level raised.
  - Deleted: rules that restated a core parent or a sibling — the remote service's `Retry-After`, the ui's configuration provider and plain form, a prop's name, the OpenAPI document's one source, a consumer's states, a token's deprecation, the failure cases of a call and of a model, a locale without props, a library's log output, a conversation's owner, erasure in indexes, the opt-out header, specs reading shared data; protocol obligations HTTP and MCP already state — a refused method's `Allow`, `304`, a tool name's characters, stdio's standard output, `201` and `429` under the rule that methods and statuses mean what HTTP registers; and advice too small for a constitution in ui, i18n, analytics and distribution.
  - Merged, each into the rule whose meaning it extends, at the survivor's level only where both were already of it: a contract diff into adding only, in the API and in messaging; the extensible enumeration of rest and MCP into one rule of `_api`; dead letters and failed runs into the consumer's alert; a unique last key into the cursor; `nosniff` into the content type; 401 and 403 into one rule; an argument's bound into the closed schema; a token's grammar, a repository per root, a private unit, the published schema's copy, the bundled notices, the manifest's three fields, and the model call's timeout.
  - Trimmed: a boolean prop, a compound component, session warnings, time limits, sign-out, log masking, structured log output, dated legal clauses, the config file's unknown keys and a unit's integration.
- **Rejected.** Folding a SHOULD into a MUST by a merge — navigation by slot, permissions passed down, a screen's private pieces, a busy submit's focus, a local tool server — which would raise a level the owner never chose; deleting a fast source's one update a frame, the parent two implementations carry out; a merge that would put a rule of the architecture into the base, a rule of a seam into its block, or a field's deprecation into the rule on headers — a store kept from the drilled prop, the session's presence, the binding units' consumers and the deprecated field stay rules of their own; one core rule for TLS in place of the three in remote-service, owned-data and messaging, since a network is a domain's subject and each of the three may be active alone; cutting the runtime floor's exception for a minor, on which Python's floor rule rests; merging a GET's cache policy into the personal answer's, which raises a level and waits for the owner.
- **Why.** A rule that only repeats a parent, a sibling or a standard costs every reader and says nothing new.

## ADR-0186 — A merge keeps one meaning

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** A rule merged into another stays merged only when it is a case of the survivor's one meaning; where the survivor's slug no longer said what it held, the merge had joined two meanings and is undone. The rules ADR-0184 and ADR-0185 had merged are split again: a function's purity from command–query separation, the contract suite from the one fake, a script's exports from its secret, the published schema's copy check from its generation, `nosniff` from the declared content type, the command repository from the aggregate's root, and the manifest's licence, source repository and runtime floor into their three rules. The merges that are cases of one meaning stay: the root's wiring, a constant's spec, a sub-agent's commit, a contract's diff, the extensible enumeration, the cursor's unique key, 401 and 403, a tool's bounded schema, HTTP's methods and statuses, the private units, a unit's licences, a model call's bounds, and a stalled messaging work's alerts, renamed `stalled-message-work-alerted` for its one meaning.
- **Rejected.** Renaming a merged slug to list both halves, which names the smell instead of curing it.
- **Why.** A slug says what holds; when it must say two things, there are two rules.

## ADR-0187 — A package holds one root, and a second root is a second product

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** A package holds at most one composition root and a library none; a program that wires itself apart is a package of its own, and what two of them run lives in a package with no root — in a workspace, a unit of `packages/` per program and `shared/` for what they share, made only once the second program exists.
- **Rejected.** A monorepo triggered by two platforms or two technologies: it splits Flutter or Expo, which serve several platforms from one root, and misses two React applications of one product, which share a technology and still have two roots. A shared package made ahead of the second program: its boundary is a guess, and every change pays for two manifests meanwhile; the layer rules already keep the business ready to move.
- **Why.** A root is the one place that wires a program; a second one in the same tree splits every layer between two programs.

## ADR-0188 — No folder is a delivery layer: a delivery unit lives with what it serves, and the root registers it

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** A delivery unit of one feature lives in that feature's application layer, one that composes several in a module of composition, which takes a feature's form and is blind to the other modules; a screen always lives in composition, a widget with the one feature it serves or in composition; a command is its operation's binding unit, `<op>.cli`, beside the operation. The root registers every unit, in the folder a framework fixes where it fixes one, and alone knows the addresses: screens, widgets and components receive links as slots and transitions as callbacks. A delivery unit reads and writes only through what its framework hands it.
- **Rejected.** A top-level delivery folder its block names — `cli/`, `api/`, `routes/`: it names the platform the whole program already is, as a `browser/` folder would in a React application. Screens kept in the root: the root would mix wiring with the interface. A screen in its feature while it uses one feature: it would move the day it shows a second. A navigation port: the router is a host, like the interface's framework, and props already keep the paths out.
- **Why.** A unit changes with what it serves, and a program's entries are listed in one place, the root's registration.

## ADR-0189 — A feature never subscribes to another's events

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** A feature publishes its own events; the reaction to another feature's event lives in a module of composition, which calls the reacting feature's operation.
- **Rejected.** A feature subscribing to another's events directly: it couples the two as an import would, and spreads the chain of reactions through the features.
- **Why.** Composition is where features meet, for events as for answers.

## ADR-0190 — Business shared across languages is one compiled package first

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** Business that programs in different languages run lives first in one package in a language every target runs, compiled for each through generated bindings; then in the service they call; a copy per language, held by the schema and the conformance cases of `shared/`, is the last resort. Products that own their data apart share only contracts and wire shapes.
- **Rejected.** The service first: it puts every client behind the network even where one compiled core would serve them all. A business package shared by services deployed on their own: it ties their releases into one program deployed in pieces.
- **Why.** Business written once cannot drift between languages or between services.

## ADR-0191 — Every project keeps a decision log, for real alternatives only

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.** A choice between real alternatives that a later reader could propose again is recorded, at MUST, in the project's `DECISIONS.md` by the change that makes it: what was chosen, what was rejected and why, and its date. A choice the code, a rule or the commit already explains has no entry. `DECISIONS.md` joins the project's files, and `ratify` writes it from a template.
- **Rejected.** The record anywhere in the repository, at SHOULD: nobody knows where to look, so the choice is argued again. A record of every change: the log fills with what the history already says, and the entries that matter drown in it.
- **Why.** A decision is worth writing down when someone would otherwise propose the rejected option again; the test keeps the log short enough to be read.

## ADR-0192 — Work over input someone outside sizes grows at most n log n

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.** Work over input whose size someone outside the program chooses — a client, a file, a remote system — grows no faster than n log n in time and n in memory; a faster-growing algorithm runs only on a count the program caps low enough for that growth, and the code names the cap. It stands in security's chapter on outside input, beside the linear-time match. A size limit on the input alone does not license a quadratic loop over it.
- **Rejected.** One ceiling of complexity for all code: what is fast enough depends on the size of the data, and a quadratic loop over ten fixed items harms nobody.
- **Why.** Growth matters where the size is someone else's choice: there a slow algorithm is a denial of service, like a backtracking pattern.

## ADR-0193 — TypeScript separates type imports and writes no namespace

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.** The names an import or a re-export uses only as types go in an `import type` or `export type` of their own, never marked `type` inside braces beside values — Biome's `separatedType` for both imports and exports. No `namespace` or `module` block is written, an ambient one included: a library is typed by `declare module '<name>'`, globals by `declare global`, and a `namespace` appears only inside it to merge into one a library or the runtime declares, under a suppression.
- **Rejected.** The inline `type` marker TypeScript allows by default: a reader can no longer see from the line whether it vanishes at run time. `declare namespace` for a library's or the runtime's types: it types a global no import names.
- **Why.** The presets already held both choices; the rules had been written looser and contradicted them.

## ADR-0194 — The kernel is the shared domain, and the ports features share live in it

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.** The top-level `contracts/` goes. A port two or more features need in the same words lifts to the kernel's `contracts/`, beside its types, value objects and errors, so the kernel is laid out as a domain is; its implementations stay in the top-level `adapters/`. A port one feature needs stays in that feature's `domain/contracts/`, and a port each context words its own way stays with each.
- **Rejected.** A top-level `contracts/`: its path does not say it belongs to the domain, and it is one more layer to learn. `shared/domain/contracts/`: `shared/` is plumbing without business. A port lifted as soon as two features talk to each other: DDD keeps the shared kernel small, and a feature that needs an answer from another words its own port.
- **Why.** DDD's shared kernel is the part of the model contexts share, the contracts between them included; a shared port is part of the domain and lives where the domain's shared part lives. The config file's port and its joined type are no shared port — no feature reads the file — so they live in the domain of the composition module that splits the file, and the kernel stays small.

## ADR-0195 — Every operation has a use case, and an interface calls only use cases

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.** Every operation a feature offers, a read included, has its use case in the domain, however thin. The root builds each use case with its ports and hands it to the binding units; a binding unit, and a delivery unit that binds an operation itself, calls the use case and never a port. A query library keeps the cache, its keys, freshness and optimistic updates in the binding unit and calls the use case in its query function.
- **Rejected.** A use case only for an operation with business logic, the binding unit calling the port of a plain read (the rule this replaces): the domain then hides what the feature does behind the interfaces, a rule added to a read has to be added in every interface's binding, and a shared package across programs offers ports instead of operations.
- **Why.** Hexagonal architecture gives the application one driving port per operation, reads included, and counts an adapter that calls a repository past it as a violation; vertical slices give each request its own handler; CQRS keeps the query side thin but still a handler. A one-line use case is the price of that one door. `module-is-deep` names the one door a part offers for each of its operations among its exceptions, so a thin use case is not a forwarder to remove; the root builds the use cases, and a binding unit's own concerns — the identifier it makes for a command, the events it reports — still come through ports.

## ADR-0196 — What the 2026 expert audit and the second church review changed

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.**
  - A feature owns its stored records, in a namespace of their own, and is cut where the business's language changes.
  - A record and the event that announces it to another part land together, so a reaction in its own transaction is driven from the record, through an outbox.
  - The root wires by hand where the framework brings no container.
  - A workspace's programs live in `apps/`, each part shared by two of them in `shared/<name>/` as a unit of its own, and code that knows nothing of the product in `libs/<name>/`.
  - The church review adds: durations read by their percentiles, no branch on the environment's name, long work that shows its progress, charts with a text alternative, drag feedback, property generators built on the fixture, singular type names, merged branches deleted, failures that name only reachable steps, and feature flags retired once settled.
- **Rejected.**
  - `packages/` for the programs: Turborepo means libraries by it.
  - One `shared` package: every program then rebuilds on every shared change.
  - A use case moved into `app/`: `domain/` would no longer be the part programs share across hosts.
  - Surfaces dropped from role folders, and pure libraries let into the domain: both kept stricter for now, to be revisited when their cost shows.
  - One repository for a simple feature in place of the split by side: the split is interface segregation and keeps one tree, and CQRS's warnings concern separate models, which the split does not make.
  - Business metrics of the critical scenarios: deferred.
- **Why.** Each change follows the consensus of 2024–2026 sources the audit cites — Evans and Vernon, Jovanović and Spring Modulith, Microsoft, Seemann, Nx and Turborepo, the Google SRE books — or a church rule our form lacked; each rejection keeps a stricter choice the owner made.
- **Superseded in part.** The use case moves out of `domain/` into `application/` (ADR-0259); the rejection of a use case in `app/` stands.

## ADR-0197 — What the 2026 expert audit changed beyond the architecture

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.**
  - Code: a function's cognitive complexity is held at 15, the default its author calibrated, in core and in complexipy; TypeScript names an expected failure in a `@throws` tag, since no signature can; an event or a failure inside a unit of work is a log record in its span's context, and span events leave the mask rule, OpenTelemetry having deprecated them.
  - Testing: the coverage gate stays at 100 percent, and the integration specs of code over an engine the sandbox runs now count toward it, so such code is never reached through a faked driver; captured responses stand in only for a system no spec can run. `every-mutant-killed` stays a MUST over what a change touches, and a mutant no caller relies on — a log call, the text of a diagnostic — is left out by the tool's configuration or marked with its reason, like an equivalent one. A parser of outside input gets a property test. An eval repeats its cases, reports its standard error and compares a change in pairs, and its gate passes beyond that noise; an agent's eval grades the outcome from a clean environment; production runs are sampled into the eval; a pinned model's retirement date is tracked; GenAI span fields follow the conventions' pinned version.
  - Security: an account signs in with more than a password, and a phishing-resistant factor is offered at MUST; hiding an account's existence drops to SHOULD, sign-up answering by e-mail; a token's type is checked; security records leave the program for a store it cannot change, and a run of refusals raises an alert; an objection under the GDPR is honoured; a person sees and ends their sessions. A dependency is installed only from a registry, and the cooldown is a MUST. The private report of a vulnerability and the report of an exploited one, now with severe incidents and the users told, move from `distribution` to core's security, where a product from a store is bound too; `http-server` serves `security.txt`, at MUST since its parent is one, and `open-source`'s private reporting now tightens the core rule. Pinning an agent's extension splits from vetting it and becomes a MUST. A key agreement uses a hybrid post-quantum exchange, such as X25519MLKEM768, wherever both sides support one, at MUST in core.
  - Systems: served work has a service level objective, and an alert fires on its error budget's burn rate over two windows; spans and metrics go through OpenTelemetry's API, logs through the program's logger bridged or collected, all over OTLP under the stable conventions' names; a rate-limited answer says when to retry; a hidden object may be refused alike for every identifier instead of answered as not found; outgoing webhooks take Standard Webhooks' headers, sign with both secrets during a rotation and disable an endpoint that keeps failing, and an incoming one passes on any one valid signature; a time a person set in a place travels as RFC 9557 writes it.
  - Interfaces: every boolean prop of the program's own components takes its prefix, `isDisabled`, and is mapped to the native element's or the library's name where it is handed on, `disabled={isDisabled}`; an outside library's components keep that library's contract. Every shell script and embedded command passes a shell analyser, and every Markdown document a Markdown linter, at their strictest; the tools are the implementations'. A TypeScript package others install is checked under its runtimes' resolution, `nodenext`, and its exports' types are held by `isolatedDeclarations`. A loading indicator waits a delay and then holds a minimum. The Whys of readiness and of errexit name the traps the audit raised.
  - Kept as they were: the value object as plain data, whose Why already names serialisation; `should` in a case's name; a domain of collaborative editing waits for the first product that edits together.
  - An idempotency key is the identifier the caller makes for what a write creates, kept as long as the record, or else a key bound to its caller for a declared time; a key reused with other input is a conflict (SY2).
  - A `DELETE` of a resource already gone answers `204` (SY3).
  - An API has no version until a change breaks it, and its major is the first segment of every path (SY10).
- **Rejected.**
  - The CI rules of the workflow analyser — a token's permissions declared per job, a step pinned by a commit's hash — wait for that analyser's block, which brings them with its preset; core's pinned download already holds a step by its hash.
  - A function that does one thing, guarded against splitting too far (CD3): the line between the two is taste the review already weighs.
  - Every export of a distributed unit documented (CD4): documentation stays where names and types say too little.
  - A budget of retries across calls (CD5): retries stay bounded per operation, and a breaker cuts a failing system off.
  - One summary record per unit of work (CD7): OpenTelemetry's three signals stay the model.
  - Arrange, Act and Assert told apart by blank lines at SHOULD (TS5): the owner keeps the comments at MUST.
  - A quarantine run beside the gate (TS6): a flaky test is still fixed or deleted with its issue, and a quarantine is one more run to keep.
  - A registry that refuses every other way to publish, and staged publishing (SE2): publishing stays bound to the run's identity and provenance; staging is new and one registry's.
  - A version in use matched against advisories as they appear (SE5): the check runs on a change, and ADR-0155 keeps the rules off schedules.
  - E-mail and SMS refused as factors (SE7): a second factor is now required, and its kind is left to the product.
  - An unmaintained dependency replaced (SE13): "unmaintained" has no test a reviewer can apply alike.
  - For SY2, SY3 and SY10, the alternatives the owner turned down: an idempotency key with a lifetime for every write, which a creation's own identifier outlives; `404` for a `DELETE` of an absent resource, which reads a retry after a lost answer as a failure; a version as a query parameter or a media type, which logs, caches and routes do not show.
  - A migration linter (SY6): its checks belong to one engine, so a project's block adds it.
  - `If-Match` required only for a write that replaces what it read (SY7): core's conditional write is the reason the header is required.
  - Tokens named after a component (UI4): semantic tokens and variants serve until a white-label product needs more.
  - A component that loads its own data (UI5): ADR-0107, ADR-0187 and ADR-0188 keep the screen as the one loading point.
  - Literal unions or `as const` objects in place of `enum` (UI9): ADR-0169 keeps the owner's choice.
  - The reason in the commit body (WF1): ADR-0071 keeps it in the change request's description.
  - The version read from commit types, `hotfix/` dropped (WF2): ADR-0167 keeps the branch's type until the release automation reads commits.
  - Branches that land within days (WF4), a review within a working day (WF10), the check run on the merged result (WF11) and a rollback by one run (WF12): a repository with one owner and his agents lands one change at a time; each returns when a team works on one.
  - A rule of its own for feature flags (WF8): ADR-0196 already retires a flag once settled.
  - A tool named in a submission (WF9): the person answers for what they submit, and a receiving project's own policy still governs.
- **Why.** Each change follows the consensus the audit cites — SonarSource, OpenTelemetry, Khorikov and Google's testing books, Anthropic's work on evals, NIST SP 800-63B-4, OWASP ASVS 5.0 and Top 10 2025, the EU Cyber Resilience Act, the Google SRE books, Standard Webhooks, RFC 9116, RFC 9557 and the TypeScript handbook — or a choice the owner made. The post-quantum exchange, once dropped as covered by current guidance, comes back: the owner wants the newest practice, NIST deprecates the classical exchange by 2030 and the EU starts the move by the end of 2026, traffic recorded now is read once it falls, and the TLS libraries offer the hybrid by default, so it costs nothing where both sides have it. It stands in core rather than a network domain because a sealed envelope agrees a key with no network at all, so nothing need disappear for the rule to keep its meaning. The coverage gate counts integration specs because a driver faked only to reach an adapter's lines proves less than the engine itself, and the mutation gate leaves out what no caller relies on because a case written for it proves no plausible bug.

## ADR-0198 — Protocols and vendors kept to the blocks that name them

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.**
  - `remote-service` names no protocol. The rules of a webhook the program receives — verified over its raw body as the server received it, processed once, acknowledged once recorded — leave its `inbound.md`, which goes, since nothing protocol-free remained in it. What the program sends becomes a push: `sent-webhook-signed-with-a-delivery-id` becomes `sent-push-signed-with-a-delivery-id`, and `failed-webhook-retried-then-held` becomes `failed-push-retried-then-held`, whose receiver is disabled once it says it is gone for good.
  - The HTTP webhook rules live in a new domain, `webhooks`: a webhook is an HTTP callback a product may lack, so by the placement test it is a domain, as `rest-api` is the HTTP style of API. It requires `remote-service`, and its main file holds what the program sends, in Standard Webhooks' format: the `webhook-id`, `webhook-timestamp` and `webhook-signature` headers over `id.timestamp.body`, both signatures while a secret rotates, and an endpoint that answers `410 Gone` disabled at once, each tightening `remote-service`'s push rules. What it receives — verified over the raw body, any one signature passing, a repeat known by an identifier the signature covers, acknowledged once recorded — sits in its seam with `http-server`, and Standard Webhooks' headers are named inside those rules rather than in rules of their own, since a rule never tightens one of its own block. Each Standard Webhooks clause follows the specification: it names the headers, the signed content, `v1,` and `v1a,` signatures listed by spaces, the identifier kept across retries, and asks a sender to disable an endpoint that answers `410`.
  - The other leaks found beside it: a sign-in by code with PKCE is an OAuth 2.0 or OpenID Connect provider's; a privileged factor is read from the provider's assertion, `acr` or `amr` in OpenID Connect; a token is checked as self-contained or as opaque against its issuer; refresh tokens bind only where the program issues them; MCP's `401`, `403`, `WWW-Authenticate` and Protected Resource Metadata move to its seam with `http-server`; `_api` declares an enumeration open in any style, and `rest-api` spells it in the OpenAPI document; `ui` is an interface of declarative components that take props; `config-file`'s schema rules hold where the format has a schema editors read, and `schema-library-generates-json-schema` becomes `schema-library-generates-the-editors-schema`; a framework integration's framework is an optional dependency, the peer or the extra left to the language seams that already name them; publishing by the run's identity holds where the registry offers it; a message's trace context travels in its headers or metadata, and through the outbox only where there is one; `version-control` is distributed version control; a session ends after the transport's renewal fails, where it has one; an exhaustive branch is proved by the type checker where the language has one and otherwise fails as a defect in its default; Python's YAML rules name no library, and its cancellation rule covers the async library the project uses.
  - The placement test names what implementations hold — a library, a tool or a vendor's service the project installs, runs or reaches — and sends a specification or a protocol to the domain of what it specifies. A YAML config file's schema header belongs to YAML, not to one YAML library; NestJS requires `http-server`, since its rules answer HTTP; `_api` names an operation, never its heirs' route or tool.
- **Rejected.**
  - Generic inbound rules of a "push" for every protocol: no second protocol of the program's yet receives pushes from outside, and a broker's deliveries are already `messaging`'s; the rules would be written for one case and worded for none.
  - `webhooks` requiring `http-server`, or its sending rules in its seam with it: a program that only sends serves no HTTP, so the requirement would force a server on it and the seam would never be active where it is needed; `mcp-api`, which may run over stdio, keeps its HTTP rules in the same kind of seam, while `rest-api` requires `http-server` because every REST API is served over it.
  - An implementation block for Standard Webhooks: the implementations layer holds libraries and tools, and Standard Webhooks is a specification of the webhook itself, whose rules lose their meaning only where webhooks go.
  - A block for the `standardwebhooks` library: the format must not oblige one library, and the specification's own libraries are only one way to write it.
  - Keeping the HTTP names in `remote-service`: its rules then bind a program that speaks only gRPC or a broker to headers and statuses it never sees.
  - For `ui` and `version-control`, rewriting every rule to fit any interface or any version control: their rules rely on props and on push, force-push and trailers, so narrowing the intro to what they govern keeps each rule as written and honest.
  - A `ruamel-yaml` block for the Python loader: deferred until a Python project reads YAML; its rules, `YAML(typ='safe', pure=True)` and the timestamp tag as text, wait for it.
  - The JSON Schema spelling of an open enumeration in `mcp-api`: a client reads a tool's output schema from the server it calls, so a value added changes the schema it checks against at once.
- **Why.** A rule holds one meaning only where its words belong to its layer: a protocol's names in a domain bind every program of that domain to a protocol it may not speak, and a vendor's format in a domain binds it to that vendor. Standard Webhooks is no vendor's format but an open specification of the webhook, so the `webhooks` domain may name it; it supports every clause that names it, the disabling of an endpoint that answers `410` included, so none of them is the owner's choice alone.

## ADR-0199 — A workspace holds the apps it deploys and the packages it shares or releases; one job in several languages holds `languages/` and `shared/`

**Date:** 2026-10-17 · **Status:** Accepted

- **Decision.**
  - A workspace holds `apps/<name>/`, what the repository deploys and runs itself and nobody installs, blind to each other; and `packages/<name>/`, every other unit: what its apps share, and the libraries, tools and configurations it releases. Imports go from `apps/` to `packages/` and never back; packages may import each other, never in a cycle. A unit is named after its folder, `@<scope>/<name>` or `<scope>-<name>`, and no two units share a name.
  - Code that knows nothing of the product and is needed by more than one repository is released from a repository of libraries; until a second repository needs it, it lives in the `libs/` of the source that uses it — a rule of core, since it holds in a repository of one package too. The boundary of what knows nothing of the product is the repository's, and review holds it inside one (ADR-0200).
  - A package others import offers a further entry that serves no host framework, such as `testing`, as a file beside its surface that only re-exports, as `@angular/core/testing` and `hono/testing` do.
  - Code that serves one purpose in several languages holds `languages/<language>/`, one package per language, and `shared/`, what they need written in none of them; `languages/` appears with the second language. The rule lives in core's architecture, since a repository of one such product has the same shape. This replaces the per-language folders at the unit's root of ADR-0150.
- **Rejected.**
  - `apps/`, `shared/` and `libs/` at the workspace's root, the first form of this decision: it split the units by their reach, which no monorepo tool or large repository does, put a command-line tool others install under `apps/` because it has a root, and named every unit with a `shared-` or `libs-` prefix.
  - An app as any program with a root of its own: Turborepo puts tooling in `packages/`, Nx calls an app the deployable shell, and vite, react, next, astro and svelte keep their command-line tools in `packages/`.
  - A folder or a tag for what knows nothing of the product inside one repository, as Turborepo's boundaries and Nx's tags hold it: the repository already draws that line, and a tag is a second place to keep in step.
  - `products/` for what the repository releases: a library a product's repository shares but never releases would have no home.
  - Flat siblings per language, `eros-typescript/` and `eros-python/`: uv and Cargo refuse a glob once it matches a folder without their manifest, and a prefix does a folder's job.
  - A top level by language, as protobuf and Arrow have: it spreads one product over a root per language.
  - A nested workspace per product: Bun ignores a workspace inside a package and uv refuses one.
  - Language folders at the unit's root beside a source named by its content, as sentry-conventions has: `languages/` names the axis of its children as `apps/` does, and `shared/` means what two or more neighbours need at every level.
  - `data/` for the source in no language: a word of no role, a catch-all in waiting.
  - The helpers a package offers for its consumers' tests as an integration into a test runner: they call no runner, so they are an entry of their own, and a package of their own only once they serve one runner, as `@effect/vitest` does.
- **Why.** `apps/` and `packages/` split the units by how they leave the repository, the split Turborepo states and every repository of libraries and tools follows, so a reader from any of them knows the tree on sight; the direction of the imports follows from the two folders, and the one boundary they do not draw is drawn by the repository.

## ADR-0200 — Tools hold what breaks in silence; review holds where a file lives and what it is called

**Date:** 2026-10-16 · **Status:** Accepted

- **Decision.**
  - A tool holds a rule whose violation silently breaks a property the program relies on: formatting, lint, types, tests and their gates, secrets, vulnerabilities, unused code, versions, and of the architecture only its base — the domain's and the kernel's imports, features and modules of composition blind to each other, adapters wired by the root alone, a binding unit calling use cases and never a port, libs and shared plumbing kept below the application, a module reached through its surface in TypeScript, no cycle, the workspace's direction, frameworks and vendors in their homes, effects and the environment held at the edge and the root.
  - Review, by people and by the reviewer agent, holds where a file lives and what it is called: the folders a tree allows, role suffixes, a component's prefix, the forms of a spec file, a screen in composition, a module of composition laid out as a feature, a command's or a consumer's file, a component's effects in its hooks file. Query keys built only by their factory stay with a tool: a key written inline misses its invalidation in silence. Those rules keep their text and lose their bindings.
  - ls-lint goes, with its block and presets. The case of a file name stays with a tool: Biome's `useFilenamingConvention` in TypeScript and ruff's `N999` in Python; a folder's name, YAML's extension and the other names it held go to review.
  - python-check keeps the limits of lines, relative imports kept in their module, packages in their homes, effects at the edge and the environment at the root; what import-linter's wildcards miss — a sibling reaching past another's `__init__.py`, a file past a role folder of its own module, a module importing its own surface — goes to review.
- **Rejected.**
  - Every rule a tool can express held by one, as the presets grew to do: each move of a folder rewrote five or six presets in two languages, their bindings and the e2e fixtures, for violations a reviewer sees at a glance and that break nothing in silence; `rule-held-by-a-tool-where-one-can` already leaves to prose what a check costs more to keep than the review it replaces.
  - Dropping the architecture's tools as well: code is now written largely by agents, which keep what fails the check more reliably than what prose says, and a broken direction of imports spreads unseen until the parts no longer come apart.
  - Keeping ls-lint for the case of folders alone: one more tool, pin and configuration for one rule a reviewer reads in every path.
- **Why.** A check pays for itself where a violation is silent and costly; where it is visible and harmless, its upkeep costs more than the review it saves. Fitness functions in the literature and in Nx, ArchUnit, Spring Modulith and import-linter hold a few rules of direction, not the names of folders.

## ADR-0201 — The presets after the implementations review

**Date:** 2026-10-16 · **Status:** Accepted

- **Decision.**
  - A package others install is held by `isolatedDeclarations` in tsc's `distribution` part; its resolution under the runtimes that load it is left to review, since `nodenext` over the source refuses the folder imports `surface-imported-by-its-folders-path` requires.
  - Bun's coverage gate runs in a second configuration, `bunfig.integration.toml`, over the unit and the integration specs together, because Bun merges no coverage between runs and ADR-0197 counts the integration specs; the unit run keeps its network sandbox, and the unit specs run twice.
  - Literals with a meaning are held by ruff's `PLR2004` and Biome's `noMagicNumbers`; cognitive complexity is 15 in Biome and complexipy; mutants of log calls and diagnostic text are left out by Stryker's ignorer; in Python, mutmut's `do_not_mutate_patterns` leaves out log calls and the text of a diagnostic is marked by its line's pragma, since ruff's `EM` puts the text on a line of its own before the `raise`, where a pattern over that line would also drop the error's data; a dependency from a source repository or an address is refused by syncpack's specifier types, while a `file:` or `link:` path — a library's archive in `.droneey/`, for one — is left to review, which keeps it inside the repository; in Python, `sources-stay-in-the-repository-or-an-index` limits `[tool.uv.sources]` to the workspace, an archive inside the repository or a named index, and review holds it, as it does a git dependency that arrives only through a lockfile.
  - ShellCheck with an explicit `enable=` list, shfmt, rumdl and yamlfmt are blocks of their own; this repository checks its shell scripts and its Markdown with them.
  - Hooks are installed when the repository is set up, never by a package manager's install script (`hooks-installed-on-setup`, replacing `hooks-installed-with-dependencies`), so a project without mise keeps the rule.
  - An objection to analytics keeps Matomo's tracker off in the program itself (`matomo-objection-keeps-the-tracker-off`), since Matomo's `optUserOut` stores the objection in a cookie that `disableCookies` turns off.
  - TanStack Start's headers are set by what serves the files: Nitro's `routeRules` where Start's server serves them, the host's own configuration where a static host serves the SPA's shell and assets, which Start's request middleware never reaches.
- **Rejected.**
  - `nodenext` over a distributed package's source: it would make that package write file paths with extensions and break the folder-surface rule for it alone.
  - Coverage read from the unit run alone, which leaves code reached only by integration specs uncovered; a merge of two runs' reports, which Bun cannot do.
  - Matomo's `optUserOut`, a cookie the cookieless setup never sets.
  - Request middleware for TanStack Start's headers, which a static shell never passes through; Nitro's `routeRules` alone, which a static host serving the SPA never reads.
  - Every `file:` and `link:` dependency and every uv `path` source refused: no tool tells a path inside the repository from one outside it, and a library may be installed from an archive inside it.
  - A Biome plugin for the prefix of a boolean prop: a name, which review holds under ADR-0200.
- **Why.** Each setting holds a rule the tool can check without guessing; where the tool could not hold it without breaking another rule or reaching past what it sees, review keeps it.

## ADR-0202 — A new release waits three days

**Date:** 2026-10-16 · **Status:** Accepted

- **Decision.** A new release of a dependency is adopted after a cooldown of at least three days, in core and in its forms for Bun (`minimumReleaseAge = 259200`), uv (`exclude-newer = "3 days"`) and Renovate (a minimum release age of three days); the fix for a known vulnerability stays exempt by name.
- **Rejected.** Seven days, which the audit of ADR-0197 proposed: it holds back for a week every release the projects need today, while most hijacked releases are pulled within a day or two; the owner may raise it again when a project needs the margin.
- **Why.** Three days catch the hijacked releases found at once and keep the tools current; the cooldown stays a MUST, so no install skips it.

## ADR-0203 — The plugin is the engine; the rules come from the project's archive

**Date:** 2026-10-16 · **Status:** Accepted

- **Decision.** The plugin holds only the engine — hooks, skills, agents — and is served as a `git-subdir` source of its package's folder, `packages/constitution`, at its release tag, which each release commit writes. The rules come from the release the project pins: `constitution.tar.gz`, installed by mise and linked as `.droneey/constitution/`, carries `blocks/`, the `digests/` the release generates, `presets/`, `templates/`, `package.json` for its version, and `digests/format`. The hooks read the digests there, so each repository reads exactly the release its pin names. The plugin reads format N and N−1: a newer format asks for a plugin update, an older one for a higher pin, a missing archive for `mise install`. `digests/` is ignored by git, and the check holds their limits on a copy generated in memory.
- **Rejected.**
  - The plugin from a release zip, its sha256 committed to main by a publish step: the rules would follow whichever plugin a machine has, not the project's pin, and each release would need a second commit, a token that starts workflows and a skip for it.
  - A separate marketplace repository: one more repository released in step, and the rules still follow the machine's plugin.
  - A dist branch with the built plugin: a second, generated history main never merges.
  - `releases/latest`: pre-releases, the only releases before 1.0, never reach it, and an archive's sha256 cannot follow a URL whose file changes.
  - Committed digests: a generated file that changes with every block, with its diffs and conflicts.
  - The plugin delivering the rules of its installed version (the plugin's former delivery): two repositories on one machine would read one release whatever they pin.
- **Why.** Projects already pin one release through mise for their presets; reading the rules from the same archive makes that pin the single source, and the plugin's only contract with a release is the digest format.

## ADR-0204 — A pack is a folder of blocks the hook reads as it finds them

**Date:** 2026-10-17 · **Status:** Accepted

- **Decision.**
  - A pack is a folder shaped like the constitution, `blocks/` and, when it has them, `presets/` and `templates/`, with no manifest and nothing generated. A project lists the packs it follows by their paths in `constitution.yaml`'s `packs:`, and their blocks by plain id beside the constitution's.
  - The engine is the constitution's alone. At session start the hook reads each listed pack's Markdown as it reads a local block: a block's card for its front matter, its chapters and `with/` files by their folders, and its rules by their headings, a rule's level from its parent where it states none. A pack's block is listed with its pack and its files read from there. A pack that is not installed, a block whose id the constitution or an earlier pack already holds, and a rule that carries out an unknown rule are warnings, never the end of the digest.
  - A pack's presets are extended by the project's own configuration, from their path, as the constitution's are.
  - A pack tightens as any block does: its rules never replace or loosen the constitution's.
  - Its author checks it with the constitution's own `blocks:check --base <constitution>`, which the release archive carries as `tools/constitution/dist/blocks-check.js`: the pack's blocks load beside the constitution's, so every arrow and `requires` resolves, and only the pack's findings are reported. No project runs it.
- **Rejected.**
  - Digests generated in each pack's release, as the constitution's are: a pack would need a build step and its own release artifact, while the hook reads a handful of blocks as cheaply as it reads local ones.
  - Digests generated in the project after each install: every project would need Bun, Python ones included, and a step the hook, which runs on bash and awk, cannot run itself.
  - A manifest per pack with its name, version and the range of the constitution it fits: an arrow or a `requires` that resolves is the fit that matters, and a range would be a second source of it.
  - A pack that replaces or loosens a rule of the constitution: a pack tightens as any block does.
- **Why.** The owner's model: a pack is only blocks, and the engine operates whatever packs a project connects. Reading packs where the hook already reads local blocks keeps the one engine, and a pack's author keeps the one check the constitution runs on itself.

## ADR-0205 — The hook reads the blocks themselves, and a project's own blocks are a pack

**Date:** 2026-10-17 · **Status:** Accepted

- **Decision.**
  - The hook reads every block from its Markdown at session start — the constitution's, then each pack's — as ADR-0204 has it read a pack: the card's front matter, the chapters and `with/` files by their folders, the rules by their headings, the Requirements rows, core's text from its card. It reads the whole constitution in about 50 ms and gives the same digest, line for line, and the same reminders as the index did. The release carries no generated `digests/`: `digests:write` goes, and a release names the form of its blocks in `package.json`'s `constitutionFormat`, which the plugin reads as it read `digests/format`, its own form and the one before it. This replaces the digests of ADR-0203.
  - A project's own blocks are a pack: a folder shaped like the constitution, wherever the project keeps it, listed under `packs:`, its blocks listed by id. The local blocks — single files under `rules/`, listed by their paths in a layer's key — go, and with them the hook's code for them; a path in a layer's key is a warning that names the pack.
  - `blocks:check` keeps the limit of core's card, which the hook gives whole in every digest: 3,500 bytes.
- **Rejected.**
  - Keeping the index for the constitution and Markdown for packs: two readers of one form, a build step in every release, and a working tree that shows its rules only after a command.
  - Keeping local blocks beside packs: two mechanisms for one thing, the project's own blocks, one of them able to hold only a card.
  - A fixed folder for a project's own pack: the project names its path, as it names any pack's.
- **Why.** Measured on the 349 files of the constitution, reading the Markdown costs the session start nothing an index saves, so the index was a build step and a second form with no gain. One reader for every block — the constitution's, a shared pack's, the project's own — leaves one engine, and a block edited in a working tree reaches the next session as it is.

## ADR-0206 — TanStack Start requires no server

**Date:** 2026-10-18 · **Status:** Accepted

- **Decision.** `tanstack-start` requires `tanstack-router` alone. A project whose Start server serves the program lists `server` itself; one that prerenders a static site, served by a static host, lists none. The rules of the headers and caching name both — Nitro's `routeRules` or the host's configuration — and what needs a running server moves into the block's seams with `server`: `runtime-config-from-one-server-function` in `with/server.md`, and the half of `spa-mode-without-server-logic` that bounds what Start's server holds in `architecture/with/server.md`; its other half, that the program renders on the client, stays in the block as `spa-mode-renders-on-the-client`.
- **Rejected.** Keeping `server` among its requirements: a static site would follow the rules of a program it never runs, or carry an override for each of them.
- **Why.** The Constitution's own site is a static build of Start, and its digest asked for a server it does not have.

## ADR-0207 — A unit keeps its Biome configuration in its folder

**Date:** 2026-10-18 · **Status:** Superseded by ADR-0213

- **Decision.** A package with parts of its own keeps a `biome.json` with `"root": false` in its folder, which extends the shared parts and its own through `.droneey/constitution`, a link the folder keeps to the root's; the root's `biome.json` extends the shared parts alone (`biome-configuration-in-the-unit`). One `biome check` from the root checks each file by the nearest configuration, and the package lints by its own script. This replaces the `biome.<name>.jsonc` at the root of ADR-0151. The same holds for every tool as a SHOULD of `workspace`, `unit-configuration-kept-in-its-folder`, which Biome's, Stryker's and dependency-cruiser's rules tighten; it is a SHOULD because knip reads one configuration for the whole repository and keeps each package's part in the root's under the package's path.
- **Rejected.** A configuration per unit at the root, run once more with `--config-path` and once more in the commit hook: the root then knew every unit's parts, and a unit moved to a repository of its own left its configuration behind. ADR-0151 kept the parts out of the unit's folder because Biome reads a plugin's path from the configuration that extends it; the unit's own link to the release gives that path in its folder.
- **Why.** What holds a unit lives with the unit: the root names only what every unit shares, and the unit carries its own rules wherever it goes (owner).

## ADR-0208 — mise.toml alone pins the release, and every key of constitution.yaml is written

**Date:** 2026-10-19 · **Status:** Accepted

- **Decision.**
  - A project pins the Constitution's release in `mise.toml` alone; until 1.0.0 it pins the current 0.x one. `constitution.yaml` has no `version`: the hook takes the release from `.droneey/constitution/package.json`, the release `mise install` linked, and the digest's second line reads `constitution.yaml makes <n> blocks active.` A `version` key left from an older release is an unknown key, a warning that says to remove it.
  - `packs` is required as every other key is, written `packs: []` when the project follows no pack; a missing `packs` is a warning that says to add it.
- **Rejected.**
  - `version` in both files, with a digest line when they differ: two sources of one fact, and the hook already followed the linked release whatever `constitution.yaml` said.
  - `version` in `constitution.yaml` alone: mise installs and links the release, so it reads its pin from `mise.toml`.
  - `packs` as the one optional key: a reader of the file could not tell a project with no packs from one that forgot them.
- **Why.** One pin, where the release is installed from, leaves nothing to drift; and a file whose every key is written reads the same in every project (owner).
- **Superseded in part.** Every key a warning when it is missing, by ADR-0231: `name` is written in every file, and leaving it out is no warning.

## ADR-0209 — Placement lists core's chapters as links, in the order they are read

**Date:** 2026-10-19 · **Status:** Accepted

- **Decision.** The `placement` chapter lists core's chapters as links, axis by axis, in the order they are read — itself first, then the base's from `code` to `agents`, then `architecture/` and `workflow/`; a language or a platform names its sections after them in that order, as before. `blocks:check` holds the list to every chapter of core, once each, and the links check holds each link to its file. The site's sidebar and the hook's digest follow the list, so an agent writing a language's sections reads their order in the digest; a chapter the list leaves out comes after it, by its name. Every other block keeps its chapters in the order of their names.
- **Rejected.**
  - A `chapters:` field in every card, `[]` where a block has no order: a field nearly every card leaves empty, for one block's need.
  - A `chapters:` field in core's card alone: a field one card has and every other card is refused breaks the one format of a card.
  - The order of the names everywhere, core's and the languages' sections alike: the order now runs from a line of code out to the agents at work on it, which the alphabet loses.
  - The order kept in the site's own code: a second list beside placement's, which had already drifted for `architecture/`.
- **Why.** The order already is a rule of placement, which a language's sections follow; written as links it is one list that an author reads and a program checks (owner).

## ADR-0210 — A seam is titled as the other block's card, and a card names none of its files

**Date:** 2026-10-19 · **Status:** Accepted

- **Decision.** A seam, `with/<other>.md`, is titled as the other block's card — `# Design system`, not `# Browser with a design system` — and `blocks:check` holds the two titles equal for every seam of a sound pair. A card says what its block is, never which of its files holds the rest: the cards of `browser`, `server`, `mobile`, `messaging`, `webhooks`, `remote-data`, `css`, `tanstack-start`, `version-control`, `access-control` and `language-model` no longer name their seams, `with/` files or axis folders.
- **Rejected.**
  - A seam titled after both blocks, and the site trimming the title for its sidebar: one file with two titles, one for each reader, while the folder already names the block the seam belongs to, as a chapter's folder does for a chapter titled by its topic.
  - A card that points at its seams and axes: it must change when a seam is added, removed or moved, and the digest and the site already list a block's files.
- **Why.** A block's structure is held by its folders, which a program reads; prose that repeats it goes stale the first time a file moves (owner).

## ADR-0211 — A block is its passport and three axes of named chapters

**Date:** 2026-10-19 · **Status:** Accepted

- **Decision.**
  - A block's root holds only its passport `<id>.md`, the one file its id names: the front matter, which covers every axis of the block; its title; one line of what the block is, as a quote; then, in plain paragraphs, its setup — how its tool or library is configured: preset parts, templates, configuration files, exclusions; and last, for an implementation, its `## Requirements` table, the one place it answers the requirements of the blocks above. The passport holds no rule.
  - Every rule lives in a chapter of its axis. Each axis is a folder of one form: `foundation/`, which every project follows, and `architecture/` and `workflow/`, which a project may leave out. It holds named chapters `<axis>/<name>.md` and seams `<axis>/with/<other>.md`, and exists only when it holds one; no file in it is named after its block, and a block with no rules is its passport alone.
  - A chapter is one file of one subject, named for it in its block's own terms; never the block's id, nor a vague name such as `general` or `misc`. Only a language and a platform mirror core: a chapter of theirs that refines a chapter of core takes its name, and a rule of theirs that tightens a rule of core sits in the chapter titled like its parent's; a seam is free of that.
  - A chapter and a seam share one form: the title and a `> Governs …` line; at least one rule; every rule under a `##` section, none named like the title; the section of the rules about the whole subject named `General` and first, and `Requirements for implementation` last.
  - `blocks:check` reports a file of an axis named after its block, a passport that holds a rule, a Requirements table anywhere but an implementation's passport, a chapter or a seam out of its form, and a rule of a language's or a platform's chapter that tightens core outside the chapter titled like its parent's.
  - Core's passport keeps the Constitution's preamble and lists core's chapters, axis by axis, in the order they are read; the digest gives it whole and lists core's chapters no more, and `blocks:check` and the site read the order from it.
  - The presets follow: every part, `self`, `plugins/` and `bindings.yaml` sits in `presets/<scope>/<tool>/<axis>/`, `foundation/` included, so a project's `extends` names the axis of every part.
  - The digest names the passport in each layer's heading and gives a block's chapters and seams axis by axis, foundation's first and unlabelled, `(<chapter>, with/<other>, …; architecture: <chapter>, …)`, an axis with nothing active left out; an implementation is named by its library alone, without its summary, and square brackets name a block's pack, round ones its files. The templates give a block as `templates/block/`: the passport `block.md` and a chapter `foundation/chapter.md`, renamed after its subject.
  - `constitution.yaml` still lists only the optional axes; a listed `foundation` is a warning.
- **Rejected.**
  - Every axis labelled and every block with its summary in the digest: the reference web application's list ran 1,000 bytes past the hook's budget, which Claude Code's cap on a hook's output sets; an implementation's library names it, and foundation, which every block may hold, needs no label.
  - Only the axes in the digest, without the chapters: an agent could not tell which chapter of a block governs its work without listing every folder.
  - The base at the block's root: one axis laid out unlike the other two, and `with/` both beside the axes and inside them.
  - The front matter in a chapter: it covers the whole block, and a passport at the root holds it whatever the axes.
  - A required main chapter `<axis>/<id>.md` in every axis: 26 of them held the title alone, it repeats the block's id in every path, and an introduction in it would repeat what the axis means for every block.
  - An optional main chapter: a reader could not tell an axis's first file from its others.
  - The setup prose and the Requirements table in a chapter: they describe the block whole, not one subject of it.
  - A `Foundation` folder drawn by the site alone: the site would show a layout the repository does not have.
  - A chapter named after core's chapter first: it tied every block to core's words and scattered rules into one-rule files.
  - Sections optional: a reader of a short file meets rules with no part named.
  - The order in placement, printed again by the digest with each chapter's Governs line: the order lived in a chapter of rules, and the digest spent its budget repeating what the chapters open with.
- **Why.** One form for every axis reads the same in every block, in the digest, the presets and the site; a chapter's name says what its rules govern, so one name finds a subject across blocks, and a block's id names only the file that says what the block is (owner).

## ADR-0212 — Every configuration names its parts, which one computation in the hook lists

**Date:** 2026-10-19 · **Status:** Superseded by ADR-0234

- **Decision.**
  - A project's configuration of a tool names, by its path in the release, every part its unit takes (`configuration-takes-every-part-of-its-blocks`, a rule of core's tools, which lefthook's `hooks-from-the-shared-preset` now carries out): a unit is the repository or a member of its workspace, each with blocks of its own, and a folder that keeps a tool's configuration of its own and is no unit is an `unlisted` warning, found by the templates' file names in any language. For each unit, scope, active tool with parts in that scope and axis the unit follows, it takes the parts that exist of `self`, `core`, the scope's language and then every other active block in the digest's order, whether or not they bind a rule. At the root of a workspace a tool with a `workspace` part takes only the workspace parts of the axes the root follows, and `self`, since the root runs it only for what crosses the packages: dependency-cruiser's root holding every part refused each import of the packages it cruises, its layer matrix written from a package's `src/`.
  - The path shows in one way for every tool: an include, where the tool lists files; a marker line `# from <path>, …` over a chain's end, where it extends one file (Ruff, rumdl); a copy of the part between `# from <path>` and `# end <path>`, where it reads no other file (ShellCheck, import-linter, complexipy, deptry, vulture), what the project keeps outside the pair being its own; the command that passes it, where the tool takes its configuration on the command line (ty, hadolint, DCLint, yamlfmt, OSV-Scanner), in the runner the unit already uses for its scope: a script of `package.json`, a poe task of `pyproject.toml`, a task of the unit's own `mise.toml` in any other scope; only what checks the whole repository is a task of the root's.
  - A configuration that joins its parts in code — knip's, Stryker's, syncpack's, dependency-cruiser's — is the part imports and one call of `join` from the release's `presets/typescript/join.mjs`, which appends each part's lists and merges its tables, so a part only adds, in one order for every tool, and joins the project's own settings last; a module the configurations of a scope share sits at the scope's root, `presets/<scope>/<name>.<ext>`, which `blocks:check` accepts in `common` and in a language — a form of preset file beside those ADR-0094 lists, which it amends; it holds no setting, since only a part is bound to a rule. dependency-cruiser's `extends`, which keeps the first of two rules of one name, gives way to that join, and its rule against development dependencies in production is built over the development files every part names: core's part names the specs, storybook's the stories, and typescript's part builds the rule without naming either, in a `settingsOver(developmentFiles)` that returns a table of settings; `join` reads the parts imported as modules and joins that table after them like any part, so neither a configuration nor `join` names a tool's setting.
  - Where a configuration lives is the repository's own layout, read tool by tool: a tool is served, for a unit, by the nearest file at or above the unit's folder that bears a name of the tool's template and names the tool's parts, and that file takes the parts of every unit it serves, so a tool configured once at the root takes every unit's that keeps no file of its own, and a file several tools share, `pyproject.toml` or `mise.toml`, serves only the tools it names. A tool no file serves for a unit, and no file below the unit's folder configures, is `wired nowhere` for it. A tool whose parts form a chain takes each link a taken part extends, as Ruff's `fastapi.toml` extends `pytest.toml`.
  - A template is a fragment its block owns, `templates/project/<scope>/<block>/<path>`, and `/constitution:ratify` assembles a file of one path from the fragments of the active blocks; every tool with parts has a fragment of its configuration that takes them by `<parts>`, which `blocks:check` holds (`preset-tool-without-template`, `template-names-no-block`, `template-scope-not-covered`). Python's `pyproject.toml` is one fragment per block — the project and its build for `python`, a table for each tool — and import-linter's contracts are parts by axis with their bindings.
  - The computation is `hooks/lib/wiring.awk`, a stage of its own after the hook's readers of `constitution.yaml` and the blocks, so that its failure costs the digest one warning that it cannot check the wiring: `hooks/wiring.sh` prints it for ratify, and the session-start hook checks each configuration a template names — at each unit's root, and in any folder git tracks — and gives one `wiring` warning to a file that lacks a part, names one it does not take, or holds a copy whose text between its two lines is no longer the part's. A part counts as named only by its path under the release or a pack, and only outside a comment. A pack's presets and templates count as the release's, named by the pack's path. An override of the rule lowers it for the repository or a unit.
- **Rejected.**
  - The rule in `mise`, beside the archive's install: it would bind only projects that pin the release by mise, though a configuration taken from an archive fetched another way needs it as much, and lefthook's rule could not carry it out.
  - A front-matter field in each block naming the files it gives and how its tool takes parts: a second description of what the template folder already holds, which a renamed file leaves stale.
  - The computation in TypeScript, a command of the release: a Python project would need Bun to run ratify's first step, and the hook, which runs on bash and awk, would need a second reader of the same blocks.
  - A check of its own, a command the project runs: it reports only when someone runs it, while the digest shows a stale configuration to the agent at the start of every session.
  - Kinds of tools, each with its own placeholder and its own check: one contract, the part's path visible in the file, holds them all, and a template says how the path appears.
  - The parts of the bindings alone: a part that binds no rule, a tool's binaries for knip say, is still needed, and a project could not tell the parts it lacks.
  - The release's version in a marker, compared with the installed one: every release would warn of every copy, changed or not, and a release step would have to rewrite the markers of the projects; the copy's text says itself whether it drifted.
  - A marker that leaves a part out, `# without <path>` with its reason: a second way to opt out beside the override, which records the reason where the project's departures are read.
  - Every command line in the root's `mise.toml`: the root then names a package's files, while each unit already runs its checks.
  - A folder of templates, or a marker, for the files the root alone holds: the repository's own layout already says which unit a file serves, and ratify keeps it.
  - A chain cut so that each optional part extends only the language's: Ruff extends one file, so a project with two optional parts could not take both.
  - For dependency-cruiser, the blocks' parts before the language's, or typescript's rule naming the story's form: the first breaks the one order of parts, the second puts a library's file in a language's part.
  - The join written into each configuration that needs it: a dozen copies in one repository alone, each to be kept equal by hand, and every configuration a program its owner had to read.
  - One file per tool and unit decided by the file's name alone: a `pyproject.toml` or `mise.toml` at a package's root, holding another tool's settings, would have hidden the root's file of a tool it does not name.
- **Why.** The settings that hold a project's rules then change with its blocks and its release: one computation decides which parts a unit takes, ratify writes them, and the next session shows a configuration that drifted (owner).

## ADR-0213 — A package keeps the configuration of each tool in its folder, knip's included

**Date:** 2026-10-19 · **Status:** Superseded by ADR-0227

- **Decision.** Every package of the workspace keeps the configuration of each tool it runs in its own folder; the root holds only what crosses the packages — a tool's `self` and its `workspace` parts — and what checks the whole repository, which a file at the root serves when no package configures the tool below it. A package with parts of its own keeps a `biome.json` with `"root": false` in its folder, which extends the shared parts and its own through `.droneey/constitution`, a link the folder keeps to the root's; the root's `biome.json` extends the shared parts alone (`biome-configuration-in-the-unit`). One `biome check` from the root checks each file by the nearest configuration. Every other tool keeps a package's configuration in its folder (`unit-configuration-kept-in-its-folder`), knip included: each package runs knip by its own `knip.config.ts`, with its own parts, ignores and script, and the root's configuration covers the root's own files and leaves the packages to theirs by `ignoreWorkspaces`.
- **Rejected.** knip's packages under `workspaces['<path>']` of the root's configuration, as ADR-0151 had them: the root then imported every package's parts, against what the root knows of a workspace — its members and what crosses them — and a package moved to a repository of its own left its configuration behind. A configuration per unit at the root, run with `--config-path`: the root knew every unit's parts.
- **Why.** What holds a package lives with the package; knip, run in a package's folder with its configuration, checks it as the root's run did, so nothing kept it at the root (owner).

## ADR-0214 — A seam belongs to the block whose behaviour it governs, and holds only what needs both blocks

**Date:** 2026-10-21 · **Status:** Accepted

- **Decision.** A rule sits in a seam, `<axis>/with/<block>.md`, only when it loses its meaning without either of its two blocks; one that keeps its meaning without one of them sits in the other, and one that tightens a rule of a third block, beyond what the holder requires or extends, sits in a seam with that block (`rule-placed-in-a-seam-only-when-it-needs-both-blocks`). A seam is read in one direction: its rules govern how the block that holds it behaves while the other is active, so a pair of blocks may hold a seam on each side when each adapts to the other (`seam-held-by-the-block-whose-behaviour-it-constrains`). A seam never pairs a block with core or with a block linked to it by `requires` or `extends`, directly or through another, and `blocks:check` reports such a seam (`seam-along-a-dependency`).
- **Rejected.**
  - A seam as a file of the pair outside both blocks, `composition/<a>+<b>/`: the pair loses which block adapts to which, and a reader of a block no longer finds the ways it changes beside another.
  - The block of the more specific layer, or a host — the block whose file, run or hook the other plugs into — as the owner of a pair of one layer: a host is undefined between two domains or two contexts, ambiguous between several pairs of implementations, and ADR-0003 already names a block one cannot work without a host, which is a `requires`.
- **Why.** The holder of a rule follows from its statement, so no pair needs a rule of its own to say where its seam goes; and a seam that one block alone gives meaning to hides its rule from the projects that have that block without the other (owner).

## ADR-0215 — HTML, JSON, TOML and Dockerfile are languages, and Compose is an implementation

**Date:** 2026-10-21 · **Status:** Accepted

- **Decision.** `html`, `json`, `toml` and `dockerfile` are language blocks. `html` takes the markup rules of `browser` — elements, attributes, ARIA, landmarks, the skip link, the viewport, `lang` — with their seams with `ui` and `design-system`, and adds the doctype, `utf-8` declared first, ids unique in a document and boolean attributes written by presence; `react-dom` and `tailwind`, which write markup, require it, and a program that writes HTML files by hand lists it, while React Native never reaches it. `json` holds strict JSON unless its reader takes comments, `.jsonc` for a file with comments, unique keys and a configuration's `$schema`; `toml` a backslash in a literal string, TOML 1.0 until every reader takes 1.1, and a large table written as a section. `dockerfile` takes the Dockerfile's rules of `docker`, whose pin narrows to `FROM`; `docker` becomes the implementation `compose`, which requires `yaml`, keeps the Compose rules and pins each service's image; `docker-files-linted-in-the-check` goes, since core's `rule-held-by-a-tool-where-one-can` says it, and osv-scanner's scan of images splits into seams with `dockerfile` and `compose`. `html`, `json` and `toml` own no word of the dictionary; `dockerfile` owns `Dockerfile` and `.dockerignore`. This amends ADR-0092 and reverses ADR-0095's rejection of an `html` block.
- **Rejected.**
  - The markup rules in `browser`: an email, a webview or Electron renders HTML without a browser platform, and a browser program that only draws on a canvas has almost none.
  - `browser` requiring `html`: a platform requires no language (ADR-0003), and the blocks that write markup say so themselves.
  - One `docker` block for both files: a Dockerfile is a language other builders read too, while Compose is one tool's format over YAML.
- **Why.** A rule sits where it loses its meaning, and each of these formats is read by tools whose configuration a project keeps in it (owner).

## ADR-0216 — A language governs only its files, a manifest belongs to its ecosystem, and a block requires the language of its configuration

**Date:** 2026-10-21 · **Status:** Accepted

- **Decision.** A language's `governs` lists only its files' extensions, never a manifest or a tool's configuration; `typescript` governs `.js`, `.mjs` and `.cjs` too. `package.json` is the format the JavaScript runtimes read, so it belongs to an abstract implementation `_js-runtime`, which requires `typescript` and `json` and which `bun` extends: it holds the module type, `exports`, `imports` and the `#/` alias of the source root — with the rules of `typescript` that rested on that alias — `engines`, `files`, ranges and peers, `private`, the scope's name, the scripts' shell and the further entry, and `tsc`'s mirror of the aliases becomes `tsc/with/_js-runtime`; `bun` keeps what is Bun's or its package manager's — `bunfig.toml`, `bun.lock`, `trustedDependencies`, `workspaces` and `workspace:*`, `bun build` and `bun publish`. The base comes before its second heir, against ADR-0004's wait for one, because Node and Deno read the same manifest (owner). `[project]` (PEP 621) and `[dependency-groups]` (PEP 735) are Python's own specification, so their rules stay in `python`, while `uv` keeps `[tool.uv]`, `uv.lock` and `uv_build`. A block requires the language of every configuration file it governs, directly or through another requirement, and `blocks:check` reports one that does not (`configuration-language-not-required`): `biome` requires `json` and no longer `typescript`, `_js-runtime` `json`, `bun` `toml`, `uv`, `ruff` and the other tools of `pyproject.toml` `toml`, `lefthook` and `compose` `yaml`, and `vite` requires `_js-runtime` as its host. `poe` is an implementation block for the Python task runner and owns `[tool.poe]`. syncpack reads `package.json`, so its scope is `json`: its parts move to `presets/json/syncpack/`, the exact pin of the tools to `_js-runtime`'s part, and the caret group of the program's dependencies to the `distribution` part beside `dependency-declared-with-a-caret`, so a project that publishes nothing no longer has its dependencies' ranges checked. A preset part implements a rule on that rule's axis or one that stands on it, so dependency-cruiser's entries for `unit-reached-only-through-its-entries` live in its `foundation/` part. This amends ADR-0004, ADR-0096 and ADR-0134.
- **Rejected.**
  - Manifests in the languages' `governs`: a language knows its syntax, while `package.json` is the runtimes' and `pyproject.toml` the packaging tools' file.
  - The rules of `package.json` in `bun`: Node and Deno read the same manifest, and a block for either would repeat every rule.
  - The caret group kept in `_js-runtime`'s part, unbound: a part is named after the block its settings need, and the carets' rule is `distribution`'s.
  - The rules of `[project]` in `uv`: PEP 621 is Python's own, which pip, hatch and Poetry read as well, and the placement chapter puts a language's own specification in its context.
- **Why.** Every tool a project lists brings the language its configuration is written in, and every rule sits with the specification that gives it its meaning (owner).

## ADR-0217 — Every unit declares its blocks in a constitution.yaml of its own, found through the workspace's declaration

**Date:** 2026-10-23 · **Status:** Accepted

- **Decision.** The root of a repository and each member of its workspace that follows the Constitution keep a `constitution.yaml` of their own, of one schema — `axes`, the blocks by layer, `packs` and `overrides` — and the root's alone also names `check`, the one command the hand-back waits on; the `packages` key goes, and a file that still writes it is warned of. The members are those the workspace declares where its package managers read them: the globs of `workspaces` in the root's `package.json` that reach a folder holding a `package.json`, and those of uv's `members` in the root's `pyproject.toml` that reach a folder holding a `pyproject.toml`, less what a `!` glob or uv's `exclude` leaves out. Nothing passes from one file to another: a member follows only the axes, blocks and overrides its own file lists, and a block of a pack only when it lists the pack, by its path from its own folder. A member with no `constitution.yaml`, or with one that cannot be read or does not parse, is a `config` warning of the declaration, which the digest and `constitution presets check` give. The project around a folder is the farthest folder with a `constitution.yaml` up to the root of its repository. This amends ADR-0020, ADR-0150, ADR-0151, ADR-0212 and ADR-0213, and reverses their rejection of units read from the manifests.
- **Rejected.**
  - The root listing every package's blocks under `packages:`, as ADR-0150 and ADR-0212 had it: the root reaches into its packages, and a package moved to a repository of its own leaves its rules behind.
  - A listing of the packages in a file of its own beside the root's: a second declaration of the members beside the one the package managers already read, which drifts from it.
- **Why.** What holds a unit lives with the unit, as the configuration of its tools already does (ADR-0213), and the workspace declares its members once, in the manifests that link them (owner).

## ADR-0218 — The root's configuration of a tool no member follows serves every unit; otherwise each configuration serves its own unit

**Date:** 2026-10-23 · **Status:** Accepted

- **Decision.** A tool that no member of the workspace follows, only the root, is served for every unit by the root's configuration, which takes the parts of all their blocks, their axes joined — lefthook, syncpack, betterleaks and git here, the root's `lefthook.yaml` taking Ruff's hook when only a Python package runs Ruff. A tool that at least one member follows — Biome, knip, tsc, dependency-cruiser, rumdl, yamllint, OSV-Scanner and the rest here — is served for each unit by that unit's own configuration, in its folder, which takes the parts of that unit's blocks alone; the root's configuration then serves the root, and a member that keeps none is wired nowhere. `constitution presets check` and `constitution presets plan` read which units a configuration serves from these declarations alone. This amends ADR-0212, whose file served only the units that take its tool, and ADR-0213, whose root held only what crosses the packages and what checks the whole repository.
- **Rejected.**
  - A tool whose block lists no language in `languages`, read as one of the repository: an accidental signal, which misses syncpack, whose block lists `json` though it keeps one configuration for the repository.
  - A `scope: repository` field in the block's front matter: a second declaration of what the units' declarations already say.
  - Which units keep a file of the tool, read as which ones it serves: it depends on files rather than on the declaration, and changes its meaning when a file is missing.
- **Why.** What serves the units is read from what they follow (owner).
- **Superseded in part.** `git` among the tools only the root follows, by ADR-0228: each package enables it.
- **Superseded in part.** The root taking the entries of every unit's blocks, by ADR-0234: the root is a unit and lists only what its own files need; a tool only the root follows still serves the whole repository.

## ADR-0219 — A term lives in the rule that defines it

**Date:** 2026-10-24 · **Status:** Accepted

- **Decision.**
  - A term is defined once, in bold, in the rule or the passport text that says what it is: a concept in plain bold, `**binding unit**`, lower-cased when it opens a sentence as a lead-in closed by `.` or `:`; a folder, a suffix or a file in bold around a code span, ``**`widgets/`**``, ``**`.stories`**``, ``**`renovate.json`**``; a brand or an API as it is written, `**TanStack Start**`, ``**`createServerFn`**``. A folder ends in `/` and a suffix starts with `.`. Bold is a definition only outside inline code and code fences, and is never emphasis.
  - A term's owner is the block of the file that defines it, and its axis that file's axis: a passport and `foundation/` are foundation's, and a seam takes its folder's. A brand is defined in its block's passport; a file, a command or an API of a tool in that passport, or in the foundation chapter or seam whose rule says what it is; a concept, a folder or a suffix of the architecture or the workflow in the chapter of its axis whose rule, or opening paragraph, says what it is — core's in core, a folder or a suffix a block adds to the tree in that block, as core's `layout` says.
  - `blocks:check` refuses a term defined twice; a term of the architecture or of the workflow used in a chapter or a seam of another axis, a passport speaking of its whole block; a term used in a file whose block cannot reach its owner, core's terms being every block's; a folder or a suffix written in backticks without its `/` or its `.` where its owner is in reach; and bold that is neither plain words nor one code span.
  - The site lists every term, its owner, its axis and its sentence, on the Terms page.
- **Rejected.**
  - `vocabulary.yaml`, the words of the architecture and of the workflow kept apart from the rules: a word sat in one file and its meaning in another, the two drifted, and nothing said which block a word belonged to.
  - A `dictionary` of brands, APIs and file names in each passport's front matter: a list that named a word without saying what it is, beside prose that said it again.
  - A glossary file, or a glossary section per block: a third place for a meaning the rule already states, and one more list to keep in step with it.
- **Why.** The rule that says what a word means is where a reader looks for it, and one bold span there gives the check its owner, its axis and its spelling with nothing kept beside it.
- **Superseded in part.** The form of a folder's and a suffix's definition, by ADR-0232: it carries an id after its bold.

## ADR-0220 — A change mutates only its changed lines and its new files

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.** `every-mutant-killed` holds the mutants of a change's changed lines and of every line of its new files. A change to a spec alone mutates nothing: its subject and the files it loads are no longer mutated whole. Which specs run for a mutant is unchanged: in TypeScript, the specs that load the mutated file. `mutation-check` and `mutmut-check` select their targets so; `mutation:all` still mutates everything.
- **Rejected.**
  - Mutating whole the file a changed spec is named after and every file it loads inside its boundary (#214): the run grew with the size of the code a spec reaches, not with the change, and blew CI's budget — 9,301 mutants on #377.
  - A scheduled full run off the pull request's path: the owner wants no workflow after merging.
  - An advisory score that gates nothing, as Google uses: the owner keeps the gate at every mutant killed.
- **Why.** Mutants tie to what a change touches, so the gate's cost follows the change, as Google's, Infection's, Arcmutate's and cargo-mutants' runs on a change do.

## ADR-0221 — A case pins meaning, never wording, held by a Biome plugin

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.** `case-pins-meaning-never-wording` binds as MUST, and the TypeScript preset holds it with the plugin `case-pins-meaning-never-wording.grit`, bound in the `core` part beside `case-named-should-when` and `case-holds-no-logic` and applied to spec files. In a spec it refuses prose — three words in a row, in any script — written as the expected value of the strict and containment matchers and of `toThrow`. The one table or golden case of a renderer pins the wording: its rows reach the assertion through a variable, and a golden that must write its text in the assertion carries `biome-ignore lint/plugin/case-pins-meaning-never-wording: <reason>`. The program follows the rule itself: its findings and warnings carry a code and their values, and it renders their text at the edge from one table per format.
- **Rejected.**
  - Keeping it a SHOULD and fixing the specs once: the pattern comes back with the next spec.
  - A runner's lint or a stock Biome rule: none refuses prose in an expected value.
  - Refusing every string literal in an assertion: codes, ids, paths and values are what a case should compare.
  - Refusing prose at any depth of an expected value, or in any `message:` property: a check of syntax cannot tell the program's wording from parsed data a case compares by meaning, and a key's name is no meaning, so it would refuse sound cases and pass the same wording under another name; what keeps wording out of specs beyond the expected value is that the program's findings carry no text.
  - Exempting renderer specs by path: that hides a fragile assertion in the same file; a suppression names the plugin and its reason in the one place.
  - Binding it in `bun-test`: the rule is core's, and `core` already holds the plugins of core's rules about cases, which read the same Jest-style calls.
- **Why.** As a SHOULD no tool held, the rule was not kept: the domain built message text, specs compared it, and one rewording broke specs across the suite; a MUST only a reviewer checks fails the same way, while a plugin refuses the pattern as it is written.

## ADR-0222 — A named parameter type only where the function is exported, and Arrange only where a case arranges something, both held by Biome plugins

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - `parameter-object-has-a-named-type` stays a SHOULD and narrows: the object a function takes is typed by a named type when the function is exported by its module or is a member of an exported type, as a port's is; a function inside its module may type it inline. A type not declared by us is derived from its source — `Parameters<typeof lib.fn>[0]`, `ReturnType<typeof lib.parse>` — never typed again. The TypeScript preset holds it with the plugin `parameter-object-has-a-named-type.grit`, bound in the `typescript` part, which reads syntax alone: an object type written inline as the type of a parameter of a function the module exports directly or names in an `export { … }` list, or of a method or a function-typed property of an interface or a type alias it exports so.
  - `case-split-by-arrange-act-assert-comments` stays a MUST and loosens one part: the Arrange may be left out when the case arranges nothing, as when a table's row gives every input, and is never left empty; Act and Assert are always there, once each and in that order, and a lifecycle or an end-to-end case repeats its Act and Assert pairs. The Act still makes one call, which no tool holds. The plugin `case-split-by-arrange-act-assert-comments.grit`, bound in the `core` part beside the other plugins of core's rules about cases, reads the comments from the text of each case's callback, since Biome keeps comments as trivia no node pattern reaches: each opens a line of its own, and the sections run Arrange, then Act and Assert pairs, ending on an Assert. An Arrange that only copied the row into a local is deleted across the repository.
- **Rejected.**
  - A named type for every parameter object, the rule as it stood: a helper inside its module gains a type no caller builds, and the module grows a declaration for each call it makes to itself.
  - Telling the exported functions by the suffix of their file: a suffix says what a file holds, not what it exports, and a file renamed or a helper exported from a `.utils.ts` escapes it, so the plugin reads the exports themselves.
  - Deriving our own functions' input types with `Parameters<typeof fn>[0]`: the type then has no name a caller or a spec can build by, and the shape is still written inline where the function is.
  - An empty Arrange kept for form: a comment over nothing tells the reader nothing, and a section that must be there gets filled with a copy of the row.
  - Holding the sections by review alone: the rule binds every case, and a MUST no tool checks drifts, as ADR-0221 found for wording.
- **Why.** A type is worth its name where a caller meets it, at the module's edge and in a contract, and each rule is kept where a plugin refuses what breaks it rather than where a reviewer must notice.

## ADR-0223 — One enumeration per closed set, a listed subset derives its type, a signature's types are its contract, colour on request, test ids for what no one perceives, and mutants run the gate's specs

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - Core's `closed-name-set-declared-once`: a closed set of named values the program owns is declared once, as one enumeration whose members the code reaches by name. TypeScript's `closed-name-set-is-a-string-enum` and Python's `enumeration-is-a-unique-str-enum` keep their forms under it, a string `enum` and a `StrEnum` marked `@unique`.
  - TypeScript's `enum-subset-listed-by-its-members`, under core's `declared-values-never-typed-again`: a subset of an enum that the program lists is an `as const` array of the members, and its type is derived from that array beside it, `(typeof LOWERED_LEVELS)[number]`; a subset the program only types stays a union of the members. `derivable-types-derived-inline` names the exception: that type is named beside its array, the one place the subset is named. The plugin `closed-name-set-is-a-string-enum.grit` passes `(typeof X)[number]` where the file declares `X` as an `as const` array of member expressions, and refuses it otherwise.
  - `dead-code-deleted`: a type that names a part of an exported function's signature — its parameter object, its result — is part of the function's contract, not dead, though only specs import it.
  - `styling-only-on-a-terminal`: an explicit request for colour turns colour on whatever the stream, in this order — a flag first, `--no-color` over `--color`; then a non-empty `NO_COLOR` turns colour off; then `FORCE_COLOR` set to any non-empty value, `0` included, turns it on without a terminal; then the terminal and `TERM` decide. design-cli's `chooseOutput` kept that order, and now forces colour on any non-empty `FORCE_COLOR`, where it read Node's `0` and `false` as off and an empty one as on; `2` and `3` still choose a deeper palette. A row of its spec proves `NO_COLOR` over `FORCE_COLOR`.
  - ui's `element-found-by-role-label-or-text`: an element no person perceives — hidden from assistive technology, or a framework's own element — is found by an attribute the code that renders it sets for the spec, and a selector the program configures a framework with is checked by one spec, through that same constant. The seam with react-dom names the form: that spec queries the selector with its reason in the suppression and asserts the element it must name — in the docs, that `PAGE_SCROLLER_SELECTOR`, which the router scrolls back to the top, names the main article's parent, so a wrapper a Fumadocs upgrade adds fails it. testing-library's `queries-by-role-label-text` finds it by `getByTestId`, through the test id its renderer reads, and the seam with react-dom, `spec-never-selects-from-the-document`, names that attribute, `data-testid`. Playwright's `locators-by-role-label-text` still refuses `getByTestId`. The plugin is renamed `spec-never-selects-from-the-document.grit`, no longer refuses `getByTestId`, and still refuses `querySelector` and `querySelectorAll`. The glide's block, the docs' table of contents and the version menu's mark carry a test id, and the docs specs find them by it.
  - Core's `every-mutant-killed`: each mutant runs against the specs the coverage gate counts — the integration specs of code over an engine the sandbox runs among them — and never the end-to-end specs. mutmut's `mutants-run-without-the-gates` keeps its form, `-o "norecursedirs=.* e2e"` in `pytest_add_cli_args`, and pytest's `integration-folders-not-collected` lets a run that collects the integration specs lift them. The template and both Python packages follow it, and the packages' unit run leaves `integration` out as the template's does; Stryker's `bunfig.mutation.toml` already left only the end-to-end specs out.
- **Rejected.**
  - The enumeration rule written in each language alone: two languages stated one meaning twice, and a third would state it again.
  - A subset typed as a union beside its array, as `LayerField`, `ListField` and `LoweredLevel` were: one list written twice drifts. An array for every subset the program only types: nothing would read it.
  - A plugin that follows the array into the file it is imported from: Grit reads one file, so a type derived from an imported array is refused and is derived beside its array instead.
  - Keeping only the exports production code imports, as the review proposed: a caller and a spec could no longer name the value they build for the function or receive from it.
  - `FORCE_COLOR` over `NO_COLOR`, as Node.js's `lib/internal/tty.js` reads them: a variable a tool or a CI image injects would silently override the person's own opt-out; CPython 3.14's `_colorize` and bixense.com's clicolors page, which in 2026 retires `CLICOLOR_FORCE` for `FORCE_COLOR`, read `NO_COLOR` first. `0` and `false` read as off, as Node.js does: force-color.org forces colour on any non-empty value, and CPython does the same.
  - `FORCE_COLOR` over the flags, as force-color.org's example reads it: no-color.org's FAQ has a run's own argument override the environment, and `NO_COLOR` over `--color` breaks the same order.
  - `getByTestId` kept forbidden, with a suppression on every case of a decorative element, or `querySelector` by the attribute the styles read: the suppressions were the rule's normal case, and a spec that selects by a styling hook breaks when the styles change; Testing Library names the test id as the fallback where no role or text can match. The exception in testing-library alone: a child cannot be looser than ui's rule it tightens. A configured selector proved only by the end-to-end run, or by a test id added to the framework's element: the router reads the selector, not a test id, and only a query through the same constant proves the two agree; Testing Library keeps `querySelector` as the escape hatch for such a deliberate contract, and TanStack Router's guide hands `scrollToTopSelectors` such a selector.
  - The specs of a mutant's run stated by mutmut and pytest: the choice is the same for every runner, so it is core's, beside the gate whose specs it reuses; a rule of its own under `every-mutant-killed`: core's rules tighten no rule of core.
  - The integration specs kept in the packages' unit run, their workaround: the unit run then reached the file system; integration left out of each mutant's run: 37 of python-check's 704 mutants had no spec to kill them.
- **Why.** Each meaning now sits in the layer whose loss voids it, and each rule states what the code and the tools do: one declaration per closed set and per listed subset, the contract a caller writes against, the order no-color.org, force-color.org, bixense.com/clicolors and CPython give colour, Testing Library's priority of queries and its escape hatch, and a mutation run that proves code by the same specs as the coverage gate.

## ADR-0224 — Biome formats YAML, tombi formats TOML, and yamlfmt goes

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - YAML: Biome, from 2.6 on — pinned at 2.6.2, the newest past the three-day cooldown — formats every YAML file of a unit by the unit's own parts. Its part `yaml/biome/foundation/self.jsonc` writes single quotes, which dclint's rule for Compose already asks of a port; the width is the 100 of every other formatter, and yamllint's `line-length` comes down from 120 to it. Biome's part for `mise`, `common/biome/foundation/mise.jsonc`, leaves out the lockfiles mise writes under `.mise/locks`. Biome 2.6 also formats and lints Markdown by default, so `common/biome/foundation/self.jsonc` turns both off, and rumdl stays the formatter of Markdown (`one-formatter-per-language`). The block `yamlfmt` goes with its preset, its template, its part of lefthook and its part of knip.
  - TOML: the block `tombi` (`languages: [toml]`, `tombi-is-the-formatter → one-formatter-per-language`) formats and lints every TOML file with tombi, pinned at 1.9.0, the newest past the cooldown. tombi reads only the `tombi.toml` of the folder it runs in or above, and no other file from it, so each unit with TOML keeps its own `tombi.toml` with the parts copied between their lines, and runs `toml:check` (`tombi format --check && tombi lint`) and `toml:fix` in its folder; the root's skips the folders the members lie in by `<unit folders>`, which the wiring check reads as it reads rumdl's. The part turns off the order a schema would impose on keys and on the items of an array. tombi's part for `mise` leaves the lockfiles out; `packages/constitution`'s own lines leave out the templates whose `<copied parts>` is no TOML, and turn off the lint of the files whose placeholders fail the schema tombi takes from their names. lefthook's part `tombi.yaml` formats the root's staged files, and the root's `lefthook.yaml` gives each unit a job of its own. A fragment names the block on a line `# tombi — …`, since tombi reads a comment that opens with `tombi:` as its directive.
- **Rejected.**
  - yamlfmt 0.21.0, kept beside Biome: from 2.6 Biome formats YAML by default, and two formatters of one language break `one-formatter-per-language`. yamlfmt had no release in ten months and 52 open issues, ten of them about comments it moves; no editor runs it; `gitignore_excludes` fails outside a git tree; and its rewrite of flow collections into blocks is held already by yamllint's `braces` and `brackets`.
  - Prettier for YAML: on our files it writes what Biome writes, as one more Node tool.
  - dprint with `pretty_yaml` or its TOML plugin: a plugin runtime that downloads wasm, plugins of one maintainer, and no check of a file against its schema; its one edge, a trailing comma on an array it breaks, is not worth the runtime.
  - yamlfix: GPL-3.0, absent from mise, no release in 2026.
  - Biome's default double quotes: dclint's Compose rule asks for single quotes in `ports`, so one quote for all YAML is the single one.
  - taplo 0.10.0: no release since May 2025, 246 open issues, and its released `taplo lint` fails on today's SchemaStore catalog.
  - pyproject-fmt and toml-sort: one file, or one concern, each.
  - The order a schema gives keys and array items, tombi's default: it reorders the `[tool.*]` tables of `pyproject.toml` and moves the `# from` and `# end` lines of a copied part away from the keys they hold.
  - One `tombi.toml` at the root for every unit: tombi applies only the configuration of the folder a run starts from, and a unit moved to a repository of its own would leave its settings behind.
  - tombi 1.9.4 and Biome 2.6.3, the newest releases on the day: both inside the three-day cooldown of ADR-0202.
- **Why.** Each language has one formatter, kept alive and checking each file against its schema where one is known, and each unit holds its files by its own configuration (owner).

## ADR-0225 — The diagnostics ignorer leaves out the text arguments a library's part names, a route file is no surface, and a Biome plugin is declared in one part

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - `diagnostic-mutants-left-out-by-the-ignorer`: the archive's `diagnostics` ignorer also leaves out the mutants inside the argument a library's method takes as text only a person reads, such as its help. Stryker's key `diagnosticsTextArguments` names them, by the method and the argument's index, and the part of the library's block gives it: the stryker part `commander.mjs`, bound under `commander` to `every-mutant-killed`, names commander's text arguments — `description`, `summary`, `usage`, the heading of a group, and the description `option`, `requiredOption`, `createOption`, `argument`, `createArgument`, `default`, `helpOption`, `helpCommand`, `version` and `addHelpText` take after their flags or names. The ignorer is a factory plugin that reads the key from the options Stryker injects, and it declares the key in its `strykerValidationSchema`, as Stryker's own runners and checkers declare theirs, so Stryker does not warn of it. A command of the Constitution writes its help inline in those calls and gives its examples through `addHelpText`, and no `// Stryker disable … restore` range is left around help text.
  - Biome 2.6 runs every entry of one plugin path over the union of their `includes` (Biome's PR #11408, issue #6851), where 2.5.15 kept only the last entry extended; `biome inspect plugins` lists such a plugin for files "matching any of" its lists. A part that declares a plugin again with fewer files therefore narrows nothing, so each plugin is declared in exactly one entry of one part, and a preset spec holds it.
  - `surface-only-re-exports`: a file route is no surface, though TanStack Router names one `index.tsx`. The language's architecture part `typescript.jsonc` leaves out every `index.tsx` under `src/root/`: a surface is a folder's `index.ts`, and a `.tsx` index there is a registration the framework places in the root's folder. The root's own surface and those of its role folders stay checked.
  - `undefined-is-the-only-absence`, `closed-name-set-is-a-string-enum` and `biome-refuses-empty-names` are declared only by the architecture parts, which leave out adapters and wire models, and `libs/`; the `.grit` files stay in `foundation/`, whose parts no longer declare them. A project without the architecture axis leaves the three to review until the presets catalogue (#372) merges the entries of one plugin.
- **Rejected.**
  - commander's method names written into mutation-check: the ignorer would know one library, and a project with another parser of command lines would have no way to name its own.
  - The text ranges kept under `// Stryker disable … restore`: each command repeats the range and its reason, and a range left open past the text hides the mutants of the code below it.
  - A nested key, `diagnosticsIgnorer.textArguments`: the parts are joined one level deep, so a second library's part would replace the first's table.
  - Examples given after the help, `addHelpText('after')`, as commander's documentation shows: `help-leads-with-examples` puts them first; the description now comes from one `beforeAll` text of the program and the examples from each command's `before` text, ahead of the usage the layout formats.
  - A suppression on each route, the rule's normal case there; the language part leaving out `routes/`, which would name the router in TypeScript's part; leaving out all of `src/root/`, which stops checking the root's surface, which the entry files import.
  - A `$filename` guard inside the `.grit` file: the rule's code then carries the folders a part scopes, in a second place, and reads differently from one project to the next.
  - An override that sets `linter.enabled: false` over the files left out: it turns off every rule there, not one plugin, and an override cannot turn a single plugin off.
  - A `biome-ignore-all` in each file left out: every project repeats in its files what the preset knows.
  - Pinning Biome 2.5: it keeps a behaviour Biome has replaced, and holds back every later fix.
  - A nested `biome.json` in each folder left out: a configuration per folder in every project, which the presets, built of parts, cannot give.
- **Why.** The ignorer keeps to mutants no caller relies on, now known by the library's own contract as well as by their form, and each library's part says which of its arguments those are; a plugin's files are then read in one entry, so what a part leaves out is what Biome leaves out.
- **Superseded in part.** The commander part and one plugin per part, by ADR-0234: commander's text arguments are the preset file `stryker/foundation/with/commander`, and a plugin is declared once by its address; the ignorer's names of loggers and errors, by ADR-0236.

## ADR-0226 — A rule states its Why alone, and a review reads every rule

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - A rule's table is `| Why |`, one column and one row. The Tags column leaves all 1,822 rules, core's statement of the rule format, the chapter template, the docs and the site's rule card. `blocks:check` reads no tags: `rule-tags-not-a-list`, `tag-not-a-lens` and the program's list of lenses go, and a rule still written in the old form is reported for its header and for a row of two cells.
  - `/constitution:check` takes only its scope, `edits` or `all`, and the reviewer judges every rule of the blocks that govern a file.
  - A decision this log replaces keeps its entry under the status `Superseded by ADR-NNNN`, as the project's template already asks, and `blocks:check` accepts that status; an entry changed in part keeps its status and names the part in a line **Superseded in part.**, as ADR-0089 and ADR-0160 now do for the tags.
- **Rejected.**
  - Keeping the tags for the site's badges: 801 of the 1,820 rules of v0.83.0 had none, the rest were chosen by eye, and a mark nothing checks drifts, as the `architecture` tag did (ADR-0088).
  - A review narrowed to one lens: it skips every rule whose writer did not think of that lens, and passes for a full review while it reads part of the rules; the reviewer already reads each governing block whole.
  - Tags as a linter's categories, as Biome groups its rules: a linter runs and configures its rules by group, while nothing here selects rules but the blocks a project follows.
  - The Why as a `**Why:**` label instead of a table: ADR-0089 rejected labels, which run on into the statement, and `blocks:check` already refuses any label but Example.
  - Deleting a replaced entry, as this log did until now: a later reader who proposes the old choice again finds neither it nor why it lost; MADR and Nygard's format both keep it, marked superseded.
- **Why.** A rule is its statement and its reason; the tags asked a judgement of every writer, and only a filter that reviews less than the rules ask ever read them.

## ADR-0227 — A package keeps the configuration of each tool in its folder, and Biome runs in it

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.** Every package of the workspace keeps the configuration of each tool it runs in its own folder; the root holds only what crosses the packages — a tool's `self` and its `workspace` parts — and what checks the whole repository, which a file at the root serves when no package configures the tool below it. A package with parts of its own keeps a `biome.json` with `"root": true` in its folder, which extends the shared parts and its own through `.droneey/constitution`, a link the folder keeps to the root's, and Biome runs in that folder; the root's `biome.json` extends the shared parts alone and skips the folders the packages lie in (`biome-configuration-in-the-unit`). Every other tool keeps a package's configuration in its folder (`unit-configuration-kept-in-its-folder`), knip included: each package runs knip by its own `knip.config.ts`, with its own parts, ignores and script, and the root's configuration covers the root's own files and leaves the packages to theirs by `ignoreWorkspaces`. This replaces ADR-0213, whose packages took `"root": false` and were checked by one run from the root.
- **Rejected.**
  - `"root": false` with one `biome check` from the root, as ADR-0213 had it. Tried on Biome 2.6.2, it holds each package to its own parts and keeps the root's from them, but a run under a nested configuration, even one started in the package's folder, starts from the root and loads every `biome.json` below it, past the package's own `files.includes` and its `.gitignore`: the templates of `packages/constitution`, whose `<parts>` is no path, and the sandboxes Stryker leaves under `.stryker-tmp`, fail every run of every package, and the root would have to name them, with each member that keeps no `biome.json`, to skip them.
  - knip's packages under `workspaces['<path>']` of the root's configuration, as ADR-0151 had them: the root then imported every package's parts, and a package moved to a repository of its own left its configuration behind.
  - A configuration per unit at the root, run with `--config-path`: the root knew every unit's parts.
- **Why.** What holds a package lives with the package, and a package that is its own root keeps its templates and its tools' sandboxes to itself (owner).

## ADR-0228 — Each package enables the `git` block

**Date:** 2026-10-23 · **Status:** Accepted

- **Decision.** Every package of the workspace enables the `git` block in its own `constitution.yaml`, with the `version-control` domain it requires. A package keeps its own `.gitignore`, its build and cache patterns in it, and its configurations take `git`'s parts — Biome's, which reads that file — as ADR-0218 has it for a tool a member follows. `git` leaves ADR-0218's list of the tools only the root follows; lefthook, syncpack and betterleaks stay on it.
- **Rejected.** `git` followed by the root alone, as ADR-0218 listed it: a package is its own Biome root (ADR-0227) and reads no configuration above its folder, so the setting that reads its `.gitignore` would be one the package writes by hand, which no part holds; and that `.gitignore` would answer to the rules of a block its unit does not follow.
- **Why.** A package that keeps an ignore file, and runs the tools that read it, follows the block that governs that file (owner).

## ADR-0229 — The design theme is built before each script that reads it, and is not committed

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - The theme each design platform package generates from the tokens — `design-browser`'s stylesheets in `src/libs/ui/theme/`, `design-cli`'s modules of constants in `src/libs/ui/theme/constants/` — is ignored by git, as `generated-files-not-committed` asks. Each platform's `build` script writes it through `design-tokens build`, which writes a file only when its content differs, under a fresh name beside it then renamed over it, so builds started side by side never leave a file half written.
  - Every script that reads the theme builds it first through a `pre<script>` hook. `design-cli` runs its own `bun run build` before `type:check`, `test`, `mutation:check`, `mutation:all`, `architecture:check` and `unused:check`; `design-browser`'s own scripts read none of its stylesheets, and take none. A unit that depends on one runs `bun run --filter '<its own name>^...' build`, which builds every unit it depends on that has a `build`, by name, without listing them: `packages/constitution` before its type check, each of its spec scripts, `blocks:check` and its mutation runs, `apps/docs` before `dev`, `build`, `build:release`, its type check, specs and mutation runs, and the root before `build:cli`. A script that reads no dependency's files, as a unit's `architecture:check` and `unused:check` read none of another unit's, takes no hook.
  - `design:check`, which failed when the committed theme was stale, goes, with the runner's `check` command and its stage in `check`.
  - ADR-0062's check that "generates nothing" changes nothing git tracks: a step may write untracked build output that the check then reads, never a tracked file.
- **Rejected.**
  - Committing the theme with a drift check, as until now: the exception of `generated-files-not-committed` for a file a fresh clone's check needs before any build runs no longer applies once the check builds it, and the committed copy filled every diff of the tokens and needed a step of its own.
  - A `postinstall` or `prepare` script: the release workflow and the docs image install with `--ignore-scripts`, and a change to the tokens after the install leaves the theme stale until the next one.
  - Git hooks such as `post-checkout` and `post-merge`: they run on a developer's machine alone, never in CI or an image, and miss an edit to the tokens.
  - Turborepo or Nx and their `dependsOn: ["^build"]`: a second task runner and its cache for two builds of about a second each, while Bun 1.4.3's `--filter '<name>^...'` selects the same dependencies, and its `pre<script>` hooks run for a script run directly, by `--filter <name>` and by `--filter '*'`.
  - A compiled `dist` for the platform packages now: it comes with their move to a repository of their own, together with the React Compiler and a CSS entry, and extends the `build` script this decision names.
- **Why.** A generated file is built where it is read, so no copy drifts from its source and no check guards one; a hook on each reading script keeps every way in — a direct run, a unit's filter, the root's sequential and parallel stages, a release — fresh without a tool of its own (owner).

## ADR-0230 — Every formatter indents by two spaces and wraps at 100 columns, a rule of core

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.** Core's `formatters-share-one-indent-and-width`, beside `one-formatter-per-language` in `foundation/tools.md`, holds what Biome's, tombi's, Ruff's and shfmt's rules each repeated: two spaces wherever a language leaves the indent to its formatter, and 100 columns wherever a formatter breaks lines. Each tool's rule keeps `→ one-formatter-per-language` and only its own form — Biome's quotes, Ruff's docstrings, tombi's order of keys, shfmt's `case`. The settings that hold the width and the indent are bound to the core rule: Biome's `indentStyle`, `indentWidth` and `lineWidth` in `common/biome/foundation/self.jsonc`, tombi's `indent-width` and `line-width`, Ruff's `indent-width` and `line-length`, and yamllint's `indentation`, which checks the indent Biome writes into YAML; yamllint's `line-length` also fails a line Biome cannot break, more than the rule asks, and holds no rule. ADR-0126's width of 100 for Biome and ADR-0127's two spaces and 100 for Ruff stand, now as one rule over every formatter.
- **Rejected.**
  - A rule that every formatter wraps at 100 without its clause: rumdl breaks no line, since `MD013` is off and a Markdown paragraph is one line, and shfmt breaks none either.
  - Two spaces in every language without its clause: CommonMark aligns what continues an ordered list's item with its text, which rumdl's `MD007` keeps.
  - Each tool's rule tightening the core rule instead of `one-formatter-per-language`: what each keeps — its languages, its quotes, its order of keys — tightens which formatter a language has and how it writes, not the indent or the width, and a rule has one parent.
  - `max_line_length = 100` under `# core` in `.editorconfig`: Biome's own `lineWidth` wins over it, Ruff and tombi read no `.editorconfig`, rumdl's `MD013` that would read it is off, and an editor that wraps by it would break the Markdown lines no formatter breaks.
- **Why.** A choice every formatter shares is one rule of the layer that owns formatters, written once, and each tool states only what is its own.

## ADR-0231 — A unit names its package in `constitution.yaml`

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - `constitution.yaml` takes `name`, the name of the unit's package as its manifest gives it — `name` of its `package.json`, or `name` under `[project]` of its `pyproject.toml` — read verbatim, so a name that opens with `@` is quoted, for the presets to write where a tool's configuration names its package.
  - `/constitution:ratify` writes it in every file, the root's and each member's, from the template's `name: <name>`. A file that leaves it out, or writes it empty or `null`, names no package and is no warning; only an entry that needs the name reports a unit without one.
- **Rejected.**
  - Reading the name from the unit's manifest: the program would then read `package.json`, `pyproject.toml` and the manifest of every language a block brings, a folder holding two packages would have two names, and what a configuration is given would sit in a file `constitution.yaml` does not show.
  - The folder's name when `name` is missing: a configuration would carry a name no manifest gives, and nothing would tell the owner.
  - `name` required as every other key is, a warning when it is missing: every project ratified before would warn of a key no setting it takes needs.
- **Why.** The unit's name is declared where the unit is, read as written, and asked for only where a setting needs it (owner).

## ADR-0232 — A folder or a suffix carries a stable id, and the paths rules give are terms

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - Every folder and suffix term carries an id right after its bold, ``**`adapters/`**{#gateway}``. The id names what the folder holds — `port`, `use-case`, `helper` — and a suffix whose file is a member of a folder of that meaning takes the folder's id followed by `-file`: `.adapter` is `gateway-file`, `.utils` is `helper-file`. It is lower-case words and digits joined by hyphens, opening with a letter, unique across every term, and never changed: a folder renamed edits only its definition, and whatever names the role by its id follows. The owner chose the ids of the blocks' folders and suffixes once, in one table.
  - The kernel reads the id with the term, and the model of the blocks gives each role its id. `blocks:check` refuses a folder or a suffix without an id (`term-without-id`), an id of another form (`term-id-misshapen`) and an id two terms carry (`term-id-repeated`).
  - The names rules give as paths are terms: core's `foundation/layout` defines `src/`, `__tests__/`, `tests/` and `e2e/`, and TanStack Router's `foundation/routes` defines `routes/`. They sit on the foundation axis, since settings of the foundation axis name them — the production set, the exclusions of the specs, the fixtures a runner preloads — and a term is used on its own axis or one that stands on it. A block that names one of them without its `/` writes it with it, and Expo's routes, which cannot reach TanStack Router's term, name their folder by the router's own setting.
  - The site makes each id the anchor of its bold, and the Terms page links a folder or a suffix to it; no page, description, search record or text for language models shows the braces.
- **Rejected.**
  - The id as the term's spelling on the day it was defined, `adapters`, `adapter`: an id with no choice in it, but one that misleads once the folder is renamed, and a folder and a suffix spelt alike would still need two.
  - One key for a folder and its suffix, as the first prototype had it: a setting that names a file must tell the folder from the file.
  - The id in an HTML comment after the bold, ``**`adapters/`**<!-- #gateway -->``: the site compiles the blocks as Markdown, not MDX, so the braces break no build, and rumdl and the check accept them.
  - `src/`, `tests/` and `e2e/` on the architecture axis, beside the tree that draws them: the foundation settings that name them would then name a term of an axis a project may leave out.
  - `__tests__/` in TypeScript's block, whose rule names it: Biome, which does not reach TypeScript's block, names it in its exclusions too.
  - `routes/` in the `ui` domain, which both routers reach: a screen needs no file router, and a CLI's interface has no routes.
- **Why.** A role named by its spelling is renamed in every place that names it; one named by an id chosen for its meaning is renamed in one line, and the check keeps every role named.

## ADR-0233 — `.editorconfig` is the editorconfig block's file, listed explicitly

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - `editorconfig` is an implementation of no language that requires nothing and governs `.editorconfig`; its passport says what the file sets, and it holds no rule of its own. Its template gives every file two spaces, LF and UTF-8, and `root = true`; shfmt's fragment adds the indent of a `case`'s branches.
  - shfmt requires it, since shfmt reads its options only from that file, so a project that lists shfmt lists `editorconfig`, as this repository's units do.
- **Rejected.**
  - Core's template writing `.editorconfig` for every project, as it did: a file no rule asks for written silently, beside a section for shfmt in a block that cannot name shfmt.
  - A rule of the block for the indent: core's `formatters-share-one-indent-and-width` already holds it, and the file is one more place that setting is written.
- **Why.** A file a tool reads is the block's that governs it, and a project sees in its `constitution.yaml` every block that writes into it.

## ADR-0234 — The presets are entries keyed by the rules they hold, which the program writes into the project's own files

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - A tool's settings live in preset files, `presets/<reader>/<axis>.yaml`, with a setting that needs a block beyond the reader's reach under `with/<block>.yaml` and a second one under that file's `with/<partner>.yaml`. An entry is keyed by its block, the rule it holds or `*`, the reader's language or `*`, and the file it writes, a guard after the file's name where a fact decides it. A list item is addressed by a field, `list[field=value]`, a place in a list by a slot, `list@name`; `!replace` replaces what the blocks before gave, and `!default` is written once, while the setting is missing, and never checked again. The facts are `${constitution.path}`, `${package.name}`, `${role.<id>}` and `${workspace.members}`; the guards `${file.isTop}` and `${workspace.isRoot}`, each with `!`.
  - `constitution presets apply` computes each unit's files from the release's preset files and those of the unit's packs — a package's own in `<package>/pack/` — and writes them into the project's own files, keeping their comments and the settings the project wrote; one `constitution.lock` per unit records what it wrote, so a setting no entry gives any longer leaves the file. `presets plan` shows the computation, and `presets check`, `constitution check` and the session-start digest report a setting missing, stale, loosened or a file that does not parse.
  - The rules: core's `configuration-holds-what-its-blocks-compute` and `own-settings-only-add` replace `configuration-takes-every-part-of-its-blocks`; core's placement gains `Presets`, with `setting-placed-by-its-reader-and-key-rule` and `setting-names-folders-by-their-terms`; the workspace's `root-lists-only-what-its-own-files-need` replaces `root-configuration-serves-only-what-crosses-the-packages`, and lefthook's `hooks-from-the-shared-preset` tightens the new rule.
  - The words: a preset set is every preset of one pack, as a block set is every block; a preset file is one YAML file of it; an entry is one setting. `constitution check` runs three steps, each named by what it checks: `Blocks`, the block set; `Presets`, the preset sets against the blocks; `Configurations`, each unit's files against what the presets compute.
  - The release's format is 4; the parts, `bindings.yaml`, `join.mjs` and `templates/project/` go, and the hook computes no wiring of its own.
- **Rejected.**
  - Parts the project extends or joins: half the tools have no `extends`, so their configurations were programs that joined parts, copies drifted from their parts, and an override could not take out one rule's settings.
  - Templates ratify assembles: an agent's attention for what a program does the same way every time.
  - The computation in the hook's awk beside the program: two readers of the same blocks, as ADR-0212 had to keep.
  - A static check that every setting holds a rule: a tool's own opinion needs none, keyed by `*`.
  - One lock for the repository: a package moved to a repository of its own takes its lock with it.
  - Generated files of their own beside the project's: two files of one tool, or a tool that reads only one, and the project's settings no longer beside the rules' settings it reads.
  - A package's own pack in `constitution/`, as the first draft had it: `packages/constitution/constitution/` read like the Constitution itself (owner). In `.droneey/pack/`: the release's folder is git-ignored whole, so only `.droneey/constitution` would be ignored everywhere, and rules a person writes would hide in a dot folder; `.constitution/`, the same confusion; `rules/`, as the pack holds preset files too; `conventions/`; `packs/own/`, a level more for the one pack most projects keep; `local/`, already ignored as working notes.
- **Why.** A rule's settings are found by the rule, written by code rather than an agent, leave with the rule's override, and every drift shows as a finding of the check.

## ADR-0235 — A tool configured by JavaScript takes a data file the program writes

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** knip reads `knip.jsonc`, dependency-cruiser `.dependency-cruiser.json`, Stryker `stryker.config.json` and syncpack `.syncpackrc.yaml`, each by the name the tool reads by default, and their blocks govern those files; the package scripts name them.
- **Rejected.**
  - A JavaScript module the program writes: the program would edit code, and a project's own code in the module could not be kept beside the entries.
  - A module that imports a data file the program writes: two files for one tool, and a project's settings in the module that the check never reads.
  - `.syncpackrc.json`: the owner chose YAML, which keeps comments.
- **Why.** A data file is read and rewritten with its comments kept, and the check compares it with the presets setting by setting.

## ADR-0236 — The diagnostics ignorer knows only the shapes of the calls its configuration names

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** `diagnostics` leaves out the mutants of a text argument — the text, or the expression that builds it, an object or a list aside, which carries data — of a call whose shape `diagnosticsTextArguments` names: a function's or a method's name, or a constructor's after `new `, with `*` for any letters, and the index or indexes of its text arguments. The entries come from the blocks whose rules make that text a person's: core's `failure-told-apart-by-code` gives `new *Error` its first argument, pino's preset file its levels' messages, at the first or the second argument, and commander's its help. `diagnostic-mutants-left-out-by-the-ignorer` says so.
- **Rejected.**
  - The names of loggers, `log`, `logger` or `…Logger`, and the suffix `Error` written into mutation-check: the ignorer guessed a project's names, left out another call that matched them, and kept the mutants of a logger named otherwise without a word.
  - The whole log call left out: the ignorer would know logging, which no entry could name or take back.
- **Why.** What a person alone reads is a fact of a library's or a rule's contract, so the block that owns it gives the entry, and a call no block names keeps its mutants, which the run shows.

## ADR-0237 — A file of the release a preset names is there, or its build list makes it from a source that is

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - A path from the release that an entry names, `${constitution.path}/…`, is sound if the file is there, or if the pack's build list names it and the source it is built from is there. The list is data in the pack's `package.json`, under `release`: each built file, by its path in the archive, to its source and how it is built — Bun's bundle or Python's `zipapp`. The repository's `build` script makes every file from that list, so the list and the build cannot drift.
  - The check of the presets holds every entry of every block to this, on every pull request, whatever blocks a unit here follows. Nothing tells a source tree from an archive: in a project's installed release the built file is there; in this repository the list and the source are.
  - The finding is `missing-release-file`, on the preset file that names the path.
- **Rejected.**
  - Skipping a folder named `dist`: the program would know one layout of builds.
  - A port of build outputs answered from the pack's `.gitignore`: the ignore file says what is not committed, not what the build makes.
  - Checking only the values in force in the units, and every entry at release by unpacking the archive: two mechanisms, and a missing source found only when a release is cut.
  - Building before the check: the owner keeps builds out of this repository's check.
  - A reference that resolves to the sources here and to the build in a project, through `--conditions` or `imports`: Stryker's workers drop the flag, Bun ignores `NODE_OPTIONS` for it, and a project's file cannot reach the archive by such a specifier.
  - A list of the build's outputs kept by hand beside the build script: it drifts from the build, where one list that drives it cannot.
- **Why.** One rule holds every release path on every change, and the list that proves a built file is the one that builds it.
- **Superseded in part.** The build list under `release` in the pack's `package.json` and the repository's build of it, by ADR-0249: each package builds itself, the archive's map names the packages' outputs, and the finding is `missing-archive-file`.

## ADR-0238 — A file is at the top among the units that get the same entry

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** `${file.isTop}` holds for an entry in a unit when no unit above it gets that same entry. uv reads `[tool.uv]` only from a workspace's root and otherwise takes a package's own whole, the nearest table with no merge; so a uv package below a root that writes `pyproject.toml` for Python alone still gets its `[tool.uv]`, and a member of a uv root does not.
- **Rejected.**
  - The top among the units that write a file of the same name, from any entry: a root's `pyproject.toml` of another block took `[tool.uv]` from the package under it, where uv would never read it.
  - A guard per tool, such as a fact naming uv's workspace: the program would know a tool's reading where one fact over the entries serves every tool that reads the nearest file.
- **Why.** Whether a unit above holds a setting for a unit below is a fact of the entry, not of the file's name.

## ADR-0239 — Code that only builds a package sits in `scripts/`, beside `src/`

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.** Core's layout gives the code that builds or generates a package and never ships with it a term of its own, `scripts/`{#build-code}, beside `src/`, and `build-code-kept-out-of-the-source` keeps it out of `src/`. The presets check it as code — the compiler, the linter, knip, mutation testing — while the rules on what shipped code may import read `src/` alone. The Constitution's release build and the design packages' Style Dictionary configuration move there, and the three exceptions their own packs gave dependency-cruiser go.
- **Rejected.**
  - The shipped code found by what the published entries reach: it holds for JavaScript alone, needs the entries and the development dependencies computed, an application's entries per framework, and loses the exclusions of peer and type-only imports.
  - A role folder inside `src/` for build code: the import rules would keep an exception for its path.
- **Why.** A folder tells shipped code from build code with no computation, so every rule on shipped code reads one folder with no exception.

## ADR-0240 — A language spells a folder its own way by defining the term under the same id

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - A block may define a term with the id of a term of a block it builds on, spelled as it writes it: Python's layout defines `use_cases/` and `value_objects/` under core's `use-case` and `invariant-value`, and only the folders Python spells otherwise. `term-id-repeated` allows that repeat in a block that builds on the other, and refuses it anywhere else.
  - `${role.<id>}` resolves for an entry to the spelling of the most specific block its language reaches; an entry of every language reads it through the blocks of its key and its preset file's path. The Python presets name their folders by id — import-linter's module patterns, python-check's homes, pytest, poe, vulture and mutmut — and `setting-names-folders-by-their-terms` keeps no exception for a language.
- **Rejected.**
  - A `folderCase` field on a language that turns every spelling into its own case: one more mechanism, which would also respell the folders the language writes as core does.
  - An exception in the rule for a language whose module paths join words by underscores: those settings kept their folders spelled by hand, so a folder renamed in its term left them behind.
- **Why.** A language's spelling is one more definition of the same role, kept where the language's rules are, and every setting reaches it by the role's one id.

## ADR-0241 — Tools run as scripts named by their action, and the program runs each unit's check

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - A tool's block writes its commands into the unit's manifest, through its pairing with the unit's runner block — `package.json` scripts for Bun, `[tool.poe.tasks]` for Poe — as settings the check holds, not defaults: a drift is reported, and a unit's deviation goes through its own pack. Each is named by its action first, `check:<what>`, `test:<what>`, `fix:<what>`; the runner block holds `check`, `test` and `fix`, each running every script of its prefix in the order of their names — `bun run --sequential 'check:*'`, `bun run --parallel 'test:*'`, and a Poe task that runs each task of its prefix — and a part or a helper is named outside the prefixes, `program:test`. The mutation tool's scripts form their own action with no task of it: `mutate:branch`, the gate on the lines the branch changed, and `mutate:all`, every mutant, run by hand. A unit's `check` is its whole gate — its `check:` group, then its `test`, then `mutate:branch`, each where the unit has it, `bun run --sequential 'check:*' test mutate:branch` — composed from the slots `checks`, `tests` and `mutations` its runner places and its tools' pairings fill, so the unit proves itself without the program and names no script it lacks. `_task-runner`'s `task-group-run-by-its-prefix` says so, which Bun's `script-group-run-by-its-prefix` and Poe's `task-group-walks-poes-own-list` tighten (ADR-0242). A project's own `check:docs` joins the check by its name.
  - The program's entry points are computed, never written: a runner block gives, as entries of the target `${constitution.run}`, which no path can be, the commands of `check`, `test` and `fix` — the unit's own `bun run check`, Poe's `uv run --locked poe check` — so two runners of one unit both run. The lists are keyed to `_task-runner`'s `unit-run-through-its-action-tasks`, apart from the naming rules, so a unit that lowers a runner's naming rule still runs its check (ADR-0242). A pack's runner block is taken as the release's.
  - `constitution run <check|test|fix>` runs them: the unit's around the folder, or from the root every unit's, the root's first, each command written before it runs, stopping at the first that fails. `constitution presets apply` ends by running the `fix` of each unit it wrote a file of; `--no-fix` leaves the files as written. A tool's block requires the runner it needs, and a unit whose runners pair with none of its tool's preset files is the finding `tool-without-runner` (ADR-0242).
  - `constitution.yaml` names no `check`, and the session's check is `constitution run check`.
- **Rejected.**
  - A `check:` line the user writes: a second list of the tools beside their blocks, which drifted from them.
  - A `commands:` field in a block's front matter: a second mechanism without the merge, the clash detection or a pack's override the preset entries have.
  - The tool commands computed and run by the program, with no script: a second model beside the files, and a command invisible in the manifest a person reads.
  - The scripts as defaults, written once: a rule's command went unrun where a unit lacked it, as design-tokens' integration specs did.
  - mise tasks, or `.config/mise/conf.d`: every unit tied to mise.
  - The program as a full task runner, with the files a fix takes: Bun hands no argument on to the scripts a pattern runs, verified on Bun 1.4.3, so `{files}` would reach none of them.
  - The chains kept by hand, `bun run test:unit && bun run test:integration`: they drifted — design-tokens' integration specs never ran.
  - `check` as `'check:*'` alone, the specs and the mutants as separate entries of the program: a unit run alone would skip its specs and its mutation gate.
  - The mutation gate as `check:mutation`: the fast static run, `'check:*'` by hand, would mutate too.
- **Why.** The manifest shows every command the check runs, each written by the block whose rule it holds, and the program finds what to run from the same entries, so adding a tool or a check of one's own is a name, not an edit of a list.

## ADR-0242 — An abstract task-runner block holds what every runner does

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - `_task-runner`, an abstract implementation block, holds the two rules every runner keeps:
    - `task-group-run-by-its-prefix`: tasks are named action first, and the task named by the action runs every task of its prefix.
    - `unit-run-through-its-action-tasks`: the runner gives the program the commands that run a unit's `check`, `test` and `fix`.
  - `_js-runtime` extends it, so Bun does through `_js-runtime`; Poe extends it directly. `extends` stays one value.
  - Bun's `script-group-run-by-its-prefix` and Poe's `task-group-walks-poes-own-list` tighten the first rule. Each keeps only how it runs a group: Bun by its pattern, Poe by walking `poe _list_tasks`.
  - The `${constitution.run}` entries are keyed to the second rule.
  - A tool block whose commands a runner writes requires the abstract runner it needs: `_js-runtime` for dependency-cruiser and Stryker, which only a JavaScript runtime runs; `_task-runner` for every other tool. A unit with such a tool and no runner then fails the requirement.
  - `tool-without-runner` stays for what the requirement cannot see: a runner that pairs with none of a unit's tools. It holds for every runner and language in one way: a runner is a reader whose preset files give `${constitution.run}`, and a tool is a block its preset files pair with a runner.
- **Rejected.**
  - The rule in core: it would bind a repository that runs no task runner.
  - A domain: domains are kinds of product.
  - A list for `extends`: multiple inheritance needs precedence rules for one case.
- **Why.** What every runner does is stated once, each runner says only how it does it, and a missing runner is a failed requirement the check already reports.

## ADR-0243 — A preset value that holds a rule is held; `!default` writes only a starter file

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - Every preset value that a rule depends on is written as a held setting. A drift from it is reported, and a deviation goes through the unit's own pack. This covers:
    - the `.gitignore` lists;
    - bun-test's coverage gate, order and ignored paths;
    - Stryker's mutation config;
    - `trustedDependencies`;
    - uv's `build-system`;
    - Python's `requires-python`;
    - tsc's `include`;
    - the hadolint and dclint tasks.
  - `!default` stays only for a starter file or value that the user owns after the first write and on whose content no rule depends:
    - the test fixtures: sandbox, DOM, lingui;
    - pytest's `conftest.py` example;
    - Biome's `$schema`;
    - a Python unit's `name`, `version` and `dependencies`.
  - The `.gitignore` lists are re-cut:
    - a base list every unit takes, keyed to `machine-local-files-ignored` and git's environment and key-file rules;
    - per-block lists, each keyed to `gitignore-covers-dependencies-output-and-caches` or the key-file rule, where the block runs;
    - the working-notes line on the workflow axis.
  - Lines for servers, foreign IDEs and other package managers are dropped. Each unit's own lines are kept.
- **Rejected.**
  - `!default` for everything the presets give: a setting a rule depends on went unchecked after its first write. Design-tokens' unit run kept its own coverage, and the units' lists drifted.
  - One `.gitignore` list for every project: lines for tools a project does not use, and no home for a tool's cache beside its block.
- **Why.** The check holds what the rules hold, and a file a user is meant to own is written once and left to them.
- **Amendment, 2026-10-28.** The entry first named ts-reset's `reset.d.ts` and NestJS's `.swcrc` among the `!default` starter files, as whole texts in no format the program reads back. Both left `!default`:
  - `.swcrc` is written as keyed JSONC (`!jsonc`): the decorator-metadata keys are held under `nestjs-keeps-decorator-metadata`, and the rest under `*`.
  - `reset.d.ts` is held by its import line, through the lines format with `//` comments, under `reset-loaded-in-applications`.

## ADR-0244 — A map a preset marks `!sorted` keeps its keys in their order as texts

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - A preset marks a map of a JSON or YAML file `!sorted`. The program writes its keys, the project's own among them, in their order as texts, and `presets check` reports one the file orders otherwise (`unsorted`).
  - Bun's `scripts` are marked, so each action's script heads its group: `check`, `check:lint`, …, `fix`, `fix:lint`, …, `test`, `test:unit`. A new script lands in its group whatever apply added before.
- **Rejected.**
  - Biome's `useSortedKeys`: it sorts every object of the file, the manifest's own fields among them, and is scoped by path, not by key.
  - Biome's `useSortedPackageJson`: it orders the manifest's fields by its own convention and puts a `pre` script before its script, not in the order of texts.
  - The action scripts closing the list, with each new script placed before them: the order depended on what apply added when, and needed a rule of its own for every map.
- **Why.** One order that needs no memory of past applies; the mark is the preset's, so the tool that writes the file keeps it.

## ADR-0245 — Each unit holds the imports it makes into the other units; the root cruises none

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - The root knows that `apps/` and `packages/` hold units, never what lies inside them. It runs no import check over the units' files, so the root's cross-unit cruise, its script and its pack's entry go, and a root with no code of its own leaves `dependency-cruiser` out.
  - Each unit's own `.dependency-cruiser.jsonc` holds the imports the unit makes into the others (`cruiser-configuration-per-unit`, which now says so, replaces `imports-between-units-held-at-the-root`). From the unit's own run an import shows where it lands, relative to the unit, so `unit-reached-only-through-its-entries` is held by `other-unit-reached-by-its-name`: a relative import that lands outside the unit is refused, and an import by name passes, which resolution takes only through the entries the manifest's `exports` publish. The rule knows no exception: data several units share lives in a unit of its own and is taken by that unit's name through its entry, as `file-lives-once-across-units` and Bun's `shared-data-bundled-by-the-build` now say — this repository's `brand.tokens.json` moved from the root into `packages/brand`, `@droneey/constitution-brand`. `packages-never-import-apps` is held by `packages-know-no-app`: an import that lands under `apps/` from a unit's run is one only a package can make. `apps-blind-to-each-other` is held in each app's own run, its entry guarded by the folder that holds the unit (ADR-0248). Both look at the unit's own files only, never at the modules of another unit a run follows into; a root with scripts of its own that runs the tool keeps `root-imports-units-by-name`, which knows only that `apps/` and `packages/` hold units.
  - This repository's own rules between the design packages move from the root into those packages' configurations.
  - Likewise the root type-checks no unit and runs no workspace-wide knip: each unit runs its own `tsc -b` and knip, so this repository's root leaves `tsc` and `knip` out, with their project references and workspace configuration.
- **Rejected.**
  - The root's run over every unit's `src/`: the root then reads inside the units and holds rules they do not list.
  - A rule by the module's name: dependency-cruiser's rules see the path an import resolves to, not the name it is written with, and a workspace link resolves to the unit's folder (verified on dependency-cruiser 18.7.0, whose type for it is `undetermined`).
- **Why.** A unit checks what it imports from its own folder, as every other rule of its imports is checked, and a unit moved to a repository of its own takes its checks with it.

## ADR-0246 — A comment names the block that brings each setting

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - In every file whose format holds comments — TOML, YAML, JSONC, a file of sections and a file of lines, never strict JSON — apply writes a comment naming the block that brings a setting above each key, table or item one block alone brings, everything inside it included, once for a run of them back to back; a key or an item several blocks fill takes none, and its own keys and items are named in turn. The block is the first one the entry's preset file is named with, else its reader: `git` for the base list of `.gitignore`, `tsc` for `presets/git/foundation/with/tsc/with/workspace.yaml`.
  - The comment opens a paragraph of its own — a blank line before it, unless it opens the file or follows the line that opens what holds it — and the project's own comments right above what it names stay under it, so an explanation stands directly above the value it explains.
  - A file of lines groups its lines by that block, so the base list of `.gitignore` is one `# git` group.
  - The comment is the program's: a full-line comment that is exactly the name of a block an entry of the file names is taken out before each write and laid again, so it moves and goes with what it names, and a second apply writes nothing. A default, once written, is the project's own and is named by no block. The check compares values, never comments.
- **Rejected.**
  - The group's name from the preset file's `with/` chain or from the rule in words, as before: two names for one block's lines, and a header that read as prose.
  - The block keyed in the entry, the rule's own block: a setting of Vulture keyed to a rule of core would read `# core`.
  - A comment above the first key each block gives in each map it writes into: a key several blocks fill, such as lefthook's `pre-commit`, would carry one comment per block.
  - The block that first writes a key: a key several blocks fill would read as the first one's.
  - A comment on every setting: one block's table would repeat its name on each line.
- **Why.** A reader of a configuration sees which block brought each setting, and so which block to read or lower, without the comments becoming a second copy of the presets.

## ADR-0247 — A configuration the tool reads with comments is written as JSONC

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - A configuration in JSON whose tool reads comments takes the name that tells the program so: Biome's `biome.jsonc`, which Biome finds by itself, and dependency-cruiser's `.dependency-cruiser.jsonc`, which its script names and dependency-cruiser 18.7.0 reads as JSON5 whatever the extension. The comments naming the blocks (ADR-0246) then stand in them too.
  - Strict JSON stays where the tool reads none: `package.json`, and `stryker.config.json`, which Stryker 10.0.0 reads by `JSON.parse` and finds only under a `.json` name.
  - A tool that reads comments in a file it finds only under a `.json` name, tsc's `tsconfig.json`, takes the format mark `!jsonc` on its preset files' key (ADR-0248): JSON with comments under that name, its commas as plain JSON has them.
- **Rejected.**
  - Every configuration kept as `.json`: the comments naming the blocks would be left out of the files that need them most.
  - A `.jsonc` name for a tool that finds only `.json`, such as Stryker: the tool would no longer find its configuration.
- **Why.** The program writes comments only where the file's name says the format holds them, and the tool reads the file it always did.

## ADR-0248 — Facts name the folder that holds a unit and its depth there; a guard compares; a mark names a file's format

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - `${unit.parent}` is the folder at the repository's root that holds the file's unit — `apps` or `packages`, however deep the unit lies in it — and nothing for the repository's own unit.
  - A guard may compare a fact of a text with a text whose facts are resolved: `<file> ? ${unit.parent} = ${role.deployed-unit}` takes the entry where both resolve and are the same, `!` before the fact for the opposite. So `apps-blind-to-each-other` is given only to the units of `apps/`.
  - `${unit.depth}` is how many folders the unit lies below that folder, 2 for `apps/<group>/web`: a unit's own run sees every other app within as many folders up, `^(?:\.\./){1,${unit.depth}}[^./]`, so `apps/<group>/web` is refused `apps/<group>/api` and `apps/web` alike, while a package, one folder further up under `packages/`, passes.
  - A mark after a file's path names the format of its text where its name does not tell it: `!jsonc` writes JSON with comments, its commas as plain JSON has them. tsc's entries key `tsconfig.json !jsonc`.
- **Rejected.**
  - A truth per folder, such as `${unit.isApp}`: the program would name a folder the terms already name, and a new folder would need a new fact.
  - A guard on any inner key: a second condition grammar, as ADR-0234 rejected.
  - A fact of the unit's group folder: a unit's run sees the paths of the others from its own folder, never their group's name, so the rule needs how far up `apps/` lies, which that name does not give.
  - Another app reached one folder up alone, as the rule had it: it missed an app of another group, and an app outside any group seen from inside one.
  - A list of `.json` names the program writes with comments: the generator would name tools.
- **Why.** One fact and one comparison hold every rule that depends on where a unit lies, and a format mark keeps the knowledge of a tool's file with the tool's preset files.

## ADR-0249 — Each package builds itself, generation is not a build, and packing one distribution for each platform is delivery

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - `build` means one thing in every package: build this package. `packages/@mutation-check/typescript` builds its `dist/` (`main.js`, `runner.js`, `ignorers.js`), `packages/python-check` and `packages/@mutation-check/python` each their `.pyz` through Poe's `build` task, and `packages/constitution` the `constitution` executable, its platform target an argument. It never runs in another package's pre-steps.
  - A step that writes sources other packages compile against — the design packages' themes, `*.gen.ts` and their stylesheets — is `generate`, which the tokens' command names too (`design-tokens generate <config>`); the design packages have no `build`, nothing of theirs being shipped but their sources. A package that reads them runs `bun run --filter '<self>^...' generate` before its scripts, where ADR-0229 ran `build`, so the site generates the theme and builds no executable.
  - What a release ships is its **distribution**, one for each platform, `constitution-<platform>.tar.gz`: the content — `package.json`, the blocks, the presets, the templates and the tools — with that platform's `constitution` executable in `bin/`. A project's mise names one asset for each platform, `asset_pattern` under `platforms.<os>-<arch>`, and `bin_path = "bin"`. The word is never shortened: `dist` stays the name of a build's output folder.
  - Packing the distribution is delivery: the CD workflow's step "Pack the distribution" builds each package the distribution takes and lays their outputs into it, then each platform's executable beside them. What it packs is data, `packages/constitution/distribution.json`: each file by its path in the distribution, to the package whose build makes it and the file of that build's output. The CD step reads it, and so does the check of the presets: a `${constitution.path}/…` path is sound if the file is there, or if the map names it and its package declares a `build` (`missing-distribution-file`).
  - "Release" names the delivery itself — the CD workflow, the version and its tag, the installed release — and nothing of building; the compiled `constitution` is the executable, not the program.
- **Rejected.**
  - One package building the others' outputs, as `release-build` did: a package's build then depended on how another builds, and a package that imports `packages/constitution` ran the distribution's build before its own checks.
  - A `build:release` script: a second meaning of build, and packing kept as a package's script when it is a step of delivery.
  - One `build` for both the sources dependents compile against and a package's product: a dependent's pre-step then built every product it depends on, the executable among them for the site.
  - A content tarball for every platform beside an executable for each, as releases shipped until now: two assets for one install, mise's `additional_asset_patterns` joining them, and two words for what a project pins.
  - Other names for what a release ships: *build* is the step that makes a package's output; *artifact* is what a CI job hands the next, as `upload-artifact` does; *archive* is the tar format, whatever it holds; *bundle* is what a bundler writes, as `bun build` does; *package* is a unit with a manifest, and what a registry installs.
- **Why.** Every package is built by the one script of the one name, its dependents build exactly what they import, a project pins one asset that holds everything its platform runs, and what the distribution holds is data the delivery and the check share.

## ADR-0250 — Code in several languages is a group folder of packages, each reached by its name

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - Code that serves one purpose in several languages is a group folder, which is no unit — no manifest, no `constitution.yaml`: a package for each language, `<group>/<language>/`, and, once the languages share something, `<group>/shared/`, a package of data and schemas, never code. Each is named after the group and its folder, `@droneey/eros-typescript`, `@droneey/eros-shared`, `droneey-eros-python`, so the names stay unique, and each takes another only by its name, never by a path: `other-unit-reached-by-its-name` keeps no exception. A generator of a language's types from the shared schemas runs in that language's package, in its `generate`.
  - An app is what is deployed, `apps/<name>/` or `apps/<group>/<name>/`; apps never import each other, in a group or outside it, and what they share lives in `packages/<group>/shared/` and is taken by its name.
  - The `shared/` package has a manifest for each ecosystem that reads it, and gives its files through it: Bun's `exports` for TypeScript; for Python, a uv package whose import package is a namespace package at its root, `module-root = ""` and `namespace = true`, which a Python package names in its dependencies, `{ workspace = true }`, imports and reads through `importlib.resources.files()`. `shared-data-read-through-its-package` replaces `shared-data-linked-into-the-import-package`, and ADR-0159's link of the file into the Python package goes.
  - `code-in-several-languages-holds-a-package-per-language` moves from core's layout to the workspace's tree, where ADR-0199 had kept it in core while such code was one unit: its packages are now several units. Python reads the shared data by importing the shared package and reading through `importlib.resources.files()` of it (`shared-data-read-through-its-import-package`), and its `source-folder-is-a-regular-package` leaves a package of data alone a namespace package. Generation is a step of its own (`generated-file-made-by-its-own-step`, in core), and a unit runs the generation of what it imports, never its build (`unit-generates-what-its-dependents-read`).
  - Bun's workspaces take a group's units by `<top>/<group>/*`, uv's members by `packages/*/python` and the path of every other Python package. This repository names its group folders with a leading `@`, `packages/@design/{tokens,browser,cli}`, which no rule asks; `packages/@mutation-check/{typescript,python}` follows the layout.
- **Rejected.**
  - A library unit with `languages/` packages and a `shared/` they read by a path, as core had it: a package published for one language cannot carry a file outside its folder.
  - A flat `packages/<group>-<language>`: the group is invisible in the tree.
  - A `shared/` whose manifests each consumer decides: kept only as a manifest for each ecosystem that reads it, through its name.
  - The file linked into the Python package, as ADR-0159 had it: a path by another name, and a link a checkout without symbolic links holds as text.
  - The data read by the name of its package in a string, `files('<package>')`: a checker of the declared dependencies then reports the dependency unused.
- **Why.** Every package ships alone with all it holds, a product's packages sit together in one folder of the tree, and data several languages read is reached as every other unit is, by its name through its entry.

## ADR-0251 — Every unit with a Dockerfile scans its image's base stage for vulnerabilities

**Date:** 2026-10-26 · **Status:** Accepted

- **Decision.**
  - OSV-Scanner paired with the dockerfile block gives each unit with a Dockerfile the task `check:audit-image`, through its runner: Bun's script, Poe's task. It builds the stage the rule names `base` — the base image and the system packages, which the shipped stage builds on — from the conventional `Dockerfile` with the unit's folder as context, and scans it. A unit whose Dockerfile or context lies elsewhere replaces the script in its own pack, as `apps/docs` does. The mise task that ran the scan in `apps/docs` goes: mise pins tools, and commands live in the manifest.
  - The image scan checks vulnerabilities only. Core's `dependency-licence-on-the-allowlist` now leaves the system the program runs on — an operating system, an image's base and its system packages — off the list, as that system's own licences govern what runs on it, and `licences-checked-against-the-shared-allowlist` names the dependencies a lockfile names. `apps/docs/osv-scanner.toml`, whose only entry ignored the Alpine packages' licences, goes.
  - The script passes `--config osv-scanner.toml` only where the unit keeps one, as an image's scan finds it in no other way, so a unit without one scans with OSV-Scanner's defaults rather than failing.
  - The built image is tagged `audit-image:base`, since `osv-scanner scan image` takes a tag and not an image ID, and the tag is removed after the scan, whatever its result.
- **Rejected.**
  - A replaceable slot for the Dockerfile's path in a `!words` list: the merge ignores `!replace` on an item a slot inserts, so the unit's path would join the release's and give two `--file` flags.
  - A `docker-bake.json` default naming the file, context and target: a new file convention, with buildx as a dependency.
  - Scanning the shipped stage, with no `--target`: it builds the whole program, and for the site fetches the releases, so the check would take minutes.
  - The `base` convention in the dockerfile language block: it would bind projects that scan no image.
  - The image's licences against the allowlist, with each system's packages ignored in `osv-scanner.toml`: every Alpine or Debian base fails on its GPL packages, and the ignore would only restate that the system is not shipped.
  - A default `osv-scanner.toml` written into each unit: the source scan reads the configuration nearest to each lockfile, so an empty file in a unit would hide the root's entries from that unit's lockfiles.
  - A tag per unit: no fact gives a valid image reference, `@droneey/docs` being none, and the tag lives only for the scan.
- **Why.** A known vulnerability in the system an image runs on is found like one in a lockfile, by the check every unit already runs, while what the project ships stays the only thing held to its licences.

## ADR-0253 — A font token names the kind of text, and a style of text is one typography composite

**Date:** 2026-10-27 · **Status:** Accepted

- **Decision.**
  - `token-name-follows-the-grammar` leaves the concept out of a `font` token, whose category styles nothing but text, and the kind of text takes the role's place, Atlassian's form: `font.body.md`, `font.heading.lg`, `font.code.sm`.
  - A property of text — size, leading, weight, family, tracking — is the scale of a primitive, never a role: `font.size.<step>`, `font.leading.<step>`, `font.weight.<name>`, `font.family.<name>`, `font.tracking.<step>`.
  - A semantic `font` token is one composite of the W3C Design Tokens format's `typography` type, whose `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing` and `lineHeight` refer to those primitives (`font-token-is-one-typography-composite`). The line height is a unitless multiple of the font size, the only form the format's `lineHeight` takes.
- **Rejected.**
  - `font.text.body.md`, the grammar kept as it stood: `text` would repeat in every name of the category and say nothing.
  - A property in the role's place, as Primer's `text-body-size-medium` and `text-body-lineHeight-medium` have it, here `font.text.size.md`: a semantic name would hold a raw value, a style of text would be several tokens a component must keep in step, and a theme that changes one would miss the others.
  - A line height as a length, `24px` or `1.5rem`: the format refuses it, and a fixed length no longer fits once a theme changes the font size.
- **Why.** Read against Primer, Material 3, Spectrum 2, Carbon, Atlassian, Polaris and the format's 2025.10 release, Atlassian's form alone names a style of text by its kind with no segment every name repeats, and the format's composite is the one unit design tools and every platform's output read as a style.

## ADR-0254 — Tailwind reads the tokens through aliases, and a style of text is its text composite

**Date:** 2026-10-27 · **Status:** Accepted

- **Decision.** The tokens' custom properties keep the tokens' names on the root, and Tailwind's theme is a generated layer of aliases in Tailwind's own namespaces, `@theme inline` (`utilities-only-from-tokens`), with `@theme inline reference` for a name that already is Tailwind's (`theme-aliases-the-token-properties`). A typography token becomes Tailwind's text composite, `--text-body-md` with its line height, letter spacing and weight, so one class, `text-body-md`, sets it, and its family, which the composite lacks, is one alias for each kind of text, `--font-body`, so a component writes `text-body-md font-body` and never a primitive's class (`typography-token-aliased-as-a-text-composite`). One `@theme { --*: initial; }` clears Tailwind's default theme (`utilities-only-from-tokens`).
- **Rejected.**
  - An `@utility font-body-md` for each typography token, writing its five properties: a class outside Tailwind's namespaces, which `tailwind-merge` must be taught as a group of its own, and which Tailwind's tooling — the sorting of classes, an editor's completion and preview of a value — does not know as a size of text.
  - Semantic variables named in Tailwind's namespaces, as rozumchik-web's theme declares them, `--text-body-md` on the root for `font.body.md`: a token's name would differ from its variable, and a search for one would miss the other.
- **Why.** On Tailwind 4.3.3, variables on the root alone create no utility, the tokens' `--font-*` names inside a plain `@theme` create font-family utilities of nonsense, `@theme inline` writes the token's variable straight into the utility, and `--*: initial` clears every default scale. Aliases alone keep one name for each token and every utility in Tailwind's namespaces.

## ADR-0255 — Text a person reads is a file kind its mutants leave with, and a format is pinned by a golden file

**Date:** 2026-10-27 · **Status:** Accepted

- **Decision.**
  - Text a unit writes for a person — a message, a command's help, the wording of a report — sits in a `.messages` file (`text-a-person-reads-held-in-a-messages-file`). Stryker's ignorer leaves out that file's string and template mutants, and the text an error hands to `super`; mutmut leaves the module of messages out whole, which a messages file's kind allows by holding no branch, and an exception's text keeps its pragma (`diagnostic-mutants-left-out-by-the-ignorer`, `messages-modules-left-out-by-do-not-mutate`). The gate stays at every mutant killed.
  - The wording and layout of a format are pinned by one golden file for each renderer, never a table of wording cases (`snapshot-readable-by-eye`).
- **Rejected.**
  - Killing text mutants with cases: a case that pins a message proves no bug a caller meets, and fails on every rewording.
  - Leaving text out by a pattern over names or string literals: a pattern guesses, so it hides logic that looks like text and misses text that does not; a file's kind is declared, and a missing entry shows in the run.
  - Lowering the gate below every mutant killed: a threshold lets any mutant live, a real one among them, while leaving out one kind keeps every other mutant held.
  - A table of wording cases for each renderer: it pins each message apart from the layout around it, and a rewording touches the table and every case that reads it, while a golden file shows the whole format as a reader meets it and a run rewrites it.
- **Why.** Specs then carry the cases a caller's behaviour earns, the text stays free to change in one place, and the format is still pinned once, where a reviewer reads it.

## ADR-0256 — A contract another feature answers stays with each feature that asks; only one an outside system answers lifts to the kernel

**Date:** 2026-10-27 · **Status:** Accepted

- **Context.** The kernel held a port, `ProjectSource`, that composition implemented through the project feature. It carried the project feature's entities and failures into the kernel, and forced an import cycle between the kernel's errors and its value objects.
- **Decision.**
  - `contract-lifts-on-its-second-feature` lifts a contract to the kernel only when an outside system answers it, a clock or a mailer, in the same words for the features that ask. A contract another feature answers never lifts: each feature that asks words its own.
  - `feature-asks-another-through-its-own-contract` has the contract hold the asker's parameters, results and the failures it acts on; composition maps the other's results into the asker's terms and those failures into the asker's own, and lets every other failure pass.
  - `type-lifts-when-features-share-its-meaning` lifts a business type to the kernel when two or more features use it with one meaning, universal and stable; otherwise the asking feature declares its own and composition translates.
  - An adapter that answers a feature's contract through another feature lives in the composition module that joins them and imports that feature's surface.
  - `contexts-duplicate-rather-than-share` merges into `type-lifts-when-features-share-its-meaning`, since the two stated one requirement; the merged rule names the narrow view, a reference by identifier among them, and keeps a fact or a rule of the business from being duplicated.
- **Rejected.**
  - Keeping a feature-answered contract liftable to the kernel when two features ask in the same words: the kernel then holds a feature's model and failures, and the answering feature can no longer change them alone.
  - A second kernel folder for the failures that carry values: it removes the cycle but keeps the feature's failures in the kernel.
  - One shared failure type passed through to every asker: the askers then branch on another feature's codes.
  - Every type another feature reads lifts to the kernel: the kernel then grows with each reader and holds types no two features read alike.
- **Why.** What a feature answers is that feature's model, so it stays in the feature, and the kernel holds only what no feature owns.

## ADR-0257 — The unused-code options of the compiler hold dead code, not the type gate

**Date:** 2026-10-28 · **Status:** Accepted

- **Decision.** `noUnusedLocals` and `noUnusedParameters` leave `compiler-is-the-type-gate`; the presets set them under `dead-code-deleted`. Where Biome runs in the same unit, tsc turns off `noUnusedParameters`, `allowUnreachableCode` and `allowUnusedLabels`, since Biome reports unused parameters, unused labels and unreachable code, but keeps `noUnusedLocals`, because Biome's unused-variable rule always lets a local whose name starts with `_` pass, which would loosen `dead-code-deleted`; so unused imports and locals are still reported by both. A unit with tsc alone keeps all of them.
- **Rejected.**
  - Keeping them in the type gate: every unused name is reported twice where Biome runs, and a rule of the compiler stops the linter from holding dead code alone.
  - Turning Biome's unused rules off instead: Biome also lints files outside the compiler's `include`, such as the root config files, which would lose them.
  - Turning `noUnusedLocals` off where Biome runs: an unused local named with a leading underscore would then pass unreported.
- **Why.** Dead code is one rule, held under that rule, with one reporter where a tool can hold it fully.

## ADR-0258 — actionlint alone checks the workflows

**Date:** 2026-10-28 · **Status:** Accepted

- **Decision.** The implementation `actionlint` lints a repository's GitHub Actions workflows, and through the ShellCheck it finds on the `PATH`, the command of each `run:` step. Its default checks hold `runner-value-reaches-the-command-through-the-environment`, for the values GitHub marks untrusted, and with ShellCheck pinned `embedded-command-expansion-double-quoted`; the presets write no `.github/actionlint.yaml`, since no setting of it holds a rule. Its runner gives `check:workflows`, `actionlint -pyflakes=`, to the topmost unit that lists it, pyflakes off since no block pins it, as actionlint reads every workflow of the repository from any folder of it. A finding is silenced under the one workflow's key in `.github/actionlint.yaml` (`actionlint-ignore-names-workflow-and-message`).
- **Rejected.**
  - zizmor beside it, by the owner's choice, which spares one more pinned tool and its configuration for two rules review already carries: the rules its audits would reach — `outside-change-runs-without-secrets`, `credential-has-least-privilege` — stay with review.
  - A block for GitHub Actions itself: the rules on a workflow's commands already sit in the YAML language's seam with the shell, and no rule yet loses its meaning without GitHub alone.
  - The script in every unit that lists the block: each would lint the root's workflows again.
- **Why.** The rules on a workflow's commands were held by no block's tool, and actionlint holds them with its defaults and one pinned tool.

## ADR-0259 — A feature is laid out in Evans' four layers: domain, application, infrastructure, presentation

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** A feature, and a module of composition, holds `domain/` (the model: `entities/<entity>/`, one folder for each entity, enumeration and aggregate — an aggregate's holding its root `.aggregate` and its inner `.entity` files —, `value-objects/`, `services/` for domain services, `errors/`), `application/` (`use-cases/{queries,commands}/<op>/` and `contracts/`, every port a use case asks, data ports in `repositories/` included), `infrastructure/<system>/` (the adapters, formerly `adapters/`, also at the source's top) and `presentation/` (all through which the program is called — a screen, a request, a command, a message, a schedule: `bindings/{queries,commands}/<op>/`, formerly `app/use-cases/`, and an interface's `screens/`, `widgets/` and `components/`, formerly the ui domain's `ui/`). The domain imports no port, no use case and no installed library; the application imports only the domain, the kernel and its own contracts. The repository's own packages move to this tree in the same change.
- **Rejected.**
  - `app/` as the name of the binding layer: a reader who knows DDD takes it for the application layer, and the use case then seemed to live in two places.
  - Use cases inside `domain/` (ADR-0196 kept them there so that `domain/` stays the part programs share across hosts): `application/` is framework-free too, so the reason holds, while the model and the orchestration are no longer one folder no check can split. ADR-0196's rejection of "a use case moved into `app/`" stands for `app/`.
  - Repository interfaces in the domain, as Evans places them: the model never calls a repository, a use case does, so the port sits with the layer that needs it (`contract-declared-by-the-layer-that-needs-it`, as Uncle Bob's gateways and the hexagonal architecture place it), and "the domain imports no port" is one check.
  - `infrastructure/adapters/<system>/`: the infrastructure holds nothing but adapters, so a second level is a folder that only holds a folder; the `.adapter` suffix keeps the word.
  - One folder per aggregate with no `entities/`: a feature that only reads holds records and enumerations that are no aggregate, and forcing them into aggregate folders would name a boundary of consistency that does not exist.
  - `aggregates/<aggregate>/` beside a flat `entities/`: an aggregate's root is an entity, so two folders split one kind by a property the `.aggregate` suffix already shows, and a feature's reader looks in two places for its entities.
  - Flat `entities/*.entity` files, with a folder only for an aggregate that has inner entities: an entity gains a spec, a fixture or an inner part as it grows, and each then moves; one folder each from the start keeps every entity's files together and its path stable.
  - Vertical slices by operation, or layers held by file suffix instead of folders: the owner keeps the layers inside a feature, whose shared model is what DDD protects.
  - `presentation/` and `ui/` side by side: Evans' presentation layer holds both what binds an operation to a framework and what shows it.
- **Why.** Each canonical word now names one place, the dependency direction is a matter of folders the import checks read, and the application can run from a component, a route loader, a worker, a command or another client of the same language.

## ADR-0260 — The model decides: aggregates change only through their transitions, use cases orchestrate

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** Core gains `aggregate-changed-only-by-its-transitions` (MUST; merging owned-data's `aggregate-changed-only-through-its-root` and `command-repository-per-aggregate-root`), `independent-entity-is-its-own-aggregate` (moved from owned-data), `transition-yields-its-event`, `domain-service-holds-a-rule-of-several` (MUST) and, for the application, `use-case-leaves-decisions-to-the-model` (MUST). The vocabulary defines the canonical terms — entity, value object, aggregate and its root, factory, domain service, domain event, repository, application service, bounded context, shared kernel, anti-corruption layer. `entity-rule-lives-beside-the-entity` becomes `aggregate-rule-lives-in-its-module` and leaves the form to the language: TypeScript keeps plain data and a companion, with no literal or spread of an aggregate outside its file; Python lets transitions be methods of a frozen dataclass returning `dataclasses.replace`.
- **Rejected.**
  - Classes with private fields for TypeScript aggregates: they close the spread hole by the language, but every boundary the data crosses — the query cache and its persister, IndexedDB and `structuredClone`, a worker, a server component — then needs a mapper.
  - A Transaction Script exemption for simple features (Khononov, Fowler, Bogard): the owner wants one form everywhere; `use-case-leaves-decisions-to-the-model` already leaves no exemption.
  - A rule that every feature has a domain model: where a feature decides nothing, a model made for it is a structure no need earns, and it clashed with `remote-data-has-no-second-model`.
  - "Policy" for a rule over several aggregates: EventStorming uses the word for a reaction to an event; Evans' term is domain service.
  - A use case that may decide nothing at all: it keeps the application's own rules — who acts, what to load, the order of steps, the transaction — as Uncle Bob's interactors do.
- **Why.** A rule written in a use case is skipped by the next one, which is how a model turns anaemic; a model that holds its rules and guards its transitions is DDD whatever the syntax.

## ADR-0261 — A use case is a framework-free function; a hook or a controller only binds it

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** Every operation, a read included, has a use case in the application layer, however thin; a hook, a controller, a command or a consumer is a binding unit of the presentation that calls it. On a front end the query library decides when and how often a use case runs, never what it decides (`query-library-decides-when-never-what`).
- **Rejected.**
  - The use case as a React hook (Stemmler's interaction layer, overview articles): a hook runs only while a component renders, so a route loader, a server, a worker, background sync, a command line or another framework could not run the operation, and the library's pauses change the business flow unseen.
  - A use case only where the operation orchestrates (Android's and Flutter's guides make it optional): one form for every operation keeps the place where the next step goes, at the cost of a thin file.
- **Why.** Uncle Bob, Cockburn, Android and Flutter keep use cases free of the interface's lifecycle, and the cost is linear and small.

## ADR-0262 — The domain checks its own values, with no schema library

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** `layer-imports-dependencies-by-its-role` keeps the domain, the application and the kernel free of installed dependencies, save a library of one outside format or arithmetic one value object imports (a numbering plan, bank account numbers by country, decimal arithmetic); a general schema or parsing library is never one. `value-object-checks-what-the-domain-relies-on` lets an interface add its stricter checks over the value object's, never restating it; a schema at the edge builds a domain value through its constructor and turns its failure into an issue.
- **Rejected.**
  - A schema library inside the value objects: its error model, coercions and messages enter the domain, and the domain changes whenever the library is swapped or rewritten.
  - A validation port: a pure invariant behind a port is configuration, and the value no longer guarantees anything.
  - A value object implementing the Standard Schema interface: a front-end convention becomes part of the domain's public surface.
  - The recipe of the helper that turns a domain failure into a schema issue as a rule: the rule fixes the substance, each project writes its helper.
- **Why.** The domain's checks are a few lines, while a format no one should write by hand is held in the one value object that needs it.

## ADR-0263 — Expected failures stay thrown; an adapter maps what it recognises

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** Expected failures stay thrown errors of the program's own, named where callers read them (`expected-failure-named-where-callers-read-it`) and carrying a stable code (`expected-failure-carries-a-stable-code`). An adapter maps every failure of its dependency it recognises, a transient one included, to its port's own and lets every other pass as a defect, wrapped at most once with its cause.
- **Rejected.**
  - Returning an expected failure as a discriminated union (a Result), even as a choice the rules allow: the owner keeps native throw.
  - Wrapping every input and output in a catch that turns any failure into an error of the program's: it disguises a defect as something a caller can handle.
- **Why.** Catching everything is easy, classifying everything is impossible and needless; the retry logic must know only the port's transient failures.

## ADR-0264 — The cohesion review: one subject, one rule; a tool rule only where it adds

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** Six reviewers read every rule for subjects cut apart and rules bundling two. Rules no project would lower apart merge (among them `growing-collection-bounded`, `name-number-matches-its-value`, `name-never-an-empty-word` with the empty verbs, `test-seen-failing` with the regression test, `contract-has-one-fake-and-one-suite`, the data port's naming into `data-port-one-per-entity-and-side`, the pipeline rules into `pipeline-stages-run-by-their-owner`); rules of two subjects split (`composition-root-wires-everything` into three, `structure-appears-by-symptom` and `copies-joined-when-they-change-together`, the expected-failure rules, `secret-kept-out-of-output` in core and `personal-data-kept-out-of-output` in privacy); a rule that only repeats another goes. A tool rule that only names its parent and exists as a key for a preset is deleted and its settings key the parent. Rules that give a library its home merge into one rule of the role, in the domain or platform that owns it, with no new field in a block's front matter. The rules on agents keep apart the agent at work on the repository (core) and the model or agent a product runs (language-model). The labels of controls gather in ui's labels chapter, and the voice of text a person reads is the copy domain's (ADR-0266).
- **Rejected.**
  - A `homes:` field in each passport: a new mechanism for what one rule of the role already says.
  - One TLS rule in core: TLS is a means of the network domains, not a concern of every program.
  - One safety chapter for every agent: an agent that writes the code and a feature of the product answer to different people and risks.
- **Why.** A subject cut into distant rules is read in part, and a project that lowers one half keeps the other by accident; the presets follow the rules, never the reverse.

## ADR-0265 — Names never date their thing, a closed set is decided in one place, copies join when they change together

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** `name-never-dates-its-thing` bans `new`, `old`, `v2`, `legacy`, `fixed`, `improved` and `final` in a name, save a version of a contract. `closed-set-decided-in-one-place` gathers what each member of a closed set means for several concerns into one record keyed by member. `copies-joined-when-they-change-together` keeps DRY for knowledge and the rule of three for look-alike code, and joins copies only when they change together.
- **Rejected.**
  - Replacing every switch by polymorphism, as clean-code notes ask: a switch over a closed set is exhaustive and cheap to extend by operation; the smell is the same switch repeated (Fowler's "Repeated Switches"), and an open set already grows by registration.
  - The third occurrence as a trigger to join: copies that change apart are coincidence, not a fact.
- **Why.** These close the gaps the review of a software-design book found in the names and the code rules.

## ADR-0266 — The voice of text a person reads is the copy domain's

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** A domain block `copy` holds how text a program writes for a person addresses them, its case and its punctuation (`text-addresses-the-reader-as-you`, `text-written-in-sentence-case`, `text-uses-the-locales-punctuation`). A unit follows it whatever shows its text — a screen, a terminal, an email, a document. i18n requires it, and its MessageFormat apostrophe rule tightens the punctuation one. The labels of controls stay in ui; `text-a-person-reads-held-in-a-messages-file` and the `.messages` file stay in core.
- **Rejected.**
  - The voice rules in ui: a command-line tool or an email shows text to a person and follows no ui block.
  - The voice rules in i18n: its rules assume a second locale, and a product in one language would miss them.
  - The voice rules in core: a library or a job with no text for a person needs none of them, and core holds only what every project needs.
  - The messages-file rule in the new domain or in i18n: its reasons — text reworded in one place, a file mutation tools skip by its kind — hold for any program that writes text a person reads, and its `.messages` term is what core's mutation rule names.
- **Why.** The voice belongs to the text, not to the surface that shows it or to the number of its languages.

## ADR-0267 — A configuration names its schema in core; an aggregate read back is rebuilt by its restore

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** Core's `configuration-names-its-schema` asks every configuration file to name the schema its reader publishes; JSON, TOML and YAML keep only the form their language gives it, and config-file's rule tightens it for the program's own file. `aggregate-changed-only-by-its-transitions` gives an aggregate a second way in besides `create`: its `restore`, which rebuilds one already stored, checking its invariants, no precondition, and yielding no event, for the adapter that reads it.
- **Rejected.**
  - The schema rule kept in each language block: the three stated one requirement with no parent, and almost every project holds a configuration file whose reader publishes a schema, which is the measure core keeps.
  - Rebuilding a stored aggregate through `create`: it checks the creation's precondition against data that already passed it, and yields the creation's event a second time.
  - Letting the adapter build the aggregate itself: the module is then no longer the one place an aggregate is made, and an invariant a mapper forgets is never checked.
- **Why.** Five independent reviews of the rule set agreed on the first; the second is Evans' reconstitution, which the layout had left with no lawful path. Evans asks only that reconstitution meet a broken invariant otherwise than creation does, with some strategy of repair; failing it as corrupt data, and repairing stored data by a migration, is this Constitution's own choice within that.

## ADR-0268 — A transition takes the stage it starts from; a use case's signature speaks the business

**Date:** 2026-10-30 · **Status:** Accepted

- **Decision.** `illegal-state-unrepresentable` adds that each move between a value's stages takes only the stage it starts from and returns the stage it reaches, so shipping an order that is not paid does not type-check. `use-case-signature-speaks-the-business` asks a use case's input, a query's result, the failures it throws and the events it publishes to be named types of the business, with no framework or transport type in the signature.
- **Rejected.**
  - A status field checked at run time before each transition: the check is repeated, and forgetting it compiles.
  - Returning a `Result` from the use case, as Domain Modeling Made Functional does: ADR-0263 keeps native throw, which Wlaschin's own "Against Railway-Oriented Programming" allows for errors the domain need not model.
- **Why.** Both come from Scott Wlaschin's Domain Modeling Made Functional (2018), whose functional modelling of a workflow matches the style this Constitution keeps.
