# Decision Log

> A journal of the decisions behind the constitution and the reasoning behind them. **Not a rulebook** — the chapters say *how things are*; this log records *why we decided it and what we rejected*.
>
> **Conventions:** append-only. One entry per decision, numbered. To change a decision, add a **new** entry that supersedes the old one (mark the old `Superseded by ADR-NNNN`) — never rewrite history. Statuses: `Accepted` · `Superseded` · `Proposed`. Entries up to ADR-0034 are inherited from the first web kit's log, condensed, with their original dates; the decisions that shaped the constitution itself start at ADR-0035.

---

## ADR-0001 — Clean Architecture organized by feature (vertical slices)
**Date:** 2026-05-29 · **Status:** Accepted

- **Context.** Folder-by-type scatters a single feature across many directories.
- **Decision.** Strict Clean Architecture, sliced by feature; layer slots filled lazily. (→ client `architecture` §0–2)
- **Rejected.** Folder-by-type; orthodox feature-sliced design whose `entities` carry UI; full enterprise ceremony everywhere.

## ADR-0002 — Layer naming: `root`, feature `app`, `kernel`
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** The application shell is `root`; the feature-level framework-binding layer is `app`; the shared business kernel is `kernel`. (→ client `architecture` §1)
- **Rejected.** `core` for the shell (means the centre, but it is the outer shell); `shared/kernel` (`shared` carries no business).

## ADR-0003 — CQRS-lite: two port interfaces, one implementation
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** Reads and writes are separated at the use-case and binding-unit level always; two repository interfaces for interface segregation, one implementation per external system. (→ client `architecture` §3)
- **Rejected.** A single port (loses type-level read/write protection); full CQRS with separate models and two implementations (ceremony against one backend).

## ADR-0004 — No DI container; the binding unit is the composition root
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** The `app` binding unit binds the concrete repository and calls the use-case; a plain composition function exists only for a non-reactive caller. (→ client `architecture` §2)
- **Rejected.** DI containers (almost never pay off on a client); a plain function per operation kept "just in case" (dead indirection until a second consumer appears).

## ADR-0005 — Shared kernel; duplication across contexts by default
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** Genuinely universal, stable business types lift down into `kernel`; contexts otherwise duplicate; structural mixins (`WithId`, `Paginated`) are composed, never subtracted from a god-type; the kernel-or-shared choice is a codified tree. (→ client `architecture` §5)
- **Rejected.** Feature↔feature imports; a large shared kernel; a `BaseEntity` with `Omit` per entity.

## ADR-0006 — Value Objects as branded types + functions, not classes
**Date:** 2026-05-29 · **Status:** Accepted

- **Why.** Branded primitives serialize through JSON, cache and URL cleanly; classes lose their prototype and add `new`/`this` friction. (→ client `architecture` §4)

## ADR-0007 — Entities are data shapes; behaviour lives in use-cases
**Date:** 2026-05-29 · **Status:** Accepted

- **Why.** The server owns entities and holds their invariant; a client-owned entity may carry a validating factory. (→ client `architecture` §4)

## ADR-0008 — Validation in three homes; one atomic rule reused
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** Untrusted responses validated in `infra`; business invariants in `domain`; form input through the kernel predicate reused. (→ client `architecture` §6)

## ADR-0009 — State ownership: server data in the cache, view state in its home, per-feature key factory
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** Server data lives only in the data layer's cache; shareable view state in the sphere's home (the URL on the web); a command invalidates only its own keys. (→ client `architecture` §9)
- **Rejected.** Duplicating server data into a store; one feature reaching into another's cache.

## ADR-0010 — Feature isolation with composition above; public API via `index.ts`
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** No feature imports another; `routes`/`root` compose through each feature's public index, which exposes widgets and entity types only. (→ client `architecture` §1, §10)

## ADR-0011 — Authorization as a feature; guards at the screens layer
**Date:** 2026-05-29 · **Status:** Accepted · (→ client `architecture` §11)

## ADR-0012 — Co-location by reason to change
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** Code lives in the layer that owns its reason to change, beside its consumer, and lifts on the second consumer; business logic stays in `domain` even with one consumer. (→ `principles` Law 12)
- **Rejected.** "Used once → next to the caller" as the sole criterion (pulls business logic into UI folders).

## ADR-0013 — Boundaries enforced by the dependency checker
**Date:** 2026-05-29 · **Status:** Accepted

- **Why.** Rules held only by discipline rot after a few deadlines; every law expressible as an import graph fails the check. (→ `principles` Law 15)

## ADR-0014 — DDD patterns deliberately not adopted on the client
**Date:** 2026-05-29 · **Status:** Accepted

- **Decision.** Entities, Value Objects, Repositories per aggregate root, Bounded Contexts, Anti-Corruption Layer, use-cases, Shared Kernel, Ubiquitous Language — yes. Domain Events, Event Sourcing, Specifications, heavyweight Factories — no: the server is the source of truth and the data layer handles reactivity. (→ client `architecture` §4)

## ADR-0015 — `#/` subpath imports as the path alias
**Date:** 2026-05-29 · **Status:** Accepted

- **Why.** Native to Bun and Node, one source of truth, zero resolver config; `@/` needs tsconfig paths, a bundler alias and a runtime shim. (→ `code` §1)

## ADR-0016 — `enum` for grouped values; `as const` for atomic ones
**Date:** 2026-05-29 · **Status:** Accepted

- **Why.** `ThemeMode.Dark` reads better and is stricter than bare strings; string enums avoid the numeric hole; the runtime object is an accepted cost. (→ `code` §3)

## ADR-0017 — Page pieces co-located beside routes; no `pages`/`layouts` layers
**Date:** 2026-05-31 · **Status:** Accepted

- **Why.** The router excludes prefixed folders from generation while allowing imports; extra layers were unjustified ceremony. Pitfall recorded: a folder layout file is `route.tsx`, not `index.tsx`. (→ web `architecture` §2, `tanstack-spa` §6)

## ADR-0018 — Page sections are dumb; the route loads and passes down (revisable per screen)
**Date:** 2026-05-31 · **Status:** Accepted

- **Why.** One obvious place where a screen's data and URL state assemble; a piece may take its own binding unit when a single loading point hurts. (→ web `architecture` §1–2)

## ADR-0019 — Barrels for every grouping folder; a barrel is a curated surface, not a mirror
**Date:** 2026-06-01 · **Status:** Accepted

- **Decision.** Any folder that groups items carries an `index.ts`, regardless of child count; a barrel exports only what consumers may couple to. (→ client `architecture` §10)

## ADR-0020 — Precise sub-barrels; layer folders carry no aggregate index
**Date:** 2026-06-04 · **Status:** Accepted

- **Why.** The import path states the coupling, same-named contracts coexist in their own sub-barrels, and the dependency rules bite with no aggregate to launder through. (→ client `architecture` §2)

## ADR-0021 — Two-layer typed errors; `shared` may depend on `kernel`
**Date:** 2026-06-04 · **Status:** Accepted

- **Decision.** Universal errors in `kernel/errors`, feature errors in `domain/errors`; a shared `mapApiToDomainError` helper in `shared` maps transport failures in every repository's `catch`; `shared` may reference the kernel, `libs` may not. (→ client `architecture` §6–7)

## ADR-0022 — Domain use-cases exist only when business logic exists
**Date:** 2026-06-12 · **Status:** Accepted

- **Why.** A pass-through use-case is dead indirection; the trigger is mechanical — does any rule of the operation survive the no-UI test? (→ client `architecture` §2)

## ADR-0023 — The port owns its operation contract, in one file
**Date:** 2026-06-12 · **Status:** Accepted

- **Why.** One owner per type, one file per port, the import path states the coupling; three earlier layouts (folder + types file, CQRS buckets, folder per port) and contract aliasing through use-cases had produced drift. (→ client `architecture` §2)

## ADR-0024 — Repositories are module objects, not classes
**Date:** 2026-06-12 · **Status:** Accepted · (→ client `architecture` §3)

## ADR-0025 — Streaming ports expose `AsyncIterable` of domain events
**Date:** 2026-06-12 · **Status:** Accepted

- **Rejected.** Callback parameters (invert control, invite wire types inward); library stream types in port signatures (couple the contract to a tool). (→ client `architecture` §3)

## ADR-0026 — The binding-unit result contract: `undefined`-first, no fabricated defaults
**Date:** 2026-06-12 · **Status:** Accepted · (→ client `architecture` §2)

## ADR-0027 — Optimistic updates live in the mutation lifecycle
**Date:** 2026-06-12 · **Status:** Accepted · (→ client `architecture` §9, `tanstack-spa` §5)

## ADR-0028 — One adapter per external system
**Date:** 2026-06-12 · **Status:** Accepted · (→ `principles` §3, client `architecture` §3)

## ADR-0029 — Chapters name concerns; only the stack names brands
**Date:** 2026-06-12 · **Status:** Accepted

- **Why.** Laws should survive tool churn: the placement rule is the law, the brand is configuration; the design-system toolchain is a swappable choice, not a structural assumption. (→ `principles` §2, `intro` §6)

## ADR-0030 — Variant mechanisms by reach: a declarative map for self-contained variants, data-attributes for cascade
**Date:** 2026-06-12 · **Status:** Accepted · (→ `ui` rule 3)

## ADR-0031 — Conventional commits as the hook enforces them; rules move with the change
**Date:** 2026-06-12 · **Status:** Accepted

- **Decision.** One line, `type: Subject`, no scope, empty body; the why in the pull request; any change that contradicts or extends a rule ships the amendment and its decision entry together. (→ `workflow` §6, §8)

## ADR-0032 — Illegal states unrepresentable; errors never swallowed
**Date:** 2026-06-12 · **Status:** Accepted · (→ `principles` Laws 13–14, `code` §9–10)

## ADR-0033 — The observability axis is deferred; the no-swallow rule binds now
**Date:** 2026-06-12 · **Status:** Accepted

- **Decision.** Structured logging, levels, correlation and safe-context conventions are deferred and tracked here; what may be logged is already fixed by `security` §4.

## ADR-0034 — The testing axis is deferred
**Date:** 2026-06-12 · **Status:** Superseded by ADR-0044

---

## ADR-0035 — The constitution is its own private repository; devkit is its executable half
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** The rules lived as gitignored copies inside one web project and were meant to be copied verbatim into every new one. A hub was needed for web, mobile and the command-line tool alike, kept private.
- **Decision.** A private repository, `droneey/constitution`, holds the rules. The public `devkit` holds the executable rules — linter, hooks, TypeScript configs. One-way dependency: chapters name devkit packages in their "enforced by" cells; devkit never references the constitution.
- **Rejected.** A folder inside devkit (public, published to npm, different release cadence); a name describing a property (`devkit-secret`) rather than the thing.

## ADR-0036 — Blocks of six kinds, assembled per project; composition over inheritance
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** The rules had to serve any software, then a kind of application, then a stack, then a project — without editing a shared document per project.
- **Decision.** Every unit of rules is a block of one kind — `core`, `language`, `sphere`, `concern`, `framework`, `stack` — with a `block.yml` interface: summary, `requires`, `refines`, chapters. A project pins a named assembly, an ordered list of blocks. Shared material is a block other blocks require; nothing is inherited.
- **Rejected.** A single ladder of levels (shared client material had no home without duplication); per-project block lists in `PROJECT.md` (drift across projects; presets are the hub's job); folder nesting to express sharing (hidden coupling instead of a declared dependency).

## ADR-0037 — The dependency rule for documents and the precedence
**Date:** 2026-09-09 · **Status:** Accepted

- **Decision.** A chapter refers only to blocks of its own kind or above, by concern; lower blocks are named only in manifests; the log refers to chapters and chapters never cite the log. Precedence: a tool-enforced rule wins; within an axis the more specific block tightens; across axes structure wins. (→ `intro` §5–6)
- **Why.** The same law that keeps code swappable keeps the blocks swappable, and a script can hold it.

## ADR-0038 — Spheres are named by kind of application; `client` is shared; `ui` is a concern; `react` is a framework
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** "Frontend" and "backend" say little; the repositories are already named `-web`, `-mobile`, `-cli`. Web and mobile share most of their anatomy and all of the design-system principles; two stacks share the React discipline.
- **Decision.** Spheres are `web`, `mobile`, `cli`, later `api`. The anatomy they share is the `client` sphere both require and refine. The design system is the `ui` concern, requirable and swappable on its own. React is a `framework` block, created because two stacks consume it. A sphere is framework-free and names its reactive unit by concern; examples illustrate with the default stack.
- **Rejected.** One `frontend` sphere (mobile and web laws diverge in navigation and persistence); duplicating the client anatomy in both spheres; a sphere that binds a framework (the framework became unswappable).

## ADR-0039 — Core is one block
**Date:** 2026-09-09 · **Status:** Accepted

- **Why.** No assembly ever omits a core chapter; splitting core into blocks would create units nothing composes differently. A block exists only when some assembly takes it separately or swaps it.

## ADR-0040 — The chapter budget: 500 lines and a summary per block
**Date:** 2026-09-09 · **Status:** Accepted

- **Decision.** A chapter stays under 500 lines and becomes a folder with an index when it grows; every block carries a one-paragraph summary an agent reads before opening chapters.
- **Why.** Agents load chapters into a bounded context; a summary lets them pick, a budget keeps a pick affordable.

## ADR-0041 — Naming: uppercase root signal files, kebab-case inside
**Date:** 2026-09-09 · **Status:** Accepted

- **Decision.** `README.md`, `PROJECT.md`, `DECISIONS.md` and the files tools look for keep uppercase names at a repository root; everything inside folders is kebab-case.
- **Why.** Uppercase marks a convention a tool or a person recognises at a glance; the rest is a library of documents and follows the code naming rule.

## ADR-0042 — Deviations are project decisions with a `Deviates:` line
**Date:** 2026-09-09 · **Status:** Accepted

- **Decision.** A project never edits a block. It departs through an entry in its own `DECISIONS.md` carrying `Deviates:` with the chapter and section; the default rules stay in force everywhere else.
- **Why.** Departures stay visible, reviewable and reversible; the fleet's default stays strict.

## ADR-0043 — Semantic aliases: the mechanism is fleet-wide, the vocabulary is the project's
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** The web kit listed a fixed set of global aliases (`Id`, `Email`, …); the command-line tool used none.
- **Decision.** Any project may declare semantic aliases in one ambient file and prefer them over bare primitives; each project declares only the aliases it uses. The rule prescribes the mechanism, never the list. (→ `code` §7)
- **Rejected.** A fixed fleet-wide list (every project would carry vocabulary it does not have); dropping the mechanism (readable signatures were the point).

## ADR-0044 — The testing axis is adopted from the command-line tool's practice
**Date:** 2026-09-09 · **Status:** Accepted · **Supersedes ADR-0034**

- **Context.** The web kit had deferred testing; the command-line tool already ran a 100 percent gate with fakes behind ports and no real world in tests.
- **Decision.** A `testing` chapter in core: tests in the same change, inward-out, fakes over mocks, no network or real effects, `__tests__/<name>.spec.*` beside the unit, a native coverage threshold of 100 percent for functions and lines held in the runner's configuration. (→ `testing`)
- **Rejected.** Co-located `<name>.test.ts` files (the fleet's real practice is `__tests__/`); a script parsing coverage output (the runner has a native gate).

## ADR-0045 — Security and collaboration are core chapters
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** Secrets, environment references, pinning and the rules for working with agents lived in chat and in one tool's README.
- **Decision.** `security` fixes secrets as references, least privilege, exact pins, safe logging and gated irreversible operations; `collaboration` fixes decide-in-chat, consent boundaries, scope honesty, branch-only work, no tool attribution and the limits of delegated agents.

## ADR-0046 — One `check` script per repository
**Date:** 2026-09-09 · **Status:** Accepted

- **Decision.** Every repository exposes `check`; the stack chapter says what it runs. The `workflow` chapter names only the script. (→ `workflow` §3)
- **Why.** Core must not name a runner or a tool; a stable script name is the one interface that survives every stack.

## ADR-0047 — Every change through a pull request; the branch prefix decides the version
**Date:** 2026-09-09 · **Status:** Accepted

- **Decision.** No direct pushes to `main`; squash merges; the required `check`; `feature` bumps minor, `fix` and `hotfix` bump patch through the shared workflows; a human promotes a pre-release. (→ `workflow` §7)
- **Why.** Direct pushes skipped the check and never produced a version.

## ADR-0048 — Mobile blocks are skeletons until the first mobile project
**Date:** 2026-09-09 · **Status:** Accepted

- **Why.** No mobile project runs on the constitution yet; writing a stack nobody chose would invent rules. The sphere and the stack list their questions as `TODO:` and the client chapter alone applies meanwhile.

## ADR-0049 — Delivery: one clone per machine and user-level pointers
**Date:** 2026-09-09 · **Status:** Superseded by ADR-0057

- **Decision.** The constitution is cloned once per machine at a fixed path; agent tooling points at it from the user's own configuration; a project commits only `PROJECT.md` and `DECISIONS.md`. Skills built from the chapters are linked from the clone. Implementation follows in a later release.
- **Rejected.** Copying the documents into each project and ignoring them; a git submodule (a committed pointer to a private repository); a private package (registry authentication on every machine and in CI).

## ADR-0050 — The log is seeded with the inherited decisions, condensed
**Date:** 2026-09-09 · **Status:** Accepted

- **Decision.** The still-valid decisions of the first web kit are carried here as ADR-0001 to ADR-0034 with their original dates; superseded generations and project-local decisions are not.
- **Why.** The rationale behind the chapters must stay re-derivable; a log that starts at the blocks would present the inherited laws as unexplained.

## ADR-0051 — Concerns rank above spheres
**Date:** 2026-09-09 · **Status:** Accepted · **Refines ADR-0036, ADR-0037**

- **Context.** The kinds table placed `concern` below `sphere` while `web` and `mobile` required and refined `ui`, and `ui` required `client` — a cycle between kinds, the very thing the dependency rule forbids.
- **Decision.** The kinds are ordered core, language, concern, sphere, framework, stack. A concern is what several kinds of application share, so it ranks above the spheres that refine it; assemblies list blocks in that order. (→ `intro` §3, §6)
- **Why.** The order of the table is the direction of dependency, and the check enforces it.

## ADR-0052 — The `ui` concern requires nothing; naming by location belongs to the client anatomy
**Date:** 2026-09-09 · **Status:** Accepted · **Refines ADR-0038**

- **Context.** `ui` named `libs/ui`, `shared/ui`, `root/ui` and `features/*/ui` — the client anatomy — in its theming, prop-reuse and locale rules, and carried the table that maps a location to a prefix.
- **Decision.** The prefix table and the `-widget` suffix move to the client `architecture` chapter's homes section; the remaining rules speak of the theme module, the primitive library and every UI folder. `ui` has no `requires`. (→ `ui` rules 1, 5, 6, 11, 15; client `architecture` §8)
- **Why.** A concern that names one sphere's folders cannot be taken by another; independence is replaceability.

## ADR-0053 — A stack is named after its platform layer, never after the sphere
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** The stacks were `tanstack-spa`, `expo` and `bun-cli`: two named after the application shell, one after the runtime plus the sphere.
- **Decision.** A stack carries the name of the layer that makes it that stack — the application shell of a browser or device client, the runtime of a tool that runs on it — and never repeats the sphere, which the assembly already names. `bun-cli` becomes `bun`; the assembly stays `cli-bun`. (→ `intro` §3)
- **Why.** Bun is tooling in the browser stacks and the platform in the tool's; the name says which.

## ADR-0054 — Script names follow `<subject>:<action>`
**Date:** 2026-09-09 · **Status:** Accepted · **Refines ADR-0046**

- **Context.** One stack said `typecheck` and `test:unit`, the other `type:check` and `test`.
- **Decision.** `lint:check`, `type:check`, `test:unit`, `architecture:check`, `build`, and the umbrella `check`, in every stack. (→ stack chapters §6)
- **Why.** One pattern, nothing to guess; a repository that differs renames in a fix.

## ADR-0055 — Environment names are declared in one place per repository
**Date:** 2026-09-09 · **Status:** Accepted · **Refines ADR-0045**

- **Context.** `security` §1 spoke of a document declaring `${NAME}` references — the command-line tool's mechanism, not a rule every application can follow.
- **Decision.** The rule is the declaration: every name a repository reads is listed in one place — `.env.example` for an application, the tool's own document for a tool — and code reads no undeclared name. (→ `security` §1)

## ADR-0056 — Core states release rules, never the release mechanism
**Date:** 2026-09-09 · **Status:** Accepted · **Refines ADR-0047**

- **Context.** `workflow` §7 and `security` §6 named the fleet's shared workflows and a version bump every repository would perform — a repository on another forge, or one that publishes no versions, could not comply.
- **Decision.** Core keeps the rules: pull requests only, squash, the required check, prefix-driven bumps where a repository versions itself, shared automation wherever the forge offers it. The mechanism is the repository's. (→ `workflow` §7, `security` §6)

## ADR-0057 — The project's own agent file delivers the constitution
**Date:** 2026-09-09 · **Status:** Superseded by ADR-0062 · **Supersedes ADR-0049**

- **Context.** ADR-0049 put the pointer in the user's machine-wide configuration, invisible inside the repository.
- **Decision.** A project commits a `CLAUDE.md` from the `core` template: it imports the `intro` chapter from the constitution's clone at the fleet's path and says nothing else. No machine-wide file, no copy of the documents, no submodule. The clone path is a fleet convention; skills built on the chapters follow later. (→ `intro` §1)
- **Why.** The file in the repository makes the governance visible where the work happens; the import keeps the documents in one private place.

## ADR-0058 — Additional entrypoints live under `src/entrypoints/<name>`
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** A client may ship a second bundle — an embed script a host page loads — whose home the anatomy did not name, and a contract shared by the app and that bundle had no owner.
- **Decision.** `src/entrypoints/<name>/` holds everything that ships only in that bundle and composes like a screen through public indexes; nothing imports an entrypoint. A contract two bundles share belongs to the feature that owns it. Generated output gets its own top-level folder, named by the stack. (→ client `architecture` §1, §7)

## ADR-0059 — The constitution verifies itself and is released by tags
**Date:** 2026-09-09 · **Status:** Accepted

- **Context.** The dependency rule, the manifests and the budget were held by hand; a pin needs a tag to point at.
- **Decision.** The repository is a Bun project on the devkit packages with one `check`: lint, types, tests with the native coverage gate at 100 percent, and `blocks:check`, a script that loads every manifest through a schema and applies one rule per file — manifests, assemblies, kind direction, budget, links, prose references, decision numbering. Pull requests run it in CI; merges into `main` cut tags through the fleet's shared workflows. (→ `intro` §3–§8, README)
- **Why.** A rule only reviewers hold rots; the check makes the dependency rule and the composition contract mechanical, the same standard the chapters demand of every other repository.

## ADR-0060 — Bun dependency updates wait for a Dependabot that reads lockfile version 2
**Date:** 2026-09-09 · **Status:** Accepted · **Deviates:** `security` §3, for this repository

- **Context.** A fresh `bun install` on Bun 1.4 writes `bun.lock` at lockfile version 2; the updater image Dependabot runs ships Bun 1.3.5 and reads version 1 only, so the weekly bun job failed on its first run. Older repositories still carry version 1 lockfiles and are not affected until they regenerate them.
- **Decision.** `dependabot.yml` watches GitHub Actions only. The bun packages are bumped by hand in fix pull requests until Dependabot's updater reads version 2, at which point the ecosystem returns.
- **Rejected.** Regenerating the lockfile at version 1 with an older Bun — a hidden dependency on a runtime the repository does not pin, silently undone by the next `bun install` that migrates the file.

## ADR-0061 — A test case is three marked sections, never merged
**Date:** 2026-09-11 · **Status:** Accepted · **Refines ADR-0044**

- **Context.** `testing` §5 named Arrange, Act, Assert in one clause; cases in the fleet were already written that way, but nothing said a section may not absorb another — a `beforeEach` that acts, an expectation inside Act, a second Act after an Assert.
- **Decision.** Every case is three sections in that order, each opened by its own marker, each present once; a section never merges into another; a second Act is a second case; a failure is captured in Act and checked in Assert. (→ `testing` §6)
- **Why.** The three markers are what make a case readable at a glance and reviewable without running it; a merged section is where the intent of a test goes missing.

## ADR-0062 — The constitution is delivered as a Claude Code plugin from its own repository
**Date:** 2026-09-11 · **Status:** Accepted · **Supersedes ADR-0057**

- **Context.** ADR-0057 put a machine path into a committed file: the agent template imported the intro from a clone at one developer's layout, and a folder rename broke it within two days.
- **Decision.** The repository is a plugin and its own marketplace: `.claude-plugin/plugin.json` and `marketplace.json`, installed once per machine with two commands. A `SessionStart` hook reads `PROJECT.md` from the session's directory and, when it names an assembly, prints the `intro` chapter, the assembly and the manifests of its blocks into context from the plugin's own root; it also reports a pin that differs from the installed version, which `package.json` carries. The recipes are skills the plugin ships from inside their blocks. A project commits `PROJECT.md` and `DECISIONS.md` and no agent file. (→ `intro` §1, §8; README)
- **Rejected.** A fixed home path such as `~/.constitution` — still a path and still a confirmation dialog per project. A dependency in `package.json` — the `@droneey` scope already lives on npmjs and cannot point at a private registry, and a git dependency needs private access in every consumer's CI. A machine-level agent file — invisible in the repository and tied to one tool without versioning.
- **Why.** Nothing in any repository names a machine; the version comes with the install; the same channel carries the rules and the recipes.

## ADR-0063 — Templates live at the root; scaffolding is the `project-init` skill
**Date:** 2026-09-11 · **Status:** Accepted

- **Context.** The `PROJECT.md` and `DECISIONS.md` templates sat under `blocks/core/templates/` behind a `templates` key the core manifest alone carried — a bend in the block model for files that are copied once, not read as rules.
- **Decision.** `templates/` at the root holds the two files a project starts from, reachable by hand; the interview that fills them is the `project-init` skill in `blocks/core/skills/`; a block manifest carries chapters only. (→ README)
- **Why.** A block is rules; a template is a starting point; a skill is a procedure. Three kinds of thing, three homes.

## ADR-0064 — Package manifests are checked by Syncpack through the devkit
**Date:** 2026-09-11 · **Status:** Accepted · **Refines ADR-0054**

- **Context.** `package.json` had no gate: field order and version ranges drifted per repository, and the devkit checked only its own versions.
- **Decision.** Every stack with a `package.json` extends `@droneey/devkit-ts-syncpack` from a one-line `.syncpackrc.mjs` and runs `packages:check`, `syncpack lint` for versions and ranges and `syncpack format --check` for the field order, as the second step of `check`. Dependency updates come from Renovate through the fleet preset, so `dependabot.yml` leaves. (→ stack chapters §1, §6)
- **Why.** The order and the ranges are one decision for the fleet, made once in the devkit and enforced where the manifest lives; a check that only fixes cannot hold a rule.

## ADR-0065 — The bun test configuration is the devkit template
**Date:** 2026-09-11 · **Status:** Accepted · **Refines ADR-0044**

- **Context.** `bunfig.toml` has no `extends`; each repository listed its own entrypoints in the coverage ignores, so the file differed everywhere for one line.
- **Decision.** The ignores are globs bound to the anatomy — `**/__tests__/**`, `**/main.ts`, `**/composition.ts` — and the file is the devkit template copied as it is; a repository with another entrypoint records the extra line as a departure. (→ `bun` stack §5)
- **Why.** A file that cannot be shared can still be identical; naming the entrypoints by convention makes it so without a checker.
