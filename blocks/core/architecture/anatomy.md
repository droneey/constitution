# Anatomy

> Where code lives and what it may import. The laws of `principles` say why; this chapter lays them out as folders, names and import rules. Every block that adds a layer or a role states it in its own chapter; none removes one.

## What the anatomy governs

- **A package** — an application, whether or not a registry distributes it, the scripts of a repository, or code and configuration others import or extend — has the tree below, with the folders it needs. The block that owns a program's entry surface names its delivery layer: a command-line platform names its commands' folder, an API domain its handlers', a router its screens'. A tooling program with no entry surface of its own has only entrypoints: each command is `entrypoints/<name>/`, and its entry file builds `root/`. A package that nothing runs, whose consumers import it, has no `root/` and no `entrypoints/`.
- **A repository of several units** keeps each unit's tree in the unit's own folder, and a unit imports another by its name, through its entries.

The trees show every place a file may go.

## One form of a module

A module is a folder with a surface, the role folders of the vocabulary it needs, and modules of the same form inside it. The source root of a package is a module whose folders are the layers of the top-level tree; a feature is a module with layers of its own; `kernel/`, a module of `shared/`, `libs/`, `contracts/` or `adapters/`, and a module inside any of them have the same form.

### module-has-one-form · SHOULD
Every module has one form at any depth — its surface, the role folders it needs, and modules of the same form. Behaviour, what a package does, lives in a feature with its layers, whether anything runs the package or its consumers import it. Vocabulary — types, constants, kinds — lives in `kernel/` and the role folders, and `utils/` holds only pure helpers that carry no meaning of the product.

| Why | Tags |
|---|---|
| a reader who knows one module knows them all, a role folder means the same thing wherever it appears, and behaviour found only in features is found with its domain, its adapters and its binding units around it. | [] |

## The top level

```
src/
├── main.*             the entry of a program: builds root and runs it
├── index.*            the surface of a package others import: its main entry
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
├── integrations/<fw>/ the package's integration into a host framework
└── entrypoints/<n>/   another artifact of the program, or a command of a tooling program
```

### anatomy-top-level-by-concern · SHOULD
The source of a package is laid out by concern in the folders of the top-level tree and the role folders it needs, and in no other top-level folder. The wiring file is `root/wiring` with the language's extension, unless a framework's block names its own.

| Why | Tags |
|---|---|
| a reader who knows one repository finds their way in every other, and a file has one obvious place. | [] |

### top-level-folders-from-the-tree → anatomy-top-level-by-concern
`src/` holds only the top-level folders of the tree and role folders.

| Why | Tags |
|---|---|
| a reader who knows one repository finds their way in every other. | [] |

### root-imported-only-by-entry-and-delivery-wiring · MUST
`root/` is imported only by entry files and by the delivery layer's own wiring. Nothing else reaches back to the composition root.

| Why | Tags |
|---|---|
| the root knows every concrete choice; code that imports it depends on all of them and can no longer be tested with fakes. | [] |

### nothing-imports-an-entrypoint · MUST
No code imports an entrypoint. An entrypoint composes features through their surfaces, `shared/` and `libs/`, and holds everything that ships only in its artifact.

| Why | Tags |
|---|---|
| an entrypoint is a separate artifact; importing it drags that artifact into another one. | [] |

### nothing-imports-an-integration · MUST
A package's integration into a host framework — the module, provider or dependency the framework calls to use the package — lives in `integrations/<framework>/`, a module whose surface is an entry of its own. No other code of the package imports an integration; an integration imports the package's surfaces as a consumer would, and never another integration.

| Why | Tags |
|---|---|
| the framework calls the package, not the package the framework, so an integration is no adapter of a port; offered as an entry of its own, it loads the framework only for the consumers that use it. | [] |

### kernel-imports-only-itself · MUST
`kernel/` imports only itself and the data files its values are read from. It holds business types and values every feature shares — money, an email address, a date range, the kinds a schema lists — and structural types such as a paginated result.

| Why | Tags |
|---|---|
| everything depends on the kernel, so it must depend on nothing that changes. | [] |

### libs-import-no-application-code · MUST
`libs/` imports no application code — no feature, `kernel/`, `shared/`, `contracts/`, `adapters/`, `integrations/` or `root/` — and knows nothing of the repository that uses it, as a package others import knows nothing of those that use it.

| Why | Tags |
|---|---|
| code in `libs/` could be published tomorrow; one import of the application ties it to this program for good, and a package that knows its consumer changes whenever the consumer does and serves no one else. | [] |

### shared-imports-no-feature-adapter-contract-or-root · MUST
`shared/` imports no feature, adapter or contract and not `root/`. It holds application plumbing without business: helpers, constants and types two or more features use.

| Why | Tags |
|---|---|
| plumbing that knows a feature is part of that feature, and every other feature that uses it depends on it too. | [] |

### kernel-or-shared-by-meaning · SHOULD
A shared piece with business meaning goes to `kernel/`; one without goes to `shared/`; one that would make sense in any program goes to `libs/`. `kernel/` stays small.

| Why | Tags |
|---|---|
| the folder then says what a piece means, and the kernel does not grow into a second domain every feature depends on. | [] |

### composition-on-the-second-consumer → code-lives-with-its-reason-to-change
Composition across features lives in the delivery unit that needs it, which assembles features through their surfaces. It moves to `composition/<name>/` when a second consumer needs it, and facts derived from several features are derived there.

| Why | Tags |
|---|---|
| someone above the features must assemble them, and a composition layer made before a second consumer is one nobody needs yet. | [] |

### protocol-between-artifacts-in-shared · SHOULD
A protocol two artifacts of one program speak — the messages an embedded frame of its `entrypoints/` and its host exchange — lives in the program's `shared/<protocol>/`, imported by both.

| Why | Tags |
|---|---|
| each side then speaks the same types, and neither artifact imports the other. | [] |

## The feature

```
features/<f>/
├── domain/                pure
│   ├── entities/          business types and enums
│   ├── value-objects/     values with an invariant: <name>.value-object
│   ├── contracts/         ports; data ports are repositories/{queries,commands}/<entity>.repository.*
│   ├── use-cases/         business use-cases, only when the operation has business logic: {queries,commands}/<op>/
│   └── errors/            typed errors with codes
├── adapters/<system>/     this feature's contracts over one external system (wire ↔ domain)
├── app/                   binding units: use-cases/{queries,commands}/<op>/, and role folders from the vocabulary
└── index.*                the curated surface
```

### feature-anatomy · SHOULD
A feature is laid out as `domain/`, `adapters/<system>/` and `app/` with the role folders of the tree, and a surface at its root. A block adds its own layers, such as a UI's.

| Why | Tags |
|---|---|
| a use-case, a port or an adapter is found in the same place in every feature. | [] |

### feature-root-holds-its-layers → feature-anatomy
A feature's root holds only its layer folders, its `__tests__/` and its surface; nothing is imported from anywhere else in it.

| Why | Tags |
|---|---|
| a file or folder left loose beside the layers belongs to none of them, and the layer rules never see it. | [] |

### feature-domain-holds-its-role-folders → feature-anatomy
A feature's `domain/` holds only the role folders of the tree and no file of its own.

| Why | Tags |
|---|---|
| a use-case, a port or an entity is found in the same place in every feature. | [] |

### data-ports-split-by-reads-and-writes → contracts-shaped-by-role
A data port is a repository per entity, one file per side: `repositories/queries/<entity>.repository` for reads and `repositories/commands/<entity>.repository` for writes, each declaring its operations' parameters and results. The folder carries the side, never the file name, and `repositories/` has no surface that joins the two sides; a shape both sides use — the page a read returns and a write updates in the cache — is an entity.

| Why | Tags |
|---|---|
| reads and writes change apart, and a caller that only reads cannot reach a write. | [] |

### ports-named-by-entity-and-side · SHOULD
A data port's contract is named after its entity and its side: `<Entity>QueryRepository` for reads, `<Entity>CommandRepository` for writes.

| Why | Tags |
|---|---|
| the name alone tells two ports of one entity apart, wherever they are imported. | [] |

### pipeline-stages-under-steps · SHOULD
A pipeline use-case keeps its stages under `steps/`, in the order the use-case calls them; a stage never calls another.

| Why | Tags |
|---|---|
| the use-case reads as the pipeline, and a stage can be added, removed or tested alone. | [] |

### contracts-know-no-vendor-or-other-contract · MUST
A contract — a port, its parameters and results — imports no vendor, no adapter, no feature other than its own, and no other contract's internals. It speaks only the domain's types.

| Why | Tags |
|---|---|
| a contract that knows a vendor ties every implementation to it, and the domain that declares it along with them. | [] |

### adapters-never-import-each-other-or-callers · MUST
An adapter imports its contracts, `kernel/`, `shared/` and `libs/`, and never a feature's application layer, the delivery layer or another adapter. What two adapters share lives in `libs/`, or in `shared/` when it knows the program.

| Why | Tags |
|---|---|
| adapters that know each other or their callers form a second, hidden program beside the domain. | [] |

### feature-speaks-in-its-own-contracts → features-blind-to-each-other
A feature that needs an answer from another declares a contract in its own words and receives an input built for it; composition implements the contract through the other feature's surface.

| Why | Tags |
|---|---|
| the feature stays blind to the other, and the other can change its model without breaking it. | [] |

## Surfaces

A surface is the file the language resolves when a folder is imported. It re-exports and does nothing else.

### folder-files-import-each-other-directly → access-only-through-curated-surface
Inside a folder, files import each other directly.

| Why | Tags |
|---|---|
| the surface is the folder's offer to callers outside it; a file inside that goes through it imports its own folder, and that is where import cycles begin. | [] |

### own-surface-never-imported → folder-files-import-each-other-directly
A file never imports the surface of the module it belongs to.

| Why | Tags |
|---|---|
| a module that imports its own surface imports itself, and that is where a cycle begins. | [] |

### layer-folder-has-no-surface · MUST
A layer folder — `domain/`, `app/`, `adapters/`, `features/`, `libs/` — has no surface and is never an import target, and neither has the `src/` of a package that nothing imports. A caller imports the role folder inside it, so the feature's root surface is the only one that re-exports a whole feature. The `src/` of a package others import has a surface, its main entry, which only its consumers import.

| Why | Tags |
|---|---|
| an import then names the role it couples to, and no surface that gathers several roles hides an edge the layer rules forbid. | [] |

### layer-folder-never-imported → layer-folder-has-no-surface
A layer folder is never an import target, and a feature's `domain/` has no surface.

| Why | Tags |
|---|---|
| an import then names the role it couples to. | [] |

### surface-only-re-exports · MUST
A surface re-exports by name what callers may use: no declaration, no logic, no re-export of everything.

| Why | Tags |
|---|---|
| a surface that declares or computes becomes a room of its own, and a wildcard re-export offers internals nobody chose to offer. | [] |

### surface-offers-operations-not-mechanisms · SHOULD
A feature's surface offers its operations and its presentation — use-cases, binding units, entities, the units that present them — and never its mechanisms: repositories, mappers, wire types.

| Why | Tags |
|---|---|
| a caller that reaches a mechanism depends on how the feature works rather than on what it does. | [] |

## Packages by folder role

### packages-imported-by-folder-role → dependencies-point-inward
An external package — a dependency the program installs, not the language's standard library or the runtime's own modules — is imported by the role of the folder that imports it. `domain/`, `kernel/` and `contracts/` import none. The edge — `adapters/`, `libs/<name>/`, `root/` and the entry files, the delivery folder and `integrations/<framework>/` — imports any. Every other folder — `app/`, `composition/`, `shared/`, a UI's components and widgets — imports only a package that a block gives a home there. A block gives its package a home by naming every folder it is imported in, the edge's among them, so a home may reach past the edge or keep to a part of it; a package whose block names no home, and one with no block, is imported only at the edge. Specs import what they need to run.

| Why | Tags |
|---|---|
| a package is volatile, and an inner folder that imports one changes when it does; a table by folder role holds every package at once, those nobody has written a rule for included, and a block says only where its own package belongs. | [] |

## Placement

### contract-lifts-on-the-second-feature → code-lives-with-its-reason-to-change
A contract belongs to the feature that needs it. When two features need it, it lifts to `contracts/`; a business type two features share lifts to `kernel/`, never sideways into one of them.

| Why | Tags |
|---|---|
| a contract owned by one feature and used by another couples the second to the first. | [] |

### one-adapter-per-system · SHOULD
An adapter implements, over one external system, every contract of its owner that system serves; it lives beside its contracts' owner. There is one adapter per system per owner, never one per method.

| Why | Tags |
|---|---|
| one system's knowledge — its client, its errors, its wire shapes — is then in one place. | [] |

### adapter-is-a-factory-module-object-or-class · SHOULD
An adapter's form is a factory, a module object for one with no dependency, or a class whose constructor takes its dependencies.

| Why | Tags |
|---|---|
| each form builds the adapter in one signature that names what it takes, so a reader finds an adapter's dependencies in the same place in every program. | [] |

### adapter-receives-its-dependencies → one-explicit-composition-root
An adapter receives its dependencies explicitly — the transport, the clients it speaks through — from the composition root, as a factory's parameters or through its constructor, and keeps no hidden state; it never imports a shared instance of them.

| Why | Tags |
|---|---|
| a dependency the adapter receives is visible and replaceable, in production and in tests, and nothing it holds outlives a test or leaks between its callers unseen; a shared instance it imports is neither. | [] |

### real-effects-chosen-at-composition-root → side-effects-at-the-edges
A port for an effect — clock, randomness, identifiers, environment, file system, processes, network — is a contract placed like any other, its real implementation is an adapter, and only a composition root chooses the real one. Logic never calls the effect directly.

| Why | Tags |
|---|---|
| everything else receives the effect through its port, so a test replaces it without touching the code and runs deterministically. | [testing] |

### vendor-clients-in-libs → kernel-or-shared-by-meaning
A vendor client without application knowledge lives in `libs/<system>/`.

| Why | Tags |
|---|---|
| it can be reused by every adapter of that system and by other programs, and the adapters stay thin. | [] |

**The path of a client.** The wrapper of a vendor's client lives in `libs/<system>/`; `root/`, the only reader of the environment, builds its one instance from the configuration it parsed (`environment-read-only-by-the-root`, `stateful-clients-built-by-the-root`); an adapter receives that instance as a parameter of its factory or its constructor (`adapter-receives-its-dependencies`); and a UI reaches what the root built through the root's providers, never by an import.

### delivery-unit-beside-what-it-serves · SHOULD
A delivery unit that serves one feature lives in that feature's `app/`, where the entry surface allows it; one that composes several lives in the delivery layer or in `composition/`.

| Why | Tags |
|---|---|
| a unit lives with the reason it changes. | [] |

### delivery-units-stay-thin · SHOULD
A delivery unit — a screen, a command, a handler, a tool function — parses its flags or parameters, resolves its input, calls the use-cases, binding units or composition whose results it presents, and presents them. It holds no business logic.

| Why | Tags |
|---|---|
| business logic in a delivery unit cannot be reused by another transport or tested without it; kept out, it runs the same from a test, another command or another transport. | [] |

### report-returned-as-a-value → delivery-units-stay-thin
What an operation reports is a value it returns — for a progressive report, a sequence of events — and the delivery unit presents it, as text or as data; the logic prints nothing along the way.

| Why | Tags |
|---|---|
| a value can be presented in any format and checked by a test, and a new format touches only the delivery unit; lines printed from deep inside can be neither. | [] |

## Names

**Folders of core's vocabulary:**
- layers: `root`, `features`, `composition`, `contracts`, `adapters`, `kernel`, `shared`, `libs`, `integrations`, `entrypoints`, `domain`, `app`;
- roles: `use-cases`, `queries`, `commands`, `entities`, `value-objects`, `repositories`, `errors`, `constants`, `types`, `utils`, `models` (wire and persistence shapes inside adapters), `providers` (framework providers and the instances they wire).

**Suffixes of core's vocabulary:** `.entity`, `.value-object`, `.error`, `.repository`, `.port`, `.adapter` (a port's implementation that is not a repository), `.use-case`, `.utils`, `.types`, `.constants`, `.model`, `.config`. The language fixes the spelling. Each block names its own folders and suffixes in its chapter, and a project adds its own the same way.

### folder-named-for-purpose-or-role → folder-named-for-its-purpose
A folder whose purpose a layer or a role of the vocabulary of the project's active blocks names takes that name; the layer names are fixed words, whatever their grammatical number.

| Why | Tags |
|---|---|
| a folder named by the vocabulary tells a reader its place in the tree before it is opened, the same way in every project. | [] |

### file-carries-its-role-suffix · MUST
A file carries its role's suffix, whatever its folder: `entities/chat.entity`. No suffix on a surface or an entry, a file whose name a tool fixes, a component file named after its component in its own folder, a member of a set whose role has no suffix, a registry, and a binding unit's plain form, named after its operation in its own folder. A spec keeps the role suffix of the file it proves — `chat.entity.test` — so a double suffix appears only in tests.

| Why | Tags |
|---|---|
| the name tells the role before the file is opened, and a tool can check it. | [] |

### role-folder-files-carry-its-suffix → file-carries-its-role-suffix
A file in a role folder — `entities/`, `contracts/`, `errors/`, `models/`, `repositories/` and the rest — carries the role's suffix.

| Why | Tags |
|---|---|
| the name tells the role before the file is opened. | [] |

## The layer matrix

The import rules of this chapter, with the laws of `principles`, are the layer matrix. Each is stated once and held by the tool that follows imports, configured for the project's layers from a shared preset, and nothing is generated into the project. The language block names the source root, the surface file and the suffix form.
