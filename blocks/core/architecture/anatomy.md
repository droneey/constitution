# Anatomy

> Where code lives and what it may import. The laws of `principles` say why; this chapter lays them out as folders, names and import rules. Every block that adds a layer or a role states it in its own chapter; none removes one.

## What the anatomy governs

- **An application.** The tree below lays out one application. The block that owns its entry surface names its delivery layer: a command-line platform names its commands' folder, an API domain its handlers', a router its screens'.
- **A tooling program** with no entry surface of its own — the scripts of a repository — has only entrypoints: each command is `entrypoints/<name>/`, and its entry file builds `root/`.
- **A package**, and a repository of packages, follow the package domain.

A folder appears when its first member does. The trees show every place a file may go, not folders to create in advance.

## The top level

```
src/
├── main.*             the entry: builds root and runs it
├── root/              the composition root: the wiring file, providers, configuration parsed at boot,
│                      the boundary error handler
├── <delivery>/        the delivery layer, named by the block that owns the entry surface
├── composition/       the only code that knows several features
├── features/<f>/      bounded contexts, blind to each other
├── contracts/         ports two or more features need
├── adapters/<system>/ adapters implementing those shared ports
├── kernel/            shared business vocabulary: pure, small, stable
├── shared/            application plumbing without business, used by two or more features
├── libs/              project-agnostic code: primitives, vendor clients, a UI kit; publishable
└── entrypoints/<n>/   another artifact of the repository, or a command of a tooling program
```

## anatomy-top-level-by-concern · SHOULD
A program's source is laid out by concern in the folders of the top-level tree, and in no other top-level folder. The wiring file is `root/wiring` with the language's extension.

| Why | Check | Tags |
|---|---|---|
| a reader who knows one repository finds their way in every other, and a file has one obvious place. | tool — names | [] |

## root-imported-only-by-entry-and-delivery-wiring · MUST
`root/` is imported only by entry files and by the delivery layer's own wiring. Nothing else reaches back to the composition root.

| Why | Check | Tags |
|---|---|---|
| the root knows every concrete choice; code that imports it depends on all of them and can no longer be tested with fakes. | tool — architecture | [] |

## nothing-imports-an-entrypoint · MUST
No code imports an entrypoint. An entrypoint composes features through their surfaces, `shared/` and `libs/`, and holds everything that ships only in its artifact.

| Why | Check | Tags |
|---|---|---|
| an entrypoint is a separate artifact; importing it drags that artifact into another one. | tool — architecture | [] |

## kernel-imports-only-itself · MUST
`kernel/` imports only itself. It holds business types and values every feature shares — money, an email address, a date range — and structural contracts such as a paginated result.

| Why | Check | Tags |
|---|---|---|
| everything depends on the kernel, so it must depend on nothing that changes. | tool — architecture | [] |

## libs-import-no-application-code · MUST
`libs/` imports no application code — no feature, `kernel/`, `shared/`, `contracts/`, `adapters/` or `root/` — and knows nothing of the repository that uses it.

| Why | Check | Tags |
|---|---|---|
| code in `libs/` could be published tomorrow; one import of the application ties it to this program for good. | tool — architecture | [] |

## shared-imports-no-feature-or-root · MUST
`shared/` imports no feature and not `root/`. It holds application plumbing without business: helpers, constants and types two or more features use.

| Why | Check | Tags |
|---|---|---|
| plumbing that knows a feature is part of that feature, and every other feature that uses it depends on it too. | tool — architecture | [] |

## kernel-or-shared-by-meaning · SHOULD
A shared piece with business meaning goes to `kernel/`; one without goes to `shared/`; one that would make sense in any program goes to `libs/`. Each is created by symptom, when a second feature needs it, and `kernel/` stays small.

| Why | Check | Tags |
|---|---|---|
| the folder then says what a piece means, and the kernel does not grow into a second domain every feature depends on. | review | [] |

## composition-on-the-second-consumer · SHOULD
Composition across features lives in the delivery unit that needs it, which assembles features through their surfaces. It moves to `composition/<name>/` when a second consumer needs it, and facts derived from several features are derived there.

| Why | Check | Tags |
|---|---|---|
| someone above the features must assemble them; keeping it where it is used, until it is shared, avoids a composition layer nobody needs yet. | review | [] |

## protocol-between-artifacts-in-shared · SHOULD
A protocol two artifacts of one repository speak — the messages an embedded frame and its host exchange — lives in `shared/<protocol>/`, imported by both.

| Why | Check | Tags |
|---|---|---|
| each side then speaks the same types, and neither artifact imports the other. | review | [] |

## The feature

```
features/<f>/
├── domain/                pure
│   ├── entities/          business types and enums
│   ├── contracts/         ports; data ports are repositories/{queries,commands}/<aggregate>.repository.*
│   ├── use-cases/         business use-cases, only when the operation has business logic: {queries,commands}/<op>/
│   └── errors/            typed errors with codes
├── adapters/<system>/     this feature's contracts over one external system (wire ↔ domain)
├── app/                   binding units: use-cases/{queries,commands}/<op>/, and role folders from the vocabulary
└── index.*                the curated surface
```

## feature-anatomy · SHOULD
A feature is laid out as `domain/`, `adapters/<system>/` and `app/` with the role folders of the tree, and a surface at its root. A block adds its own layers, such as a UI's.

| Why | Check | Tags |
|---|---|---|
| a use-case, a port or an adapter is found in the same place in every feature. | tool — names | [] |

## data-ports-split-by-reads-and-writes · SHOULD
A data port is a repository per aggregate, one file per side: `repositories/queries/<aggregate>.repository` for reads and `repositories/commands/<aggregate>.repository` for writes, each declaring its operations' parameters and results. The folder carries the side, never the file name.

| Why | Check | Tags |
|---|---|---|
| reads and writes change apart, and a caller that only reads cannot reach a write. | tool — names | [] |

## pipeline-stages-under-steps · SHOULD
A pipeline use-case keeps its stages under `steps/`, in the order the use-case calls them; a stage never calls another.

| Why | Check | Tags |
|---|---|---|
| the use-case reads as the pipeline, and a stage can be added, removed or tested alone. | review | [] |

## contracts-know-no-vendor-or-other-contract · MUST
A contract — a port, its parameters and results — imports no vendor, no adapter, no feature other than its own, and no other contract's internals. It speaks only the domain's types.

| Why | Check | Tags |
|---|---|---|
| a contract that knows a vendor ties every implementation to it, and the domain that declares it along with them. | tool — architecture | [] |

## adapters-never-import-each-other-or-callers · MUST
An adapter imports its contracts, `kernel/` and `libs/`, and never a feature's application layer, the delivery layer or another adapter. What two adapters share lives in `libs/`.

| Why | Check | Tags |
|---|---|---|
| adapters that know each other or their callers form a second, hidden program beside the domain. | tool — architecture | [] |

## feature-speaks-in-its-own-contracts · SHOULD
A feature that needs an answer from another declares a contract in its own words and receives an input built for it; composition implements the contract through the other feature's surface.

| Why | Check | Tags |
|---|---|---|
| the feature stays blind to the other, and the other can change its model without breaking it. | review | [] |

## Surfaces

A surface is the file the language resolves when a folder is imported. It re-exports and does nothing else.

## import-only-through-surface · MUST
Outside a folder, a caller imports only its surface. Inside it, files import each other directly and never their own folder's surface.

| Why | Check | Tags |
|---|---|---|
| the surface is the folder's offer, so a caller couples only to what is offered; importing one's own surface is where import cycles begin. | tool — architecture | [] |

## layer-folder-has-no-surface · MUST
A layer folder — `domain/`, `app/`, `adapters/`, `src/`, `features/`, `libs/` — has no surface and is never an import target. A caller imports the role folder inside it, so the feature's root surface is the only one that re-exports a whole feature.

| Why | Check | Tags |
|---|---|---|
| an import then names the role it couples to, and no aggregate hides an edge the layer rules forbid. | tool — architecture | [] |

## surface-only-re-exports · MUST
A surface re-exports by name what callers may use: no declaration, no logic, no re-export of everything.

| Why | Check | Tags |
|---|---|---|
| a surface that declares or computes becomes a room of its own, and a wildcard re-export offers internals nobody chose to offer. | tool — lint | [] |

## surface-offers-operations-not-mechanisms · SHOULD
A feature's surface offers its operations and its presentation — use-cases, binding units, entities, widgets — and never its mechanisms: repositories, mappers, wire types, cache keys.

| Why | Check | Tags |
|---|---|---|
| a caller that reaches a mechanism depends on how the feature works rather than on what it does. | review | [] |

## dependencies-imported-from-their-entries → access-only-through-curated-surface
A dependency is imported only from the entries it publishes, never from its internal paths.

| Why | Check | Tags |
|---|---|---|
| internal paths change between releases without notice, and an update then breaks the program. | tool — lint | [] |

## Placement

## contract-lifts-on-the-second-feature · SHOULD
A contract belongs to the feature that needs it. When two features need it, it lifts to `contracts/`; a business type two features share lifts to `kernel/`, never sideways into one of them.

| Why | Check | Tags |
|---|---|---|
| a contract owned by one feature and used by another couples the second to the first. | review | [] |

## one-adapter-per-system · SHOULD
An adapter implements, over one external system, every contract of its owner that system serves; it lives beside its contracts' owner. There is one adapter per system per owner, never one per method.

| Why | Check | Tags |
|---|---|---|
| one system's knowledge — its client, its errors, its wire shapes — is then in one place. | review | [] |

## adapter-receives-its-dependencies → adapter-built-by-factory-or-module-object
An adapter receives its dependencies — the transport, the clients it speaks through — from the composition root, and never imports a shared instance of them.

| Why | Check | Tags |
|---|---|---|
| a dependency the adapter receives is visible and replaceable, in production and in tests; a shared instance it imports is neither. | review | [] |

## real-effects-chosen-at-composition-root · SHOULD
A port for an effect — clock, randomness, identifiers, environment, file system, processes, network — is a contract placed like any other, its real implementation is an adapter, and only a composition root chooses the real one. Logic never calls the effect directly.

| Why | Check | Tags |
|---|---|---|
| everything else receives the effect through its port, so a test replaces it without touching the code and runs deterministically. | review | [testing] |

## vendor-clients-in-libs · SHOULD
A vendor client without application knowledge, and any pure project-agnostic helper, lives in `libs/<system>/`.

| Why | Check | Tags |
|---|---|---|
| it can be reused by every adapter of that system and by other programs, and the adapters stay thin. | review | [] |

## delivery-unit-beside-what-it-serves · SHOULD
A delivery unit that serves one feature lives in that feature's `app/`, where the entry surface allows it; one that composes several lives in the delivery layer or in `composition/`.

| Why | Check | Tags |
|---|---|---|
| a unit lives with the reason it changes. | review | [] |

## delivery-units-stay-thin · SHOULD
A delivery unit — a screen, a command, a handler, a tool function — parses its flags or parameters, resolves its input, calls one use-case, binding unit or composition, and presents the result. It holds no business logic.

| Why | Check | Tags |
|---|---|---|
| business logic in a delivery unit cannot be reused by another transport or tested without it; kept out, it runs the same from a test, another command or another transport. | review | [] |

## Names

**Folders of core's vocabulary:**
- layers: `root`, `features`, `composition`, `contracts`, `adapters`, `kernel`, `shared`, `libs`, `entrypoints`, `domain`, `app`;
- roles: `use-cases`, `queries`, `commands`, `entities`, `value-objects`, `repositories`, `errors`, `constants`, `types`, `utils`, `models` (wire and persistence shapes inside adapters), `providers` (framework providers and the instances they wire).

**Suffixes of core's vocabulary:** `.entity`, `.error`, `.repository`, `.port`, `.adapter` (a port's implementation that is not a repository), `.use-case`, `.utils`, `.types`, `.constants`, `.model`, `.config`. The language fixes the spelling. Each block names its own folders and suffixes in its chapter, and a project adds its own the same way.

## folder-named-for-purpose-or-role · SHOULD
A folder is named for its purpose, or by a role of the vocabulary of the project's active blocks. No other technical name: no `helpers`, `misc`, `stuff`, `magic`, or a singular `lib`. The layer names are fixed words, whatever their grammatical number.

| Why | Check | Tags |
|---|---|---|
| a folder named for what its contents are for tells a reader about the system; one named for their shape tells nothing. | tool — names | [] |

## one-purpose-per-folder · SHOULD
A folder holds one purpose, said in one phrase without "and". It appears to separate purposes already mixed, never for members that do not exist yet.

| Why | Check | Tags |
|---|---|---|
| a folder of two purposes gives a new file two places to go, and a reader two things to tell apart. | review | [] |

## set-folder-holds-only-members · SHOULD
Files of one kind that arrive one at a time — one per vendor, command, rule or section — live in a folder named for the member in the plural, and nothing else lives there. Their contract, registry and runner sit beside that folder.

| Why | Check | Tags |
|---|---|---|
| adding a member is then adding a file, and no one has to tell members from machinery by their names. | review | [] |

## file-carries-its-role-suffix · MUST
A file carries its role's suffix, whatever its folder: `entities/chat.entity`. No suffix on a surface or an entry, a file whose name a tool fixes, a component file named after its component in its own folder, a member of a set whose role has no suffix, and a registry.

| Why | Check | Tags |
|---|---|---|
| the name tells the role before the file is opened, and a tool can check it. | tool — names | [] |

## The layer matrix

The import rules of this chapter, with the laws of `principles`, are the layer matrix. Each is stated once, with the check `tool — architecture`; the tool that holds the role is configured for the project's layers from a shared preset, and nothing is generated into the project. The language block names the source root, the surface file and the suffix form.
