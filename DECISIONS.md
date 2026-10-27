# Decision Log

> A journal of the decisions behind the constitution and the reasoning behind them. **Not a rulebook** — the blocks say *how things are*; this log records *why it was decided and what was rejected*.
>
> **Conventions:** one entry per [decision](packages/constitution/blocks/core/foundation/changes.md#choice-between-alternatives-recorded); a rule placed by the constitution's own instructions needs no entry. Entries are numbered and kept. A new decision is a new entry; the entry it replaces takes the status `Superseded by ADR-NNNN`, and one it changes in part keeps its status and names the part and the new entry in a line **Superseded in part.** Statuses: `Accepted` · `Proposed` · `Superseded by ADR-NNNN`.
>
> Its entries record the decisions of the constitution 1.0 in number order, each with the date it was taken.

| Theme | Entries |
|---|---|
| Scope | ADR-0001 |
| Blocks and layers | ADR-0002 – ADR-0005, ADR-0007 |
| Project files | ADR-0009, ADR-0010, ADR-0102, ADR-0208, ADR-0231 |
| Rules and roles | ADR-0013 – ADR-0016, ADR-0144, ADR-0219, ADR-0226, ADR-0232 |
| Overrides and precedence | ADR-0020 |
| Delivery | ADR-0026 |
| The anatomy | ADR-0029, ADR-0032, ADR-0033, ADR-0035, ADR-0036, ADR-0141, ADR-0143, ADR-0157, ADR-0158 |
| The rest | ADR-0043, ADR-0045 |
| Testing | ADR-0046 – ADR-0049, ADR-0220 – ADR-0222 |
| Code | ADR-0050, ADR-0052 |
| Core | ADR-0053 – ADR-0055, ADR-0057, ADR-0058, ADR-0060, ADR-0062, ADR-0063 |
| Blocks | ADR-0064, ADR-0066 – ADR-0076, ADR-0092, ADR-0095, ADR-0206, ADR-0209, ADR-0210, ADR-0211, ADR-0214 – ADR-0216, ADR-0233 |
| Tools and tests | ADR-0077 – ADR-0084, ADR-0086, ADR-0096, ADR-0097, ADR-0099, ADR-0101, ADR-0103, ADR-0138 |
| Axes | ADR-0088 – ADR-0091, ADR-0093, ADR-0094, ADR-0098 |
| The 2026 audits | ADR-0106 – ADR-0109, ADR-0114, ADR-0115 |
| A real application | ADR-0118, ADR-0121, ADR-0123 |
| Delivery of the constitution | ADR-0124 |
| Workspaces and distribution | ADR-0125, ADR-0139, ADR-0150, ADR-0151, ADR-0159, ADR-0207, ADR-0213, ADR-0217, ADR-0218, ADR-0227, ADR-0228, ADR-0229 |
| Line width | ADR-0126 |
| Python | ADR-0127 – ADR-0129, ADR-0140, ADR-0142 |
| TypeScript configuration | ADR-0130, ADR-0131, ADR-0133 |
| Scripts of the check | ADR-0132 |
| Dependencies | ADR-0134, ADR-0145 |
| Domains | ADR-0136, ADR-0137 |
| The expert review of #271 | ADR-0146 – ADR-0149 |
| The fifth audit | ADR-0152, ADR-0153 |
| What a tool holds, not how it runs | ADR-0155 |
| The sixth audit | ADR-0156 |
| One home per rule | ADR-0160 – ADR-0165, ADR-0167, ADR-0169 – ADR-0176, ADR-0180, ADR-0181, ADR-0186 |
| The program's tree | ADR-0187 – ADR-0190, ADR-0194, ADR-0195, ADR-0199 |
| A project's decisions and the cost of its work | ADR-0191 – ADR-0193 |
| The 2026 expert audit | ADR-0196 – ADR-0198 |
| What a tool holds and what review holds | ADR-0200 – ADR-0202 |
| The plugin and the project's rules | ADR-0203 – ADR-0205, ADR-0212 |
| The whole-repository review of #383 | ADR-0223, ADR-0225 |
| Formatters | ADR-0224, ADR-0230 |

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

**Date:** 2026-09-25 · **Status:** Superseded by ADR-0191

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

- **Decision.** A block lays its rules out on three axes: its base, what any team wants, and two optional axes, `architecture/` and `workflow/`, a folder each with its chapters and its `with/` seams; since ADR-0211 every axis, `foundation/` the base's, is a folder of one form. Two questions place a rule, each apart from the other: its layer by what must disappear for it to lose its meaning, and its axis by whether a team with another architecture, or another workflow, would still want it. Architecture is the structure of a system in the sense of Clean Architecture, DDD and hexagonal architecture — layers and their duties, the direction of dependencies, boundaries with ports and adapters, the homes of input, output and state, the composition root, the isolation of parts, read and write apart, and the tree that spells them; workflow is how a change travels from the idea to the release. The layout of tests is the base's. Across blocks, an `architecture/` or `workflow/` rule may tighten a base rule, a base rule only a base rule, and the two never each other. A project lists the optional axes it follows in `constitution.yaml`. A rule that bundles two axes is split.
- **Rejected.** Two parallel trees `foundation/` and `architecture/` above the layers, which give a block two homes; a suffix `.architecture.md` beside a default axis; a mark on each rule, which a hook cannot drop as a whole and which drifts, as the `architecture` tag did; one architecture block that places every other block's rules, which would name every library from above; folder names as the test of architecture, which misses the dependency rule itself.
- **Why.** A team adopts the foundation the way it adopts a tool's recommended preset, whatever its own architecture and workflow, and the axes make that choice one line. The literature separates the three the same way: style guides and Clean Code for the craft, Clean Architecture, hexagonal architecture and DDD for the structure, and engineering practices — Clean Coder, Accelerate, the code-review guides — for the process.

## ADR-0089 — A rule sits on one axis and names the rule it carries out

**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** Every rule that bundled two axes is split into one rule per axis, and where one half repeated another rule it was dropped instead. A rule that carries out another names it in its heading beside its own level, `### <slug> → <rule> · <level>` since ADR-0164: it takes that rule's tags, never states a looser level, and carries out one rule at most. A rule of the base carries out only a rule of the base, and `architecture/` and `workflow/` never each other; `blocks:check` reports any other reference, a looser stated level, a cycle and a missing rule. A rule's Why and Tags are one table under its statement, the same columns in every rule, and a list written as in the front matter, `[]` when empty. The tags are the lenses that cross every axis — `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux` — optional, since a full review reads every rule.
- **Rejected.** The Implements label beside the heading; labels on consecutive lines, which render as one run-on paragraph; lenses that name a chapter's topic — design, naming, types, process — or an axis.
- **Why.** A block below is checked never to loosen the rule it names, and a lens is worth filtering by only when it crosses the axes.
- **Superseded in part.** The tags and the lenses, by ADR-0226.

## ADR-0090 — Each axis keeps its words

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0093

- **Decision.** `vocabulary.yaml` lists the words the `architecture` and `workflow` axes own; `blocks:check` reports an architecture word outside `architecture/`, a workflow word outside `workflow/`, and either in a card. The check catches the plain leak; placing a rule stays with the two axis questions.
- **Rejected.** Picking the words out of a markdown glossary by its file name; the words alone as the judge of an axis.
- **Why.** A team with another architecture or workflow takes foundation as it is, so foundation must neither speak our words nor state our choices in plain ones.

## ADR-0091 — The constitution's archive carries every tool configuration, laid out by axis

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** devkit's presets, starter files and `mutation-check` move into the constitution, and its release archive `constitution.tar.gz` is the one way a project takes them, in any language: `presets/`, `templates/project/<block>/`, and `tools/mutation-check/dist/main.js`, built at release. A preset is split into parts, `presets/<scope>/<tool>/<axis>/<block>.*`, the axis `foundation` for the base since ADR-0211: the tool folder is the tool's block, the axis folder the optional axis of the rules the part holds, and the part is named after the block its settings need — the one without which they mean nothing, an abstract block's underscore included: `noTailwindArbitraryValue` sits in `tailwind` though it holds a rule of `ui`. Settings that need no block beyond the tool sit in `core` when they hold a rule of core, and in `self` when they are the tool's own. A GritQL rule is `plugins/<rule-slug>.grit` in the folder of its axis, and an architecture part narrows a foundation part's GritQL rule by listing the same path.
- **Rejected.** npm packages for the TypeScript tools beside an archive for the rest, which released the same rule twice — most of devkit's changes came paired with one of the constitution's; naming the tool's own part after the tool, which reads `biome/biome.jsonc`; dropping an abstract block's underscore in its parts, which gives one block two names.
- **Why.** A rule and the setting that holds it change in one pull request and ship in one version; a project that leaves an axis out leaves out its parts; and every part names the block that owns it, which a check can hold.

## ADR-0092 — docker, its two linters, and nestjs get blocks

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** The `docker` implementation describes both files a project writes for containers. A Dockerfile pins its base image, copies rather than adds, runs its command in exec form, fails a piped step, pins and trims its system packages, runs as a numeric unprivileged user and takes a secret only through a secret mount. A Compose file keeps devkit's order of keys, has no `version`, quotes every published address and binds it to an interface, and its shared settings, variants, health waits and test services follow devkit's conventions. The check lints both, and any finding fails it: `hadolint` holds a Dockerfile with `failure-threshold: style`, `dclint` a Compose file with every rule an error, each from its preset in the release archive. `nestjs` keeps the decorator metadata its injector reads; a provider takes its dependencies through its constructor, a rule on the architecture axis.
- **Rejected.** One block per file, which splits the images a Compose file runs from the Dockerfiles that build them; the linters' defaults, which leave half their findings as warnings the check passes; turning a rule of core off for NestJS in its Biome part, which a block may not do.
- **Why.** A container is built and run by the two files together, and each has a linter that holds most of its rules; what a linter cannot see is reviewed.

## ADR-0093 — An agent judges the placement

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** The meaning of a rule is judged by the `rule-placement` agent of this repository, which answers the layer and axis questions for every rule a change adds or rewrites and reports each rule that sits elsewhere; its answers go into the pull request.
- **Rejected.** The agent inside `bun run check`, which must give the same answer on the same code.
- **Why.** A check of words catches a plain leak cheaply, and the placement itself needs the reading of meaning the two questions ask for.

## ADR-0094 — Each preset binds its settings to the rules they hold

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A preset holds, beside the parts of each axis, a `bindings.yaml` in that axis's folder — `presets/<scope>/<tool>/bindings.yaml` for the base, `…/architecture/bindings.yaml` for architecture: by part and rule, the settings that hold the rule, wholly or in part, each as the part's file spells it. It is the one record of what a tool holds; a rule names no tool and no check (ADR-0160). A binding must be real: its rule exists and sits on the part's axis or on the base, which any axis may carry out; its rule belongs to the part's block, a block above it or a seam with it, never a block below; its part exists; its file spells the setting. Whether a part is the block its settings need is judged by the `rule-placement` agent. A setting that holds no rule is never reported. A preset file is a part named after a block or `self`, a plugin named after a rule of its axis, or `bindings.yaml`. The configuration carries no comment per setting.
- **Rejected.** A Bindings table in the tool block's chapters, which filled a tool's chapter with other blocks' rules and made a language name the frameworks below it; a check that every setting holds a rule, since a tool's own opinions need none; a comment per setting in the configuration, which nothing checks; dependency-cruiser rules renamed to their slugs, since several of its rules hold one slug and it drops a repeated name across `extends`.
- **Why.** A block keeps its own rules and nothing else, the presets keep the tools' side, and the check reads the one place they meet: a renamed setting, a moved part or a rule a tool only claims to hold fails the check instead of drifting.

## ADR-0095 — CSS is a language block, and the stylesheet's rules move into it

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `css` is a language context, beside `typescript`, for a program's stylesheets whatever writes the classes. Its rules: every style rule in a named cascade layer, the order of layers declared once, no `!important`, selectors of at most three classes that never descend in specificity, no id selector, custom properties declared before they are read and registered with `@property` where they are animated or typed, Baseline features only, classes declared and used and named for what an element is, container queries for components, global styles only in the entry stylesheet. A rule that carries out a rule of `ui`, `a11y` or `i18n` sits in css's seam with it: values from the theme's custom properties named after their tokens and, on the architecture axis, a component's own stylesheet in its folder with `ui`; logical properties with `i18n`. HTML stays with `browser`: its elements, ARIA and focus mean something only in a browser's document. `tailwind` requires `css`.
- **Rejected.** The CSS rules in the `ui` or `browser` part, which gave a domain or a platform a language it may not have: a browser program need not write a stylesheet, and React Native has none; an `html` language block, which would repeat the browser platform.
- **Why.** A rule sits where it loses its meaning: without CSS these rules mean nothing, and without a browser neither does HTML.

## ADR-0096 — A tool names the languages it covers

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A block's card declares `languages`: the language blocks whose files a tool's presets cover, which decides the scopes of its parts. `biome` covers `typescript` and `css`; `dependency-cruiser`, `knip`, `stryker`, `syncpack` and `bun-test` cover `typescript`. A tool that lists none — `betterleaks`, `osv-scanner`, `lefthook`, `hadolint`, `dclint` — reads any language's files. Only an implementation lists languages; `blocks:check` reports an entry that is no language block, and the field on any other layer.
- **Rejected.** Coverage through `requires`, which took every language for a programming language: Biome, which lints CSS, would count only for TypeScript, and `biome` requiring `css` would bring CSS into every Biome project.
- **Why.** What a tool reads is a fact of the tool, not of what it depends on.

## ADR-0097 — A tool-checked rule claims only what its tool holds

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0101

- **Decision.** A rule that a tool holds only in part is split into the part a tool holds and the part that is reviewed, and a rule that bundled two axes is split.
- **Rejected.** A Check that names a tool for a whole rule the tool holds in part, which hides the part nobody checks; a rule kept whole on its stricter axis, which denies a team the half it would take.
- **Why.** A Check says who holds the rule; when it says a tool, the tool must hold all of it.

## ADR-0098 — Presets are laid out by scope first, and the compiler gets its block

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A preset's part is `presets/<scope>/<tool>/<axis>/<block>.*`, `foundation` the base's axis (ADR-0211), with the bindings and the GritQL rules `plugins/<rule-slug>.grit` of each axis in its folder. The scope is the files the part reads: `common` for any language, or a language block its tool lists in `languages`. Every tool has a scope, even one that reads one language, so no tool is laid out apart. The compiler becomes the implementation block `tsc`, which checks `types` and governs `tsconfig.json`, and `compiler-is-the-type-gate` moves to it from `typescript`; its strict options sit in its `self` part again.
- **Rejected.** A language folder inside a tool's axis folder, which appears in some tools and not in others and names the axis before what the part reads; the language block `typescript` doubling as the compiler's tool, which gives one block two roles; a separate scope for the parts of one block, which a part's name already carries.
- **Why.** A project takes a scope whole — `common` and the scope of each active language — and a language added later brings its own folder beside the others, with the same tools inside.

## ADR-0099 — A cast is refused, and a value from outside is parsed or narrowed

**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** Biome's `noUnsafeTypeAssertion` holds the `as` cast of `no-unchecked-escape-hatches`, in specs as in production; only `as const` passes. `boundary-values-unknown-until-parsed` makes a value from beyond the boundary known by the project's schema or by plain checks — `typeof`, `in`, `Array.isArray` — the same way in specs and in production.
- **Rejected.** A schema for every value from outside, which brings a dependency into a small tool that reads one field; casts left in specs, which let a spec pass on data in a shape the tool never gave.
- **Why.** A cast over data nobody read promises a shape nobody checked; a schema or a narrowing check reads it, and the first unexpected field fails where it enters.

## ADR-0101 — A rule a tool holds in part is reviewed, and a child says what the tool holds

**Date:** 2026-09-29 · **Status:** Superseded by ADR-0160

- **Decision.** Where a tool holds only part of a rule, the rule keeps its slug and its statement and becomes `review`, and a child `→` it states exactly what the tool holds, with the tool's Check and its bindings.
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

## ADR-0106 — Value objects and thrown failures

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - A business value with an invariant is a value object of the domain (`value-object-built-only-by-its-check`, MUST, on the architecture axis): built only by the domain's function that checks it, immutable, compared by value, never a class. A boundary gets one only through that function, and a zod schema never brands one itself. In TypeScript it is a branded type with `create<Name>` and `is<Name>`. A meaning without an invariant stays a vocabulary alias, and an existing alias is used instead of the bare type.
  - Expected failures are thrown as errors of the kit, not returned: a contract lists them as one type beside it, a `catch` narrows by code and rethrows the rest, and only errors are thrown.
- **Rejected.** A `Result` type for expected failures: the owner keeps the language's own `throw` and `catch`. A value object as a class: its instance loses its methods in a cache, a URL and storage.
- **Why.** The rozumchik-web audit found value objects unstated and the rules about failure missing.

## ADR-0107 — A session proxy in the web tier, and a screen's reads in its loader

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - The web tier may hold one session proxy that keeps the user's tokens on the server behind an `HttpOnly` cookie and forwards calls, with no business rule (the OAuth best current practice for browser applications).
  - A screen's reads start in its loader.
- **Rejected.** A wider BFF that shapes data for screens: the rules belong to the API that owns the data.
- **Why.** The rozumchik-web audit and the best-practices audit of 2026 found these unstated or contradicting current TanStack and OAuth practice.

## ADR-0108 — Base UI for the primitives, and `svh` by default

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - Every project builds its primitives on Base UI through shadcn source: `complex-widgets-on-radix` and `slot-behind-as-child` give way to `complex-widgets-on-base-ui` and `polymorphism-through-render`, Base UI's `render` prop being the kit's only polymorphism. A pattern the platform's own element carries whole — `<dialog>`, `popover`, `<details>` — uses that element, and the top layer replaces a portal there.
  - CSS: `svh` by default.
- **Rejected.** Radix as the kit's base: shadcn generates on Base UI since July 2026, and the owner moves every project to it. `dvh` as the default height: it resizes while the toolbar moves.
- **Why.** The rozumchik-web audit and the best-practices audit of 2026 found these unstated or contradicting current React, Tailwind and platform practice.

## ADR-0109 — A submit button is busy, never disabled, while it submits

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.** A form never submits twice, but its button is busy, not disabled: `submit-disabled-while-submitting` (tanstack-form) gives way to `submit-busy-while-submitting` in `ui`, since no form library is needed for it.
- **Rejected.** A disabled submit button: it drops focus and says nothing.
- **Why.** The rozumchik-web audit and the best-practices audit of 2026 found it against WCAG 2.2.

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

## ADR-0115 — A wire model is declared, never inferred from its schema

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.** A wire model is declared without the schema library, and `schema-held-exactly-to-its-model` holds the schema to it, as nydra does.
- **Rejected.** A wire type inferred from its schema, which makes the schema library the source of the program's type.
- **Why.** The review of the 2026 audits against the constitution found the choice unwritten; a declared model names no vendor, and the schema is held to it exactly.

## ADR-0118 — The architecture gaps a real application found

**Date:** 2026-10-03 · **Status:** Accepted

- **Decision.**
  - `repositories/` has no surface joining its two sides, and a shape both sides use — the page a read returns and a write updates in the cache — is an entity, so an optimistic command imports the entity, never the read port.
  - `services-reach-loaders-through-router-context` replaces `adapters-reach-loaders-through-router-context` and carries out `one-explicit-composition-root`: every service the providers build reaches loaders and guards through the router's context. The query client's own rule in the seam with TanStack Query goes, since this one holds it, and `root-imported-only-by-entry-and-delivery-wiring` still keeps routes off `root/`.
- **Rejected.**
  - Letting a command import a read port's types: the shared shape belongs to the entities.
  - Opening `root/ui` to route files: an application shell that knows no feature belongs in `shared/ui`.
- **Why.** The audit of rozumchik-web against constitution 0.62 found these homes and rules missing or contradicting each other.

## ADR-0121 — A development tool's licence is left off the allowlist by name

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** The licence allowlist binds what the program ships or loads at runtime. A tool that only builds, tests or checks it stays off the list as an osv-scanner override by name, `license.ignore` with a reason (`development-tool-licence-ignored-with-reason`); the scanner still checks its vulnerabilities.
- **Rejected.** Scoping the licence exception by the dependency's group: osv-scanner 2.6.0 does not read the group from `bun.lock`.
- **Why.** A check against the tool and its sources: aikit already ignores a tool's licence outside the rules.

## ADR-0123 — Biome's `useExplicitReturnType`, and Zod 4's forms alone

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - Biome's `useExplicitReturnType` replaces `useExplicitType`: functions still declare their return type, and a constant checked by `satisfies` keeps its narrow type.
  - Zod 3's forms are refused (`zod-four-forms-only`, MUST), held by GritQL; `.strict()` is refused by choice, since Zod 4 only advises against it.
- **Rejected.** `allowExpressions` on `useExplicitReturnType`, which changes nothing for the arrow functions a project writes; a refusal of `.refine` in a schema, which Zod 4 makes needless since it never narrows.
- **Why.** Each item was run first: `useExplicitType` widened every `satisfies` constant, and Zod 4 marks its old forms deprecated while no rule caught them.

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

## ADR-0126 — Lines of 100 characters

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Biome formats at a line width of 100, not 80, in the common part every project extends.
- **Rejected.** A line width of 80, Biome's default.
- **Why.** At 80 a typed signature or a call of a few arguments breaks over lines that each say little; at 100 this repository's code is about a thousand lines shorter (owner).

## ADR-0127 — Python is a language, with uv, Ruff and ty

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** `python` is a language context held to every role, its source root `src/<import name>/` of each package, its specs in `tests/` beside `src/`, its entry `main.py`. On foundation it fixes the forms of core's rules: snake_case modules and packages; `test_<name>.py`, `<contract>_fake.py`, `<name>_fixtures.py` and the runner's file of shared fixtures — pytest's `conftest.py` — in `tests/`, the kind of a spec told by its folder; `None` as the only absence; no `Any`, held in signatures and generics; PEP 695 generics; aware datetimes; `@override` on every override; frozen, slotted, keyword-only dataclasses for business data; keyword-only parameters past the third; task groups; no `except` that only passes; Google docstrings only where core allows one; suppressions with their code and a reason after ` -- `; `sys.path` never touched; tools pinned with `==` in the `dev` group, floors for the program's dependencies, `requires-python` at the pinned minor — Python 3.14.8 until 3.15 is out and past the cooldown; with `package`, `py.typed` in every published package. On architecture: role files `<name>_<role>.py` in role folders spelled in snake_case, `__init__.py` as the surface — only re-exports and a sorted `__all__` — and empty in a layer folder; relative imports inside one feature at any depth, never out of it, absolute imports across features; a value from outside `object` until parsed; the environment read only under `root/`. Three implementations: `uv` — the only package manager, `no-build`, no Python of its own, a workspace and a capped `uv_build` with `package`, `uv version` writing every member; `ruff` — two spaces, single quotes with docstrings in double, lines of 100, families chosen by name, a chain of parts `self.toml` ← `core.toml` ← `python.toml` since `extend` takes one file; `ty` — every rule an error, warnings failing, `# type: ignore` unread, passed as `--config-file`, under which ty reads no `[tool.ty]`. lefthook's `ruff` part fixes and formats staged files; `templates/project/python/` carries the `pyproject.toml` of the settings with no preset and the `.gitignore` of the bytecode.
- **Rejected.** Pyrefly, the reviews' choice, for ty, from the makers of uv and Ruff, though it is in beta (owner); double quotes and four spaces, the experts' choice, for single quotes and two, as in TypeScript (owner); `ban-relative-imports = "all"` (`TID252`), which forbids the relative imports a feature keeps inside itself (owner) — a small AST check will hold them, and the 100 and 500 line limits, from the archive's `tools/`; an architecture part for Ruff, whose only candidate — `os.environ` banned outside `root/` — needs per-file ignores that resolve against the part's own folder, or match any path with a `root` in it.
- **Why.** A second language takes the same rules as the first in its own forms, held by the tools its practice has settled on, so a product written in TypeScript and Python is reviewed and checked the same way in both.

## ADR-0128 — Python is tested by pytest, Hypothesis and mutmut, and checked by import-linter, deptry, vulture, complexipy and python-check

**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Seven implementations, each held to core's testing and code rules in Python. `pytest` — strict, `importlib`, warnings as errors, a coverage gate of 100 percent of lines and branches through pytest-cov with `--cov` never in `addopts`, pytest-randomly's order, no rerun plugin, `tests/integration/` and `tests/e2e/` left out of the unit specs by `norecursedirs`, the network refused by an autouse fixture of `tests/conftest.py` that the integration folder overrides, no `unittest.mock` and no patched module, async specs on anyio's plugin; run in each package with `pythonpath = ["tests"]`. Ruff's part `pytest.toml` extends `python.toml` as the last link of the chain, with `PT` and the bans of skips, expected failures, the `flaky` mark, `unittest.mock` and `pytest_asyncio`, and a project lifts only `S101` and `INP001` in `tests/`. `hypothesis` — properties written with `@given`, counterexamples kept by `@example`, and under `CI` its own `ci` profile, which already derandomizes and keeps no database. `mutmut` — every mutant killed, an equivalent one marked on its line by `# pragma: no mutate -- <reason>`, each mutant run without randomness or coverage; its gate is the archive's `tools/mutmut-check`, which clears `mutants/`, mutates the functions a change touches and a new module whole, and fails on every mutant not killed — survivor, untested or timed out. `import-linter` — core's import rules as contracts named after them, written over wildcards (`*.kernel`, `*.features.*`) so one template fits any package. `deptry` — unused dependencies and dev tools imported by the program. `vulture` — unused code from a confidence of 60, over `src` alone so code only the specs reach is dead, names a framework reaches in `ignore_names` with a reason. `complexipy` — cognitive complexity within core's limit. `python-check`, the constitution's own Python tool in the archive's `tools/`, holds a function of at most 100 lines and a file of at most 500 outside `tests/`, and a relative import kept inside its module — a feature, a top-level folder, or the package root — with a feature never importing its own absolute path. The settings of the tools without `extends` start from `templates/project/python/pyproject.toml`, and `tests/conftest.py` beside it. The release builds both Python tools as `.pyz` archives the project's interpreter runs.
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
  - The template's `[tool.importlinter]` turns on `include_external_packages` so a contract can name a module from outside, and its cycle contract names the package, since `*` would match the packages from outside too.
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
- **Rejected.** The patch tag alone: a registry lets any tag, a patch's included, be pushed again, so two builds of one source can run different images, the drift the rule's own Why forbids. The digest alone, which tells a reader and an updater nothing of the release it pins.
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

- **Decision.** In a workspace, each unit's files are held by the parts of its own blocks, and no unit's parts reach another's (`unit-checked-by-its-own-parts`, a rule of `workspace`, which it means nothing without). Each tool's seam with `workspace` gives the form: Biome as ADR-0213 has it, dependency-cruiser a configuration per unit (`cruiser-configuration-per-unit`) beside the root's, which holds the imports between units (`imports-between-units-held-at-the-root`), and knip a configuration per unit since ADR-0213. Bun's coverage gate leaves out `../**`, the files of the units a unit imports, which their own specs hold (`coverage-gate-on-the-unit-alone`). Each unit with code its specs run has its own `stryker.config.mjs` (`stryker-configuration-per-unit`), and Stryker's part loads the archive's runner by its path from the preset's own file, which finds it from any folder.
- **Rejected.** One run from the root with every unit's parts joined, which applies a framework's names or layers to the units that do not use it; overrides per path in one configuration, which only some tools have and which then differ from tool to tool; a coverage ignore that names each imported unit, which changes with every new dependency; a `plugins` path written into each unit's `stryker.config.mjs`, which every unit would write again.
- **Why.** A unit's blocks are the rules it is held to; a part applied beyond it changes another unit's rules, and one written for `src/` that runs from the root holds nothing at all.

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

## ADR-0155 — The constitution holds what a tool is configured to hold, never how the project runs it

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** The constitution holds a program's structure, boundaries and code, the design of its tests, and the configuration of each tool that holds a rule; it prescribes none of the project's commands, script entries, command-line flags, the order of its runs, the folder a tool runs from, its installs, its CI steps, its schedules or its release procedure.
  - `one-check-command` asks only that the project has one check that runs every tool holding a rule and fails on a violation, and that `constitution.yaml` names its command, which `/check` and the hand-back gate read. The check's entries per area (`check-chains-one-entry-per-area`, `check-chains-area-scripts`, `check-chains-area-tasks`) and the Poe the Poet block go, and the template's `[tool.poe.tasks]` with them.
  - Removed: `check-only-checks` and its children (`biome-check-never-writes`, `ruff-check-never-fixes`, `check-writes-no-snapshot`); `integration-specs-in-their-own-run`, `unit-without-specs-passes-empty`, `each-unit-linted-in-its-folder`; the scanners' runs (`secrets-scanned-on-every-change`, `history-scanned-once-on-adoption`, `hadolint-over-every-dockerfile`); the installs (`installs-follow-the-lockfile`, `installs-follow-uv-lock`, `lowest-direct-run-isolated`); `stryker-runs-each-mutant-against-the-specs-that-load-it`, whose child `stryker-runs-the-archive-runner`, a configuration, now carries out `mutants-all-killed`; `lingui-cli-on-bun-or-noted-exception`; git's commands (`move-with-git-mv`, `force-push-with-lease-to-own-branch-only`, `clean-tree-with-safe-cleanup`); the publishing procedure (`npm-publishes-in-the-release-workflow`, `distributions-attested-before-upload`, `publish-skips-published-versions`, `release-job-owns-publishing`, `release-cut-by-automation-promoted-by-person`); CI and schedules (`required-check-blocks-integration`, `program-built-after-the-check`, `pull-request-title-checked-in-ci`, `ci-runs-the-pinned-toolchain`, `whole-program-mutated-periodically`, `contract-run-scheduled-outside-the-check`, `updates-grouped-and-scheduled`, `toolchain-pins-updated-by-bot`). The templates lose `bunfig.integration.toml` and Docker's `scripts/run.sh` and `test.sh`; `bunfig.mutation.toml` stays, since the archive's mutation runner reads it.
  - Where a run's flag gave a property no setting held, the parts now hold it: Biome's common part sets to `error` each of the 84 recommended rules, outside the nursery, whose default is `warn` or `info`, and yamllint's sets `level: error` on `comments`, `comments-indentation` and `truthy`, whose defaults are warnings. Biome 2.5.13 and yamllint 1.38 exit with 0 on a warning and have no setting that fails on one.
  - Two Requirements answers need a rule of their block, so each keeps the narrowest one: Bun's `no` to `publishing-with-provenance-supported` names `units-published-by-npm`, and uv's `partly` names `distribution-uploaded-with-its-attestation`.
  - Kept: the lefthook block, its parts, bindings and rules; Renovate's configuration; `every-commit-passes-the-check`, `release-marked-by-immutable-tag`, `release-tags-annotated`, `main-line-takes-no-direct-push`, `publishing-by-workflow-identity` and `publishing-with-provenance-supported`.
- **Rejected.** The commands kept as SHOULD rules or as a template every project copies, which still bind a project to one way of running its tools and change with each tool's flags; the CI steps kept for what they gave — a red check blocking a merge, a build after the check — which the forge and the project's own workflow decide; `--error-on-warnings` and `--strict` as the way to fail on a warning, flags of a command the constitution no longer names; the publishing rules kept whole behind the Requirements answers, where one rule per tool says what the answer needs (owner).
- **Why.** A rule about how a tool is run says nothing about the code it checks, differs between equally good projects, and goes stale with every release of the tool; a setting the presets carry holds the same property in every project, whatever runs it.

## ADR-0156 — `# type: ignore` is refused by ty alone

**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** `# type: ignore` is refused by ty alone, through its `respect-type-ignore-comments = false`.
- **Rejected.** Ruff's `PGH003` for `# type: ignore`, which passes one that names codes, where ty's `respect-type-ignore-comments = false` silences none.
- **Why.** One setting silences every such comment, whatever codes it names.

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

- **Decision.** A rule is a third-level heading — `### <slug> · <level>` or `### <slug> → <rule>` — and a second-level heading opens a section, which is no rule. A rule's table is `| Why | Tags |`: the Check column goes, and with it the closed list of check roles, the fields `checks` and `roles` of a card, the hook's warning about a role no tool covers, and the advice on role coverage. `bindings.yaml` is the one record of which setting holds which rule, wholly or in part.
- **Rejected.** A Check column that lists several checks, which still writes a rule with an eye on what a tool can do and states twice what the bindings already say; keeping the roles to warn about a language no tool covers, which a rule could claim without a tool ever holding it; rules and sections on one heading level, which rendered a flat outline where a section read as a rule.
- **Why.** A rule is written for what it means; which tool holds it, and how much of it, is a fact of the tool, kept once beside the tool's settings.
- **Superseded in part.** The Tags column, by ADR-0226: a rule's table is `| Why |`.

## ADR-0161 — No rule carries out a rule of its own block

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** An arrow leaves its block: a rule carries out a rule of core, of a block it requires or extends, or of the block its `with/` seam names, never a rule of its own block, in any file or on any axis. Across blocks the axes keep their order: a base rule tightens only a base rule, an `architecture/` or `workflow/` rule one of its own axis or a base rule.
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
- **Rejected.** Chapters by broad topic — `code`, `principles`, `anatomy` — whose rules a writer could put in two of them; a chapter of laws the others carry out, which needed arrows inside the block; `vibing` for the chapter on agents, which names the habit of accepting code unread that its rules forbid; lifting a rule to core with its language's form, which names the language from above.
- **Why.** When a rule's first words name its chapter, where it goes is answered by reading it, and two rules about one thing meet in one file, where a duplicate shows.

## ADR-0164 — Every rule that carries out another states its level, and a contract is shaped by its callers' role

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** Three independent reviews of core agreed on what follows.
  - Levels: every rule that carries out another states its level, never looser; `blocks:check` reports one that states none, and an override lowers the one rule it names.
  - Contracts: `contract-offers-a-caller-only-what-it-calls` becomes `contract-shaped-by-its-callers-role`, the operations one role of caller needs.
- **Rejected.** A level taken from the parent, which the reader of a rule had to look up and an override carried down unseen; a contract cut per caller, which multiplies contracts that change together.
- **Why.** A rule read alone says how strongly it binds, and one contract serves every caller of one role, so contracts that change together stay one.

## ADR-0165 — A surface is the door of a module or a set of one kind, and a squashed change request is one commit

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** A second round of three reviews of core, read against rozumchik-web, settled these.
  - Surfaces: a module has a surface, its door, and a role folder, whose members are of one kind, has one; a layer folder, whose members lie on different sides of the boundaries the imports hold, has none, and neither has the source of an application (`surface-only-on-a-module-or-one-kind`). The kernel is such a layer: its role folders have surfaces and it has none, `#/kernel/errors` rather than `#/kernel`, and dependency-cruiser's `kernel-role-reached-through-its-surface` and import-linter's contract on `*.kernel.*.*` hold it; the source of an application has none either.
  - Changes: a squashed change request is one commit, so a refactoring the task needs ships apart only when it reaches beyond the files the behaviour change touches, and the commit-level move and refactor rules of version control go.
- **Rejected.** A surface on every folder, which joins layers and isolated modules in one import; a surface at every layer but the kernel's role folders; a separate change request for every refactor and move, which a squash makes the only way to keep them apart and which small cleanups do not earn.
- **Why.** A surface is where a caller may couple, so it sits only where coupling to the whole is safe.

## ADR-0167 — The domain layer re-cut: an abstract API, HTTP apart, and one area per domain

**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** Three independent reviews of the domain layer (7, 7 and 7 of 10) settled its cut; each domain holds one area, and what needs two lives in a seam.
  - The API: `_api`, abstract, holds what every style of API shares — failures, contract, limits, collections, requests, values in JSON — and `rest-api` and `mcp-api` extend it; a style with no block is a local block that extends it. HTTP is a domain of its own, `http-server` — methods, origins, bodies, caching, TLS — which `rest-api` requires and a tool server over HTTP meets in `mcp-api/with/http-server.md`. A style's rules bind only the operations it serves. NestJS requires `_api`, FastAPI `rest-api`, FastMCP `mcp-api`.
  - Renamed: `consent` is `privacy` and gains the opt-out signal and the person's rights over their data; `logging` is again `observability`, with logs, traces and metrics; `document` is `config-file`, since core's "document" is prose. `design-system` leaves `ui` and requires it, so a product on another's kit lists `ui` alone. `unreliable-network` folds into `remote-service`, which now also holds what other systems push, its webhooks; `remote-data` requires `remote-service`, and `convergence` requires `config-file`. `analytics` meets privacy through `with/privacy.md`, so measurement the law exempts carries no consent machinery.
  - A branch name stays `feature/`, `fix/` or `hotfix/` until the release automation reads a commit's type instead.
  - Two domains join: `messaging`, a program that publishes or consumes messages, jobs and scheduled work through a broker or a queue, scheduled jobs included with or without a broker, and `language-model`, a program that prompts models and acts on their output. Both require nothing: a broker or a model may be an engine the project runs itself. Read against utm-api, rozumchik-gateway-api and rozumchik-ecosystem-api, the experts' practice prevails where theirs differs: an outbox over a publish after commit, bounded retries, a lease longer than the handler, a stable model in production.
  - Rejected in the third round: scheduled jobs as a domain of their own, since their rules bind only a program that lists them and a cron without a broker shares the area; page numbers beside the opaque cursor, which Google's AIP-158 and the experts keep out of a list that grows, though utm-api's admin lists use them; an opaque user identifier of the program's own in analytics after consent, since the library's pseudonymous one measures the same and leaves nothing a third party can join to the person.
- **Rejected.** A concrete `api` that the styles require, which lets a project list the base, forget its style and lose the style's rules unseen; one `api` with a chapter per protocol, the conditional sections ADR-0005 rejected; HTTP's rules in the base, which bind a tool server over standard input for nothing; `privacy` without opt-out and rights, which models one region's law; `analytics` requiring consent, which forced consent's MUSTs on products that never ask; `model-tools` as the name of the tool server's domain, whose rules are MCP's throughout.
- **Why.** A domain is an area a product has or lacks; when each holds one area and the seams hold what two share, a project lists what it is and gets exactly the rules that bind it.

## ADR-0169 — The contexts layer re-cut: a server platform, one layout for every language, and markdown and shell

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** Three researches of the contexts layer (graded 7.2) and three independent answers to each of the owner's three open questions re-cut the layer.
  - `server` joins the platforms, equal to `cli`, `browser` and `mobile`: a long-running process a host starts, routes to, restarts and stops — its probes, its stop, nothing kept that another copy needs, its configuration and secrets from the host, its log as a stream — with its own architecture axis and seams with `http-server`, `messaging`, `owned-data` and `observability`. A program that serves and renders its own pages lists `browser` and `server`, and what only the pair means lives in `browser/with/server.md` and its architecture twin.
  - A language or a platform names its sections after core's chapters on its axis, in core's order, and a seam after the other block's; a rule that tightens another sits in the section named like its parent's chapter, which `blocks:check` now holds. A language has a block of its own once three rules need it and no tool.
  - `markdown` and `shell` join the languages; TypeScript's `enum` stays, split into rules of one meaning.
  - A server reads a secret from a file its host mounts or with its host's identity, and from the environment only where the host offers no other way; a child process gets an environment built for it.
- **Rejected.** A `web`, `fullstack` or `ssr` platform, which names a pair of runtimes and multiplies with every pair; `worker` and `container` as platforms — the first is `server` with `messaging`, the second packaging, whose rules are `docker`'s; a layout of the languages' own, a second vocabulary for core's chapters that let one section grow into a catch-all; secrets from the environment as the norm, which every inspect, child process and crash dump reads; TypeScript's `as const` objects in place of `enum` and an erasable-syntax rule, which the owner rejected because his programs rely on `enum`.
- **Why.** A platform is a runtime a rule loses its meaning without, a language a syntax, and a layout shared with core lets a reader, an agent and a check find every language's form of a rule where core keeps it.

## ADR-0170 — Core, the domains and the contexts after their eighth review

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** Nine independent reviews of the three layers after ADR-0169, three per layer, and a placement review agreed on what follows.
  - Core: a transient failure is only named expected, and `failure-retried-only-when-transient` alone says who retries it — the code nearest the call, once — and what reaches the caller after. A secret reaches a process by any way no other user of the machine reads, a store the process reads included. A language's rules wait for their block in the project's local block, never in a domain.
  - Domains: a runtime floor is never raised in a patch, and in a minor only where the resolver skips a release the consumer's runtime cannot run, so TypeScript raises `engines` only in a major.
- **Rejected.** A retry required wherever a transient failure is met, which retried at every level and clashed with the idempotency rule; a secret's channels listed closed, which the CLI's credential store and the server's workload identity stepped outside; a language's rules waiting in a domain, which bound every project of the domain to a language it may not use; a floor raised in a minor for every registry, which npm's resolver ignores.
- **Why.** The reviews found clashes between a rule and the rules that carry it out, and a few rules that stated the same thing twice; each is closed where a reader of the rule looks, without re-cutting a layer or an axis.

## ADR-0171 — Core, the domains and the contexts after their ninth review

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** Nine independent reviews, three per layer, and a placement review agreed on what follows.
  - Core: a failure is retried at one level — the code nearest the call, or a broker or a scheduler that runs the whole unit of work again.
  - Domains: an answer's enumeration lists its known values in `examples`, as Zalando's rule 112 now does; Lingui's check holds the source catalog, so a translation may still follow.
- **Rejected.** A retry forbidden above the nearest call, which redelivery of a message breaks; strict compilation of every locale, which forbids the translations the i18n domain lets follow; an `x-extensible-enum` kept as the norm after its own guideline moved to `examples`.
- **Why.** The reviews found a duplicate the last round left, two clashes between a rule and the redelivery or rotation that carry it out, and a strong rule no tool held; each is closed where its reader looks.

## ADR-0172 — Core, the domains and the contexts after their tenth review

**Date:** 2026-10-12 · **Status:** Accepted

- **Decision.** The tenth round graded every layer at least 8.9 with every reviewer; what two or three of them found is closed.
  - Core: python-check's effect modules leave `uuid`, `urllib` and `http`, whose types are pure, as `pathlib` stays out for its `Path`.
  - Domains: focus is trapped only by a modal layer.
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
- **Rejected.** Denying timers in the application layer, whose binding units debounce with them; flagging `uuid.UUID`, `http.HTTPStatus` or `pathlib.Path`, whose types are pure.
- **Why.** The strongest architecture rule was held by prose where tools could hold it.

## ADR-0175 — Names: antonyms in pairs, and a member never repeats its owner

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** Core's `names` gains two SHOULD rules the owner accepted from Vitaly Friedman's naming guide and the naming cheatsheet it links: `opposite-acts-named-by-a-verb-and-its-antonym` — `add` and `remove`, `create` and `delete`, `open` and `close` — and `member-name-never-repeats-its-owner` — `MenuItem.onClick`, not `MenuItem.onMenuItemClick`.
- **Rejected.** A name a module exports cut down to its verb, `list` in `orders`, which is read without the module wherever it is imported; component tokens in the token grammar, as Intuit's and Vodafone's taxonomies allow, which `token-never-named-after-a-component` refuses on purpose.
- **Why.** Clean Code's consistent antonyms and the cheatsheet's rule against duplicated context make a name say only what its place does not.

## ADR-0176 — Core, the domains and the contexts after their twelfth review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** The twelfth round graded core 8.9, the domains 9.0 and the contexts 8.9 with every reviewer; what weighs is closed on every layer, and the domains, at 9.0, leave the reviews.
  - Effects outside the edge are held further by the tools: Biome denies the `process` global and catches `Date()`, `randomUUID`, `randomBytes` and `randomInt`; python-check refuses `uuid6` to `uuid8`, the standard streams, `sys.argv` and `sys.exit`, and asyncio's processes and sockets, read as attributes as well as imports. ui's components keep core's whole list where `shared/` meets them.
- **Rejected.** Making `node:crypto` an effect module, which would forbid a pure hash in the domain; `pathlib` among the effects, whose `Path` is a value.
- **Why.** Each fix closes a clash between a rule and the rule, the platform or the tool that carries it out.

## ADR-0180 — No list of a runtime's members, and the sections of a case held by review

**Date:** 2026-10-13 · **Status:** Accepted

- **Decision.** No tool refuses the `Bun` global outside the edge: `bun-global-reached-only-from-the-edge` and its GritQL plugin go. A call through it that reaches an effect — `Bun.file`, `Bun.spawn` — is still refused by core's `effects-held-only-by-the-edge`, and a reviewer holds it; a pure one — `Bun.deepEquals`, `Bun.hash` — is allowed, as `node:util` is. `case-split-by-arrange-act-assert-comments` stays a MUST that a reviewer holds.
- **Rejected.** Refusing every member of `Bun`, which forbade its pure helpers that Node's own modules are allowed; a list of the pure members allowed, or of the effectful ones refused, which must follow every release of the runtime; a check of a case's comments, a parser of comments for each language that costs more than a reviewer's look at a case.
- **Why.** A list of a runtime's members goes stale with each release and needs keeping for little gain, and a rule a reviewer holds at a glance is not worth the complexity of a check.

## ADR-0181 — Core and the contexts after their sixteenth review

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** The sixteenth round graded core 8.9, 8.8 and 8.8 and the contexts 8.9 with every reviewer; what two reviewers or more found is closed.
  - Core: test code — a spec, a fake, a contract suite, fixtures — has no line limit, as both tools read it, and a contract suite is a kind of file, `<contract>.suite`.
  - Tools: a vendor's package a lib wraps is left to a reviewer in both languages, the tools following only the runtime's own effects.
- **Rejected.** Counting a vendor's package reached through a lib by a reachable rule to every package, which needs the homes of all packages in one more place; narrowing the tools' line limits to spec files, which would bind the fakes and fixtures the owner's tests share.
- **Why.** Each fix closes a clash between two rules, a slug that said less than its rule, or a tool that held more or less than its rule.

## ADR-0186 — A merge keeps one meaning

**Date:** 2026-10-14 · **Status:** Accepted

- **Decision.** A rule merged into another stays merged only when it is a case of the survivor's one meaning; where the survivor's slug no longer said what it held, the merge had joined two meanings and is undone.
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
  - A feature flag is retired once settled.
- **Rejected.**
  - `packages/` for the programs: Turborepo means libraries by it.
  - One `shared` package: every program then rebuilds on every shared change.
  - A use case moved into `app/`: `domain/` would no longer be the part programs share across hosts.
  - Surfaces dropped from role folders, and pure libraries let into the domain: both kept stricter for now, to be revisited when their cost shows.
  - One repository for a simple feature in place of the split by side: the split is interface segregation and keeps one tree, and CQRS's warnings concern separate models, which the split does not make.
  - Business metrics of the critical scenarios: deferred.
- **Why.** Each change follows the consensus of 2024–2026 sources the audit cites — Evans and Vernon, Jovanović and Spring Modulith, Microsoft, Seemann, Nx and Turborepo, the Google SRE books — or a church rule our form lacked; each rejection keeps a stricter choice the owner made.

## ADR-0197 — What the 2026 expert audit changed beyond the architecture

**Date:** 2026-10-15 · **Status:** Accepted

- **Decision.**
  - Testing: the coverage gate stays at 100 percent, and the integration specs of code over an engine the sandbox runs now count toward it, so such code is never reached through a faked driver; captured responses stand in only for a system no spec can run. `every-mutant-killed` stays a MUST over what a change touches, and a mutant no caller relies on — a log call, the text of a diagnostic — is left out by the tool's configuration or marked with its reason, like an equivalent one.
  - Security: a key agreement uses a hybrid post-quantum exchange, such as X25519MLKEM768, wherever both sides support one, at MUST in core.
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
  - Mutants of log calls and diagnostic text are left out by Stryker's ignorer; in Python, mutmut's `do_not_mutate_patterns` leaves out log calls and the text of a diagnostic is marked by its line's pragma, since ruff's `EM` puts the text on a line of its own before the `raise`, where a pattern over that line would also drop the error's data; a dependency from a source repository or an address is refused by syncpack's specifier types, while a `file:` or `link:` path — a library's archive in `.droneey/`, for one — is left to review, which keeps it inside the repository; in Python, `sources-stay-in-the-repository-or-an-index` limits `[tool.uv.sources]` to the workspace, an archive inside the repository or a named index, and review holds it, as it does a git dependency that arrives only through a lockfile.
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

**Date:** 2026-10-19 · **Status:** Accepted

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
  - `case-split-by-arrange-act-assert-comments` stays a MUST and loosens one part: the Arrange may be left out when the case arranges nothing, as when a table's row gives every input, and is never left empty; Act and Assert are always there, once each and in that order, and a lifecycle or an end-to-end case repeats its Act and Assert pairs. The Act still makes one call, which no tool holds. The plugin `case-split-by-arrange-act-assert-comments.grit`, bound in the `core` part beside the other plugins of core's rules about cases, reads the comments from the text of each case's callback, since Biome keeps comments as trivia no node pattern reaches: each opens a line of its own, and the sections run Arrange, then Act and Assert pairs, ending on an Assert.
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
  - `styling-only-on-a-terminal`: an explicit request for colour turns colour on whatever the stream, in this order — a flag first, `--no-color` over `--color`; then a non-empty `NO_COLOR` turns colour off; then `FORCE_COLOR` set to any non-empty value, `0` included, turns it on without a terminal; then the terminal and `TERM` decide.
  - ui's `element-found-by-role-label-or-text`: an element no person perceives — hidden from assistive technology, or a framework's own element — is found by an attribute the code that renders it sets for the spec, and a selector the program configures a framework with is checked by one spec, through that same constant. The seam with react-dom names the form: that spec queries the selector with its reason in the suppression and asserts the element it must name — in the docs, that `PAGE_SCROLLER_SELECTOR`, which the router scrolls back to the top, names the main article's parent, so a wrapper a Fumadocs upgrade adds fails it. testing-library's `queries-by-role-label-text` finds it by `getByTestId`, through the test id its renderer reads, and the seam with react-dom, `spec-never-selects-from-the-document`, names that attribute, `data-testid`. Playwright's `locators-by-role-label-text` still refuses `getByTestId`. The plugin is renamed `spec-never-selects-from-the-document.grit`, no longer refuses `getByTestId`, and still refuses `querySelector` and `querySelectorAll`.
  - Core's `every-mutant-killed`: each mutant runs against the specs the coverage gate counts — the integration specs of code over an engine the sandbox runs among them — and never the end-to-end specs. mutmut's `mutants-run-without-the-gates` keeps its form, `-o "norecursedirs=.* e2e"` in `pytest_add_cli_args`, and pytest's `integration-folders-not-collected` lets a run that collects the integration specs lift them.
- **Rejected.**
  - The enumeration rule written in each language alone: two languages stated one meaning twice, and a third would state it again.
  - A subset typed as a union beside its array, as `LayerField`, `ListField` and `LoweredLevel` were: one list written twice drifts. An array for every subset the program only types: nothing would read it.
  - A plugin that follows the array into the file it is imported from: Grit reads one file, so a type derived from an imported array is refused and is derived beside its array instead.
  - Keeping only the exports production code imports, as the review proposed: a caller and a spec could no longer name the value they build for the function or receive from it.
  - `FORCE_COLOR` over `NO_COLOR`, as Node.js's `lib/internal/tty.js` reads them: a variable a tool or a CI image injects would silently override the person's own opt-out; CPython 3.14's `_colorize` and bixense.com's clicolors page, which in 2026 retires `CLICOLOR_FORCE` for `FORCE_COLOR`, read `NO_COLOR` first. `0` and `false` read as off, as Node.js does: force-color.org forces colour on any non-empty value, and CPython does the same.
  - `FORCE_COLOR` over the flags, as force-color.org's example reads it: no-color.org's FAQ has a run's own argument override the environment, and `NO_COLOR` over `--color` breaks the same order.
  - `getByTestId` kept forbidden, with a suppression on every case of a decorative element, or `querySelector` by the attribute the styles read: the suppressions were the rule's normal case, and a spec that selects by a styling hook breaks when the styles change; Testing Library names the test id as the fallback where no role or text can match. The exception in testing-library alone: a child cannot be looser than ui's rule it tightens. A configured selector proved only by the end-to-end run, or by a test id added to the framework's element: the router reads the selector, not a test id, and only a query through the same constant proves the two agree; Testing Library keeps `querySelector` as the escape hatch for such a deliberate contract, and TanStack Router's guide hands `scrollToTopSelectors` such a selector.
  - The specs of a mutant's run stated by mutmut and pytest: the choice is the same for every runner, so it is core's, beside the gate whose specs it reuses; a rule of its own under `every-mutant-killed`: core's rules tighten no rule of core.
  - The integration specs left out of each mutant's run: 37 of python-check's 704 mutants had no spec to kill them.
- **Why.** Each meaning now sits in the layer whose loss voids it, and each rule states what the code and the tools do: one declaration per closed set and per listed subset, the contract a caller writes against, the order no-color.org, force-color.org, bixense.com/clicolors and CPython give colour, Testing Library's priority of queries and its escape hatch, and a mutation run that proves code by the same specs as the coverage gate.

## ADR-0224 — Biome formats YAML, tombi formats TOML, and yamlfmt goes

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - YAML: Biome, from 2.6 on — pinned at 2.6.2, the newest past the three-day cooldown — formats every YAML file of a unit by the unit's own parts. Its part `yaml/biome/foundation/self.jsonc` writes single quotes, which dclint's rule for Compose already asks of a port; the width is the 100 of every other formatter, and yamllint's `line-length` comes down from 120 to it. Biome's part for `mise`, `common/biome/foundation/mise.jsonc`, leaves out the lockfiles mise writes under `.mise/locks`. Biome 2.6 also formats and lints Markdown by default, so `common/biome/foundation/self.jsonc` turns both off, and rumdl stays the formatter of Markdown (`one-formatter-per-language`). The block `yamlfmt` goes with its preset, its template, its part of lefthook and its part of knip.
  - TOML: the block `tombi` (`languages: [toml]`, `tombi-is-the-formatter → one-formatter-per-language`) formats and lints every TOML file with tombi, pinned at 1.9.0, the newest past the cooldown. tombi reads only the `tombi.toml` of the folder it runs in or above, and no other file from it, so each unit with TOML keeps its own `tombi.toml` with the parts copied between their lines, and runs `toml:check` (`tombi format --check && tombi lint`) and `toml:fix` in its folder; the root's skips the folders the members lie in by `<unit folders>`, which the wiring check reads as it reads rumdl's. The part turns off the order a schema would impose on keys and on the items of an array. tombi's part for `mise` leaves the lockfiles out. lefthook's part `tombi.yaml` formats the root's staged files, and the root's `lefthook.yaml` gives each unit a job of its own. A fragment names the block on a line `# tombi — …`, since tombi reads a comment that opens with `tombi:` as its directive.
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

## ADR-0229 — A generated theme is built where it is read, and the check may write untracked output

**Date:** 2026-10-25 · **Status:** Accepted

- **Decision.**
  - The theme each design platform package generates from the tokens is ignored by git, as `generated-files-not-committed` asks, and every script that reads it builds it first.
  - ADR-0062's check that "generates nothing" changes nothing git tracks: a step may write untracked build output that the check then reads, never a tracked file.
- **Rejected.**
  - Committing the theme with a drift check, as until now: the exception of `generated-files-not-committed` for a file a fresh clone's check needs before any build runs no longer applies once the check builds it, and the committed copy filled every diff of the tokens and needed a step of its own.
  - A `postinstall` or `prepare` script: the release workflow and the docs image install with `--ignore-scripts`, and a change to the tokens after the install leaves the theme stale until the next one.
  - Git hooks such as `post-checkout` and `post-merge`: they run on a developer's machine alone, never in CI or an image, and miss an edit to the tokens.
  - Turborepo or Nx and their `dependsOn: ["^build"]`: a second task runner and its cache for two builds of about a second each, while Bun 1.4.3's `--filter '<name>^...'` selects the same dependencies, and its `pre<script>` hooks run for a script run directly, by `--filter <name>` and by `--filter '*'`.
- **Why.** A generated file is built where it is read, so no copy drifts from its source and no check guards one (owner).

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
