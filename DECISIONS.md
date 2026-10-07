# Decision Log

> A journal of the decisions behind the constitution and the reasoning behind them. **Not a rulebook** — the blocks say *how things are*; this log records *why it was decided and what was rejected*.
>
> **Conventions:** one entry per choice between real alternatives — one a later reader could propose again — naming what was rejected and why; a rule placed by the constitution's own instructions needs no entry. Entries are numbered, and only decisions in force are kept. A new decision is a new entry; the entry it replaces is deleted, and one it changes in part loses that part. Statuses: `Accepted` · `Proposed`.
>
> Its entries record the decisions of the constitution 1.0 in theme order, each with the date it was taken.

| Theme | Entries |
|---|---|
| Scope | ADR-0001 |
| Blocks and layers | ADR-0002 – ADR-0005 |
| Project files | ADR-0009, ADR-0010, ADR-0102 |
| Rules and roles | ADR-0013, ADR-0014, ADR-0144 |
| Overrides and precedence | ADR-0020 |
| The anatomy | ADR-0032, ADR-0036, ADR-0157, ADR-0158 |
| The rest | ADR-0045 |
| Testing | ADR-0046 – ADR-0048 |
| Code | ADR-0050, ADR-0052 |
| Core | ADR-0053, ADR-0057, ADR-0058, ADR-0060, ADR-0062, ADR-0063 |
| Blocks | ADR-0064, ADR-0066 – ADR-0071, ADR-0074, ADR-0092, ADR-0095 |
| Tools and tests | ADR-0077 – ADR-0081, ADR-0083, ADR-0084, ADR-0086, ADR-0096, ADR-0099, ADR-0105, ADR-0138 |
| Axes | ADR-0088, ADR-0089, ADR-0091, ADR-0093, ADR-0094, ADR-0098 |
| The 2026 audits | ADR-0104, ADR-0106 – ADR-0110, ADR-0113 – ADR-0115 |
| A real application | ADR-0116, ADR-0118 – ADR-0123 |
| Delivery of the constitution | ADR-0124 |
| Workspaces and distribution | ADR-0139, ADR-0150, ADR-0151, ADR-0159 |
| Line width and licences | ADR-0126 |
| Python | ADR-0127 – ADR-0129, ADR-0140 |
| TypeScript configuration | ADR-0131, ADR-0133 |
| Dependencies | ADR-0134, ADR-0145 |
| Levels | ADR-0135 |
| Domains | ADR-0136, ADR-0137 |
| The expert review of #271 | ADR-0146 – ADR-0149 |
| The fifth audit | ADR-0152 – ADR-0154 |
| What a tool holds, not how it runs | ADR-0155 |
| The sixth audit | ADR-0156 |
| One home per rule | ADR-0160 – ADR-0167 |

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

## ADR-0009 — A project keeps constitution.yaml and PROJECT.md
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A project declares the blocks it follows, its applications, its check command and its overrides in `constitution.yaml`, and describes the product — what it is, for whom, its domains, entities and glossary — in `PROJECT.md`. A project keeps no `DECISIONS.md`: a departure is an override, and git history keeps its record.
- **Rejected.** A `DECISIONS.md` or ADR log in each project: a departure is an override with its reason, and git history keeps the record.

## ADR-0010 — A project pins a released version
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** `constitution.yaml` pins a released version; until 1.0.0 it pins the current 0.x one. The plugin delivers the rules of its installed version and says so when the pin differs.
- **Rejected.** Delivering the rules of the pinned line, deferred until a need arises.

## ADR-0013 — Rules: one format, global slugs
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** A rule is a heading with its slug, its statement, and an **Example** where one is needed; ADR-0089 gives the heading and the table under the statement. A slug is kebab-case, unique across the whole constitution and carries no number. It is renamed whenever its rule's statement outgrows it, with no entry in this log; a project's override that names an old slug is reported by the hook. Blocks, labels and hook output are written in English.
- **Rejected.** Numbered rules, which shift with every insertion.

## ADR-0014 — No rule above the implementations names a tool
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** No rule of core, a domain or a context names a tool, and no rule's check does: a rule names the role of its check; the tool's block says which roles it checks and how to build its configuration. The configuration is a separate file — a preset of the constitution's release archive or the project's own — built to hold every active rule of its roles.
- **Rejected.** A rule that names its tool or its setting; the preset's `bindings.yaml`, ADR-0094, maps them instead.
- **Why.** A tool can then be swapped without touching a rule.

## ADR-0020 — Overrides: any rule, with consent and a reason
**Date:** 2026-09-25 · **Status:** Accepted

- **Decision.** An override lowers one rule to SHOULD or MAY — any rule, core MUST included. It is added only with the user's explicit consent in the chat, for that override; `reason` is required and `until` is optional. Written under a unit in `packages:`, it applies to that unit's files.
- **Rejected.** Rules no override may lower; blanket waivers.

## ADR-0032 — What dead code is
**Date:** 2026-09-24 · **Status:** Accepted

- **Decision.** Dead code means unused files, dependencies and internal code. An unused export of a surface is not dead code: a surface offers what its consumers may use.
- **Rejected.** Counting a surface's unused exports as dead code, as knip does by default: a surface offers what its consumers may use.

## ADR-0036 — Vendor libraries stay out of the domain
**Date:** 2026-09-26 · **Status:** Accepted

- **Context.** The first validator of this repository parsed YAML and checked schemas with a validation engine inside its domain code, reading the purity law as "no side effects".
- **Decision.** No vendor library is imported under `domain/`, a pure one included. Parsing a format and checking its wire shape happen in an adapter behind a port, with the wire shapes as that adapter's models, and the domain checks its own rules on the parsed data.
- **Rejected.** A pure vendor library — a YAML parser, a validator — in `domain/`, read as allowed because it has no side effects.
- **Why.** The core imports only itself and the shared kernel, so a vendor's types and upgrades never reach it.

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

- **Decision.** A case earns its place by failing for a plausible bug no other case catches; a case that cannot — a restated constant, a check of the library or the framework, a duplicate — is deleted. Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment. A bug fix begins with the test that reproduces the bug. When a behaviour is described before it is built, in an issue or a plan, an agent writes its tests from the description first; a person may write the code first. Mutation testing measures the tests, and every mutant of the logic is killed: a mutant no behaviour can tell apart is marked in the code, with its reason, as equivalent; any other survivor fails. A mutant in code no test runs survives, so the rule also holds every line of logic to a test.
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

## ADR-0083 — At most three positional arguments; a whole travels as one object
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `named-arguments-past-the-first` becomes `parameters-at-most-three-wholes-as-one-object`: a function takes at most three positional parameters, and values that make one whole travel as one named object, whatever their number. `useMaxParams` at three holds the count; whether values make one whole is reviewed. The typescript block's `options-object-for-named-arguments` becomes `options-object-has-a-named-type`, reviewed. The constitution's `named-arguments.grit`, which refused any second parameter, goes.
- **Rejected.** One positional parameter everywhere, which turns `(subject, options)` and a comparator's two sides into objects or suppressions; the first argument positional and every other named, which the plugin contradicted and a tool cannot tell from a whole.
- **Why.** Clean Code counts two arguments as natural, a third as needing a reason, and a group of values as an object of its own; a position is an order to remember, and a whole is one concept.

## ADR-0084 — Mutation testing keeps no earlier results
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `mutants-all-killed` runs over the lines a change touches, every new file and every file whose spec a change touches, and no longer reuses earlier results.
- **Rejected.** Stryker's incremental report: with no test reported per mutant Stryker cannot tell which tests meet it, so a cached result hid a survivor in one run and kept a killed mutant as surviving in another.
- **Why.** A result is trusted only when it was run; mutating the changed lines keeps the run short without a cache.

## ADR-0086 — zod is kept out of the domain by the domain law alone
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** `zod-only-at-the-edge` and its dependency-cruiser part are deleted. A schema is written wherever input crosses a boundary — an adapter's models, a route's search parameters, a form — and `domain-imports-only-itself-kernel-and-contracts` keeps zod, like every vendor, out of `domain/`. Under the table of packages by folder role (ADR-0158), the edge takes zod with any package, the screens included, and zod's home reaches past it to a UI's forms and the document of `composition/` (`zod-imported-by-forms` and `zod-imported-by-the-document`).
- **Rejected.** Widening the rule's list of edges to routes and forms, which names the router's and the form library's folders in zod's block.
- **Why.** The rule forbade the schemas `search-params-validated-by-schema` and the form rules require, while what it protected — a domain free of the schema library — the law already holds. Router and form libraries take any Standard Schema validator, so a schema at the delivery layer is the boundary, not a leak.

## ADR-0088 — Every block lays its rules out on three axes
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** A block lays its rules out on three axes: its base, what any team wants, and two optional axes, `architecture/` and `workflow/`, a folder each with its chapters and its `with/` seams; the base sits at the block's root since ADR-0162. Two questions place a rule, each apart from the other: its layer by what must disappear for it to lose its meaning, and its axis by whether a team with another architecture, or another workflow, would still want it. Architecture is the structure of a system in the sense of Clean Architecture, DDD and hexagonal architecture — layers and their duties, the direction of dependencies, boundaries with ports and adapters, the homes of input, output and state, the composition root, the isolation of parts, read and write apart, and the tree that spells them; workflow is how a change travels from the idea to the release. The layout of tests is the base's. Across blocks, an `architecture/` or `workflow/` rule may tighten a base rule, a base rule only a base rule, and the two never each other. A project lists the optional axes it follows in `constitution.yaml`. Every rule moved to its axis by a census of all 614; a rule that bundles two axes is split.
- **Rejected.** Two parallel trees `foundation/` and `architecture/` above the layers, which give a block two homes; a suffix `.architecture.md` beside a default axis; a mark on each rule, which a hook cannot drop as a whole and which drifts, as the `architecture` tag did; one architecture block that places every other block's rules, which would name every library from above; folder names as the test of architecture, which misses the dependency rule itself.
- **Why.** A team adopts the foundation the way it adopts a tool's recommended preset, whatever its own architecture and workflow, and the axes make that choice one line. The literature separates the three the same way: style guides and Clean Code for the craft, Clean Architecture, hexagonal architecture and DDD for the structure, and engineering practices — Clean Coder, Accelerate, the code-review guides — for the process.

## ADR-0089 — A rule sits on one axis and names the rule it carries out
**Date:** 2026-09-28 · **Status:** Accepted

- **Decision.** Every rule that bundled two axes is split into one rule per axis, and where one half repeated another rule it was dropped instead. A rule that carries out another names it in its heading beside its own level, `### <slug> → <rule> · <level>` since ADR-0164: it takes that rule's tags, never states a looser level, and carries out one rule at most. A rule of the base carries out only a rule of the base, and `architecture/` and `workflow/` never each other; `blocks:check` reports any other reference, a looser stated level, a cycle and a missing rule. A rule's Why and Tags are one table under its statement, the same columns in every rule, and a list written as in the front matter, `[]` when empty. The tags are the lenses that cross every axis — `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux` — optional, since a full review reads every rule. Twelve duplicates are merged into the rule that keeps their meaning, `fast-source-updates-once-per-frame` moves to ui, `pipeline-stages-under-steps` and `dependencies-imported-from-their-entries` to core, and an abstraction waits for its third occurrence in the principles as in ADR-0058.
- **Rejected.** The Implements label beside the heading; labels on consecutive lines, which render as one run-on paragraph; lenses that name a chapter's topic — design, naming, types, process — or an axis.
- **Why.** A block below is checked never to loosen the rule it names, and a lens is worth filtering by only when it crosses the axes.

## ADR-0091 — The constitution's archive carries every tool configuration, laid out by axis
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** devkit's presets, starter files and `mutation-check` move into the constitution, and its release archive `constitution.tar.gz` is the one way a project takes them, in any language: `presets/`, `templates/project/<block>/`, and `tools/mutation-check/dist/main.js`, built at release. A preset is split into parts, `presets/<scope>/<tool>/<block>.*` for the base and `presets/<scope>/<tool>/<axis>/<block>.*` for an optional axis since ADR-0162: the tool folder is the tool's block, the axis folder the optional axis of the rules the part holds, and the part is named after the block its settings need — the one without which they mean nothing, an abstract block's underscore included: `noTailwindArbitraryValue` sits in `tailwind` though it holds a rule of `ui`. Settings that need no block beyond the tool sit in `core` when they hold a rule of core, and in `self` when they are the tool's own. A GritQL rule is `plugins/<rule-slug>.grit` in the folder of its axis, and an architecture part narrows a foundation part's GritQL rule by listing the same path. mise's `tool-configuration-from-the-kit-archive` becomes `tool-configuration-from-the-constitution-archive`, and osv-scanner's `licences-checked-against-devkit-allowlist` becomes `licences-checked-against-the-shared-allowlist`. The node environment's parts are dropped; Python's configurations stay in devkit until a project needs them.
- **Rejected.** npm packages for the TypeScript tools beside an archive for the rest, which released the same rule twice — most of devkit's changes came paired with one of the constitution's; naming the tool's own part after the tool, which reads `biome/biome.jsonc`; dropping an abstract block's underscore in its parts, which gives one block two names.
- **Why.** A rule and the setting that holds it change in one pull request and ship in one version; a project that leaves an axis out leaves out its parts; and every part names the block that owns it, which a check can hold.

## ADR-0092 — docker, its two linters, and nestjs get blocks
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** The `docker` implementation describes both files a project writes for containers. A Dockerfile pins its base image, copies rather than adds, runs its command in exec form, fails a piped step, pins and trims its system packages, runs as a numeric unprivileged user and takes a secret only through a secret mount. A Compose file keeps devkit's order of keys, has no `version`, quotes every published address and binds it to an interface, and its shared settings, variants, health waits and test services follow devkit's conventions. The check lints both, and any finding fails it: `hadolint` holds a Dockerfile with `failure-threshold: style`, `dclint` a Compose file with every rule an error, each from its preset in the release archive. `nestjs` keeps the decorator metadata its injector reads; a provider takes its dependencies through its constructor, a rule on the architecture axis. Its Biome part no longer turns `noEmptyBlockStatements` off, which Biome never raised on an empty module or constructor.
- **Rejected.** One block per file, which splits the images a Compose file runs from the Dockerfiles that build them; the linters' defaults, which leave half their findings as warnings the check passes; turning a rule of core off for NestJS in its Biome part, which a block may not do.
- **Why.** A container is built and run by the two files together, and each has a linter that holds most of its rules; what a linter cannot see is reviewed.

## ADR-0093 — The vocabulary lists only words of one meaning, and an agent judges the placement
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** `vocabulary.yaml` keeps a word only when it has no meaning outside its axis: folders, role suffixes, terms of several words and words such as `semver`. `adapter`, `aggregate`, `entrypoint`, `kernel`, `port`, `sink`, `surface`, `widget` and `chore` leave it; their folders and suffixes stay. The meaning of a rule is judged by the `rule-placement` agent of this repository, which answers the layer and axis questions for every rule a change adds or rewrites and reports each rule that sits elsewhere; its answers go into the pull request.
- **Rejected.** Exceptions per word or per block, or reading only the prose outside code spans: a word with two meanings turns up in plain text as well, and every exception is one more rule to keep; the agent inside `bun run check`, which must give the same answer on the same code.
- **Why.** A word check that cries wolf gets its words rewritten rather than its rules moved; the words that remain catch a plain leak cheaply, and the placement itself needs the reading of meaning the two questions ask for.

## ADR-0094 — Each preset binds its settings to the rules they hold
**Date:** 2026-09-29 · **Status:** Accepted

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

- **Decision.** A block's card declares `languages`: the language blocks whose files a tool's presets cover, which decides the scopes of its parts. `biome` covers `typescript` and `css`; `dependency-cruiser`, `knip`, `stryker`, `syncpack` and `bun-test` cover `typescript`. A tool that lists none — `ls-lint`, `betterleaks`, `osv-scanner`, `lefthook`, `hadolint`, `dclint` — reads any language's files. Only an implementation lists languages; `blocks:check` reports an entry that is no language block, and the field on any other layer.
- **Rejected.** Coverage through `requires`, which took every language for a programming language: Biome, which lints CSS, would count only for TypeScript, and `biome` requiring `css` would bring CSS into every Biome project.
- **Why.** What a tool reads is a fact of the tool, not of what it depends on.

## ADR-0098 — Presets are laid out by scope first, and the compiler gets its block
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** A preset's part is `presets/<scope>/<tool>/<block>.*` for the base and `presets/<scope>/<tool>/<axis>/<block>.*` for an optional axis (ADR-0162), with the bindings and the GritQL rules `plugins/<rule-slug>.grit` of each axis in its folder. The scope is the files the part reads: `common` for any language, or a language block its tool lists in `languages`. Every tool has a scope, even one that reads one language, so no tool is laid out apart. The compiler becomes the implementation block `tsc`, which checks `types` and governs `tsconfig.json`, and `compiler-is-the-type-gate` moves to it from `typescript`; its strict options sit in its `self` part again. Vite's `build-is-not-the-type-gate` moves to its seam with `tsc`, and `nestjs` requires `tsc`, whose options it relaxes.
- **Rejected.** A language folder inside a tool's axis folder, which appears in some tools and not in others and names the axis before what the part reads; the language block `typescript` doubling as the compiler's tool, which gives one block two roles; a separate scope for the parts of one block, which a part's name already carries.
- **Why.** A project takes a scope whole — `common` and the scope of each active language — and a language added later brings its own folder beside the others, with the same tools inside.

## ADR-0099 — A cast is refused, and a value from outside is parsed or narrowed
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** Biome's `noUnsafeTypeAssertion` holds the `as` cast of `no-unchecked-escape-hatches`, in specs as in production; only `as const` passes. `boundary-values-unknown-until-parsed` makes a value from beyond the boundary known by the project's schema or by plain checks — `typeof`, `in`, `Array.isArray` — the same way in specs and in production.
- **Rejected.** A schema for every value from outside, which brings a dependency into a small tool that reads one field; casts left in specs, which let a spec pass on data in a shape the tool never gave.
- **Why.** A cast over data nobody read promises a shape nobody checked; a schema or a narrowing check reads it, and the first unexpected field fails where it enters.

## ADR-0102 — A project without a check command writes check: null
**Date:** 2026-09-29 · **Status:** Accepted

- **Decision.** Every schema is complete: a block's front matter declares every field in the schema's order, and `constitution.yaml` every key, with `[]`, `{}`, `null` or `false` where there is nothing to say. `check` stays a required key of `constitution.yaml`; a project with no command that runs its checks writes `check: null`, and the hook asks for nothing more. The hand-back gate of step 5 then has no command to require and only reminds of the review.
- **Rejected.** Dropping the key when there is no command, which a missing key cannot tell apart from one forgotten; an empty value, which the hook already reads as unfinished.
- **Why.** A project the constitution governs may have no checks yet, and saying so is different from not having answered.

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
  - Boolean props keep the names the platform and the primitive library give; an inline `style` is an object literal of custom properties only, held by GritQL instead of `noInlineStyles`; images declare their size, held in JSX by `useImageSize`; the Core Web Vitals are kept within budget. In the browser, a primitive passes its class and attributes through; `tailwind` merges the class by `cn()`, and `shadcn` marks the parts with `data-slot`.
  - CSS and Tailwind: `svh` by default, `w-screen` refused, a `max-*` breakpoint only after a minimum, cascading variants by `@custom-variant`, Tailwind's own layer order imported layer by layer, `!important` only in the reset layer, newly available features behind a feature query, `color-scheme` on the root, no hexadecimal colour outside the theme, the class merger configured with the theme's scales. The theme follows the system until the user chooses, lives in `libs/ui/theme/`, and its tokens are kept in the interchange format where a design tool or a second platform reads them. A component of `root/ui` is prefixed `root-`, held by ls-lint. `data-states-shown` names only the states a view's data can have.
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
  - Installs wait three days for a new release, not seven: a hijacked release is pulled within a day or two, and a week would hold back fixes.
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
  - Compose's top-level `include` takes its place after `name`.
  - OFL-1.1 joins the licence allowlist: self-hosted fonts carry it, and it binds only redistribution of the fonts themselves.
- **Rejected.** Making the check pass with no specs, a mutation mode for untested files, and a fixture that loads every file for coverage: a project without tests leaves `test:unit` and `mutation:check` out of its check until the first specs land, and changed lines are held by mutation.
- **Why.** The audit of rozumchik-web against constitution 0.62 found these gaps where a real application meets the rules.

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

## ADR-0126 — Lines of 100 characters, and PSF-2.0 and MIT-0 on the licence allowlist
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.**
  - Biome formats at a line width of 100, not 80, in the common part every project extends.
  - The licence allowlist gains `PSF-2.0` and `MIT-0`, as it gained MPL-2.0 before: its copyleft is per file and binds only changes to those files, and its packages here are build and test tools.
- **Rejected.** A line width of 80, Biome's default.
- **Why.** At 80 a typed signature or a call of a few arguments breaks over lines that each say little; at 100 this repository's code is about a thousand lines shorter (owner). Both licences are permissive and ask no more than `MIT` or `Python-2.0`, already on the list; `typing-extensions` is `PSF-2.0` and `cffi` is `MIT-0`, and FastAPI and MCP applications load both at runtime (owner).

## ADR-0127 — Python is a language, with uv, Ruff and ty
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** `python` is a language context held to every role, its source root `src/<import name>/` of each package, its specs in `tests/` beside `src/`, its entry `main.py`. On foundation it fixes the forms of core's rules: snake_case modules and packages; `test_<name>.py`, `<contract>_fake.py`, `<name>_fixtures.py` and the runner's file of shared fixtures — pytest's `conftest.py` — in `tests/`, the kind of a spec told by its folder; `None` as the only absence; no `Any`, held in signatures and generics; PEP 695 generics; aware datetimes; `@override` on every override; frozen, slotted, keyword-only dataclasses for business data; keyword-only parameters past the third; task groups; no `except` that only passes; Google docstrings only where core allows one; suppressions with their code and a reason after ` -- `; `sys.path` never touched; tools pinned with `==` in the `dev` group, floors for the program's dependencies, `requires-python` at the pinned minor — Python 3.14.8 until 3.15 is out and past the cooldown; with `package`, `py.typed` in every published package. On architecture: role files `<name>_<role>.py` in role folders spelled in snake_case, `__init__.py` as the surface — only re-exports and a sorted `__all__` — and empty in a layer folder; relative imports inside one feature at any depth, never out of it, absolute imports across features; a value from outside `object` until parsed; the environment read only under `root/`. Three implementations: `uv` — the only package manager, `exclude-newer = "3 days"`, `no-build`, no Python of its own, a workspace and a capped `uv_build` with `package`, `uv version` writing every member; `ruff` — two spaces, single quotes with docstrings in double, lines of 100, families chosen by name, a chain of parts `self.toml` ← `core.toml` ← `python.toml` since `extend` takes one file; `ty` — every rule an error, warnings failing, `# type: ignore` unread, passed as `--config-file`, under which ty reads no `[tool.ty]`. ls-lint takes the Python forms and the role folders; its `uv` and `ruff` parts skip `.venv` and `.ruff_cache`; lefthook's `ruff` part fixes and formats staged files; `templates/project/python/` carries the `pyproject.toml` of the settings with no preset and the `.gitignore` of the bytecode. This repository pins Python and uv in mise and the Python tools in its own `dev` group, which the e2e specs run; OSV-Scanner reads `uv.lock` as it is.
- **Rejected.** Pyrefly, the reviews' choice, for ty, from the makers of uv and Ruff, though it is in beta (owner); double quotes and four spaces, the experts' choice, for single quotes and two, as in TypeScript (owner); `ban-relative-imports = "all"` (`TID252`), which forbids the relative imports a feature keeps inside itself (owner) — a small AST check will hold them, and the 100 and 500 line limits, from the archive's `tools/`; an architecture part for Ruff, whose only candidate — `os.environ` banned outside `root/` — needs per-file ignores that resolve against the part's own folder, or match any path with a `root` in it; a glob in ls-lint's `ignore` for `__pycache__`, which makes ls-lint walk every link of the project, for rules that admit the bytecode's names.
- **Why.** A second language takes the same rules as the first in its own forms, held by the tools its practice has settled on, so a product written in TypeScript and Python is reviewed and checked the same way in both.

## ADR-0128 — Python is tested by pytest, Hypothesis and mutmut, and checked by import-linter, deptry, vulture, complexipy and python-check
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Seven implementations, each held to core's testing and code rules in Python. `pytest` — strict, `importlib`, warnings as errors, a coverage gate of 100 percent of lines and branches through pytest-cov with `--cov` never in `addopts`, pytest-randomly's order, no rerun plugin, `tests/integration/` and `tests/e2e/` left out of the unit specs by `norecursedirs`, the network refused by an autouse fixture of `tests/conftest.py` that the integration folder overrides, no `unittest.mock` and no patched module, async specs on anyio's plugin; run in each package with `pythonpath = ["tests"]`. Ruff's part `pytest.toml` extends `python.toml` as the last link of the chain, with `PT` and the bans of skips, expected failures, the `flaky` mark, `unittest.mock` and `pytest_asyncio`, and a project lifts only `S101` and `INP001` in `tests/`. `hypothesis` — properties written with `@given`, counterexamples kept by `@example`, and under `CI` its own `ci` profile, which already derandomizes and keeps no database. `mutmut` — every mutant killed, an equivalent one marked on its line by `# pragma: no mutate -- <reason>`, each mutant run without randomness or coverage; its gate is the archive's `tools/mutmut-check`, which clears `mutants/`, mutates the functions a change touches, a new module whole and the module a changed spec is named after with those it imports, and fails on every mutant not killed — survivor, untested or timed out. `import-linter` — core's import rules as contracts named after them, written over wildcards (`*.kernel`, `*.features.*`) so one template fits any package. `deptry` — unused dependencies and dev tools imported by the program. `vulture` — unused code from a confidence of 60, over `src` alone so code only the specs reach is dead, names a framework reaches in `ignore_names` with a reason. `complexipy` — cognitive complexity at most 10. `python-check`, the constitution's own Python tool in the archive's `tools/`, holds a function of at most 100 lines and a file of at most 500 outside `tests/`, and a relative import kept inside its module — a feature, a top-level folder, or the package root — with a feature never importing its own absolute path. The settings of the tools without `extends` start from `templates/project/python/pyproject.toml`, and `tests/conftest.py` beside it; ls-lint's parts skip the folders the tools write. Both Python tools are members of this repository's uv workspace and are held by its check — format, lint, types, their own limits, coverage, mutation and unused code — and the release builds them as `.pyz` archives the project's interpreter runs.
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

## ADR-0131 — Bun takes the program's options from tsconfig.json
**Date:** 2026-10-04 · **Status:** Accepted

- **Decision.** Where specs need Bun's types and the program does not, the program's configuration is `tsconfig.src.json`, the specs' is `tsconfig.test.json`, and `tsconfig.json` extends `tsconfig.src.json`, keeps `files` and `include` empty and references both (`specs-checked-by-their-own-config`).
- **Rejected.** The program's configuration as `tsconfig.json` with the specs left out: an editor reads only `tsconfig.json`, so it opened every spec without the `ESNext` lib, Bun's types or the decorator options and reported errors the check never saw. A `tsconfig.json` with references alone: Bun's transpiler reads only `tsconfig.json` and follows no reference, so a spec run by `bun test` lost the program's transpiler options, such as its decorators.
- **Why.** Extending the program's configuration gives Bun its options, while TypeScript still reads a file with no files of its own as a solution and opens each file with the configuration that holds it (verified on Bun 1.4.2 and TypeScript 7.0.2).

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
**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** The ls-lint part of each tool that writes a folder — `.venv`, `node_modules`, `mutants`, `.stryker-tmp` and the caches — skips it at the root and under one to four folders, `*/<folder>` to `*/*/*/*/<folder>`.
- **Rejected.** `**/<folder>`, which ls-lint expands by walking the whole tree once for each pattern before it lints: kit's check went from 0.07 s to 5.1 s, and this repository's from 0.1 s to 8 s for one part, and in a checkout that holds agents' worktrees it had not finished after ten minutes. The folders of each package listed in the project's `.ls-lint.yaml`, as kit did, which every repository of packages would write again.
- **Why.** The bounded patterns take 0.4 s in kit and 0.9 s in a checkout with eight worktrees, and four folders hold the layouts in use, `packages/<name>` to the package of a unit in several languages, `packages/<name>/<language>`, with a folder to spare; a package deeper lists its folders in its project's `.ls-lint.yaml`.

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

- **Decision.** Core's `invariant-values-are-plain-immutable-data` asks for each language's plain immutable record; Python's is a frozen dataclass of immutable fields that checks its invariant in `__post_init__` (`invariant-value-is-a-frozen-dataclass`), TypeScript's a branded primitive or readonly plain object. A Python command is a module `<name>_cli.py` in `cli/`, its shared flags in modules of one word, listed by the surface of `cli/`, registered by `root/wiring.py` and run through `main()` by `[project.scripts]` and `__main__.py`; the Python part of ls-lint holds the names. A published package may declare any `requires-python` floor, raises it only in a minor release, and lists every minor from the floor up in its classifiers; a package published for the public should floor it at the oldest minor of SPEC 0's three-year window; an application no registry distributes keeps its floor at the pinned minor. The toolchain pins every minor the floor admits — `mise.toml` takes a list, `python = ["3.14.8", "3.13.16"]` — and with `python-downloads = "never"` and `python-preference = "only-system"` uv takes mise's 3.13 and downloads none.
- **Rejected.** A `NamedTuple`, which equals any tuple of the same items, and a pydantic model or a msgspec `Struct` inside the program, which tie a value to a parsing library; plain modules of any snake_case name in `cli/`, which no tool could tell from a role file once Python spells the role as the last word; the pinned minor as a public package's floor, which drops every consumer one minor behind; SPEC 0's window as every published package's floor, which makes a package only its own team installs carry and test minors no consumer runs.
- **Why.** Each form is the one the language's community uses in 2026, and each was run before it was written: the dataclass's equality and hash, Typer's script and `python -m`, ls-lint over good and bad names, and uv finding each minor mise pins while an unpinned one resolves to whatever Python the machine has.

## ADR-0143 — A server's delivery layer is `api/`, and one handler answers every failure
**Date:** 2026-10-05 · **Status:** Accepted

- **Decision.** The delivery layer of a program that serves requests is `api/`, which TypeScript's ls-lint and dependency-cruiser parts admit and guard as they do `cli/`. One handler, registered by `root/`, answers every failure of every request: an expected error from its code and any other with a masked internal error; no error the program raises carries a status. A server framework passes every failure, its own included, to that one handler, and parses a request before its route or tool runs; NestJS, FastAPI and FastMCP meet both, as a probe of each showed: an unknown route or tool, a wrong method and a malformed body or argument all reached the handler the program registered. Such a refusal is the caller's failure of its kind, answered with what was refused; only a failure neither expected nor refused is masked. `client-checks-repeated-on-server` stays in `untrusted-client`.
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

- **Decision.** The `package` domain is removed and its meaning split three ways. Core's anatomy lays out every package (ADR-0157): an application keeps the application's tree whether or not it is distributed, and a package others import has the same tree without `root/` and `entrypoints/`, offers its entries and nothing else (`package-entries-curated`) and knows nothing of those that use it. The `workspace` domain holds a repository of several units, with the roles and the direction they have inside a program: the products in `packages/<name>/`, never importing one another; what two or more of them need in `shared/`, laid out by meaning like a program's `shared/` — `contracts/`, `kinds/` — a part appearing when a second product needs it; what knows nothing of the product in `libs/<name>/`; imports from `packages/` to `shared/` to `libs/` and never back; and a root that holds only the workspace and its tools' configuration. A unit in one language is the package itself; a unit in several holds `shared/`, its data in no language laid out by meaning (`schema/`, `conformance/`), and one package for each language in `<language>/`, the language's folder appearing with the second language (`unit-is-one-package-per-language`); `shared/` and a unit of `libs/` take the same form. Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module of its one package per language, an integration in `integrations/<framework>/`. A unit is imported by its name, which follows its folder under the repository's scope (`unit-named-after-its-folder`): in TypeScript `@<scope>/<name>`, `@<scope>/shared`, `@<scope>/libs-<name>`, an integration the subpath `@<scope>/<name>/<framework>`, and `#/` inside a package; in Python the distributions `<scope>-<name>`, `<scope>-shared` and `<scope>-libs-<name>`, imported as `<scope>_<name>`, `<scope>_shared` and `<scope>_libs_<name>`, an integration installed by the extra of its framework. dependency-cruiser and import-linter hold the direction by the folder an import resolves to, so a wrong name never hides a wrong direction. In TypeScript every package keeps `#/` with its `paths` mirror (ADR-0069) and is a project of its own: `composite`, its declarations and `.tsbuildinfo` emitted into its ignored `.tsc-cache/`, and the packages it imports in `references` (`unit-compiled-by-its-own-options`, `unit-built-as-a-composite-project`); an importer is checked against the imported package's declarations, so neither its `paths` nor an option it turns off, such as `allowImportingTsExtensions`, reaches the imported package's source. Bun resolves each file's `#/` by the `tsconfig.json` of its own package, so the packages run from source. Data in no language that several packages read is parsed by each at its edge, and its specs read the file itself by its path (ADR-0159). The `distribution` domain holds a package others install from a registry, one whose code they import or an application such as a command-line tool: what it ships, its versions, its deprecations and its publishing; `versions-follow-semver` moves with it unchanged. `constitution.yaml`'s `apps:` is renamed `packages:`, and every package, those of `shared/` and `libs/` included, gets its blocks there; a path below a package may get blocks of its own. dependency-cruiser holds the direction from the root's configuration (`product-units-blind-to-each-other`, `units-import-toward-libs`), counting a unit's folder as the unit whatever its languages, and refuses a relative import into another unit's folder by its `local` type without `aliased-workspace`; import-linter holds it with an `independence` contract and a `layers` contract over the import packages the project names, in the root's `pyproject.toml`.
- **Rejected.**
  - One `package` domain mixing a package's tree, the workspace and publishing, which bound a repository of applications that publishes nothing to publishing rules and left a distributed application without its tree.
  - A folder `apps/` beside `packages/`, which splits the products by a property, being run or being imported, that a package can change without moving.
  - A unit per shared need, `shared/<name>/`, which scatters what the product shares over many manifests while one unit with a part per need is found in one place.
  - A product split into several packages of one language — `core`, `wire`, `nestjs` — each with its manifest, which made the tools and the rules tell a group of packages from a unit and gave a consumer three installs for one product; its parts are modules of one package, and an integration an entry of it (owner).
  - `#/` only in applications, a package another imports reaching its own files by relative path: it split one alias rule into two, and still left the importer's compiler options reaching the imported source, so an importer with `allowImportingTsExtensions` off failed on the shared package's `./x.ts`.
  - Tier scopes, `@libs/<name>` and `@shared/<name>`, which a registry may not let the project own; a path alias, `@/libs/<name>`, which no manifest declares; `@<scope>/libs/<name>`, which npm and Bun refuse, a package's name holding one slash only.
  - Python namespace packages, `<scope>.libs.<name>` and `<scope>.shared` (verified on uv_build 0.12, ty 0.0.84, import-linter 2.15 and mutmut 3.8): deptry 0.25.1 maps an import by its top-level name, the one namespace every unit shares, so it reports correct dependencies as unused and passes after a dependency is removed; the import package's folder `src/<name>/` that python-check and the ls-lint parts read would become the namespace.
  - The `#*` alias with an explicit `index.ts`, which ADR-0069 rejected; `preserveSymlinks` to tell an import by name from one by path, which hides every import by name behind `node_modules/` and lets the direction pass whenever a unit is imported by name.
- **Why.** Each meaning loses its sense without a different thing: a package's tree without nothing, a workspace without several units, a release without a registry. Kept apart, a repository takes only what it has, and each rule is stated once. A package compiled by its own options alone is checked once, by its own rules, however many packages import it.

## ADR-0151 — Each unit is checked by the parts of its own blocks
**Date:** 2026-10-06 · **Status:** Accepted

- **Decision.** In a workspace, each unit's files are held by the parts of its own blocks — the repository's and those its path under `packages` adds — and no unit's parts reach another's (`unit-checked-by-its-own-parts`, a rule of `workspace`, which it means nothing without). Each tool's seam with `workspace` gives the form: Biome a `biome.<name>.jsonc` at the root for each unit with parts of its own, named by the unit's whole path, `biome.libs-money.jsonc`, so `packages/money` and `libs/money` cannot collide (`configuration-per-unit-at-the-root`), dependency-cruiser a configuration per unit (`cruiser-configuration-per-unit`) beside the root's, which holds the imports between units (`imports-between-units-held-at-the-root`), and knip each unit's parts under `workspaces['<path>']` and the root's under `workspaces['.']`, since knip ignores the top-level `entry` and `project` once `workspaces` is set, the root's included (knip 6.38). ls-lint's skip of `node_modules` is a common part of `bun`. Bun's coverage gate leaves out `../**`, the files of the units a unit imports, which their own specs hold (`coverage-gate-on-the-unit-alone`). Each unit with code its specs run has its own `stryker.config.mjs` (`stryker-configuration-per-unit`), and Stryker's part loads the archive's runner by its path from the preset's own file, which finds it from any folder. Each was verified on a workspace of the presets in `tests/e2e/workspace.e2e.test.ts`.
- **Rejected.** One run from the root with every unit's parts joined, which applies a framework's names or layers to the units that do not use it; overrides per path in one configuration, which only some tools have and which then differ from tool to tool; the parts of a unit kept inside its folder, which Biome cannot load, since it reads a plugin's path from the configuration at the top; a Biome configuration named by the last segment of the unit's folder, which gives `packages/money` and `libs/money` one name; a coverage ignore that names each imported unit, which changes with every new dependency; a `plugins` path written into each unit's `stryker.config.mjs`, which every unit would write again.
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
  - Python: the root of a uv workspace has no `[project]` (`workspace-root-has-no-project`); a distributed package names what it ships beyond its code by `source-exclude`, `source-include` and `license-files` (`files-shipped-named-in-pyproject`), since uv_build 0.12 packs the import package's folder whole, a stray `.env.local` included, leaves it out of the source distribution and the wheel alike under `source-exclude`, and ships the licence only when `license-files` names it; ls-lint has a Python part for `api/`. tsc: the specs' configuration references the program's where that is `composite`, or the specs fail with TS6307 (tsc 7.0.2).
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
  - The tools hold one form everywhere: ls-lint's role keys are `src/**/<role>` in TypeScript and `src/*/**/<role>` in Python, which ls-lint 2.3.1 matches at any depth, the top of `src/` included, and a key's own `.dir` names its folder, so `src/integrations` is a key of its own; dependency-cruiser counts `integrations/` among the module layers.
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
  - The homes: React and React Native in a UI's components and widgets and the binding units; the form library in a UI; NestJS in `app/`, `composition/` and `providers/`; zod in a UI's forms and `composition/`; a story anything it renders with; TanStack Query in the binding units and `root/`; the router in the route files, `-hooks/`, widgets, its file and `root/`; Lingui where text is rendered; yaml in the adapters and `libs/yaml`; in Python pydantic at the edge and in `shared/`, structlog in `root/`, httpx2 in the adapters, `libs/`, `shared/` and `root/`. The per-library bans they replace are removed: ky's `components-import-no-http-client`, TanStack Query's `components-import-no-query-library`, `adapters-never-import-the-cache-library` and `libs-import-no-query-library`, TanStack Router's `libs-import-no-router` and its two dependency-cruiser rules, Lingui's `primitives-import-no-message-catalog` and its two rules, and the template's pydantic, structlog and httpx2 contracts with their seams. `domain-imports-no-logging` and Biome's ban of date libraries stay.
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

## ADR-0161 — No rule carries out a rule of its own block
**Date:** 2026-10-07 · **Status:** Accepted

- **Decision.** An arrow leaves its block: a rule carries out a rule of core, of a block it requires or extends, or of the block its `with/` seam names, never a rule of its own block, in any file or on any axis. Across blocks the axes keep their order: a base rule tightens only a base rule, an `architecture/` or `workflow/` rule one of its own axis or a base rule. Of the 150 arrows inside a block, the 50 children ADR-0160 removes go; the other 100 stand alone with the level and the tags they had taken from their parent.
- **Rejected.** Arrows inside a block only into its `principles`, which kept a chapter whose laws every other chapter leans on; `extends` or `requires` between the axes of one block, which would state what is always true; cutting the arrows between blocks too, which would drop the check that a block below never loosens the one above and the cascade of an override.
- **Why.** Two rules of one block are of one generality; written with one meaning each, they say different things and need no link, while an arrow between layers carries a principle down to its form.

## ADR-0162 — Each block's base lives at its root
**Date:** 2026-10-07 · **Status:** Accepted

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
  - The three questions that place a rule move from `core.md` to core's chapter `placement`, read when a rule is written, so every session's digest keeps its room for the blocks a project lists.
- **Rejected.** A concrete `api` that the styles require, which lets a project list the base, forget its style and lose the style's rules unseen; one `api` with a chapter per protocol, the conditional sections ADR-0005 rejected; HTTP's rules in the base, which bind a tool server over standard input for nothing; `privacy` without opt-out and rights, which models one region's law; `analytics` requiring consent, which forced consent's MUSTs on products that never ask; `model-tools` as the name of the tool server's domain, whose rules are MCP's throughout.
- **Why.** A domain is an area a product has or lacks; when each holds one area and the seams hold what two share, a project lists what it is and gets exactly the rules that bind it.

