# Layout

> Governs a package's tree: folders, names, surfaces.

## The trees

A package keeps each folder below only when it has a file to hold. A delivery unit lives in the presentation of the feature or the composition module it serves, and the root registers it. At every level, `shared/` holds what two or more of its neighbours need and the level gives no other home: in a source, the plumbing several features use.

```text
<package>/
├── <manifest>             the manifest, the lockfile, and the files tools look up at the root
├── src/                   the source: the module tree below
├── scripts/               the code that only builds the package: a build program, a generator's configuration
├── tests/<kind>/          suites that drive the built package, one folder per kind: tests/e2e/
├── docs/                  writing for readers outside the code
└── <kind>/<member>/       content the package ships as it is, one folder per kind, members of one shape

src/
├── main.*                 the entry of a program: builds the root and runs it
├── index.*                the surface of a package others import: its main entry
├── <entry>.*              a further entry of a package others import, named after what it offers: testing.*
├── root/                  the composition root: the wiring file, providers, configuration parsed at start,
│                          the handler of last resort, the registration of every delivery unit
├── composition/<m>/       modules laid out as features: what several features make together, and the
│                          delivery units that compose them; each named after what it assembles
├── features/<f>/          bounded contexts, blind to each other
├── kernel/                the shared kernel: the vocabulary features share and the ports of outside systems
│                          they ask alike, in role folders as a domain's and an application's: pure, small, stable
├── infrastructure/<system>/  adapters implementing the kernel's ports
├── shared/                application plumbing without business, used by two or more features
├── libs/                  code that knows nothing of the product: primitives, vendor clients; publishable
├── integrations/<host>/   the package's integration into a host framework, an entry of its own
└── entrypoints/<n>/       another artefact of the program, or a command of a tooling program

features/<f>/
├── domain/                the model, pure: no port, no use case, no library
│   ├── entities/<e>/      one folder each: an entity or enumeration the feature reads and decides on, or
│   │                      an aggregate it changes — its root with its transitions and their events, its
│   │                      inner entities, the enumerations only it uses
│   ├── value-objects/     values with an invariant
│   ├── services/          domain services: rules and computations no one entity or aggregate owns
│   └── errors/            the feature's expected failures
├── application/           the use cases and the ports they ask, free of any framework
│   ├── use-cases/         {queries,commands}/<op>/, one for each operation, reads included, a pipeline's
│   │                      stages in <op>/steps/
│   └── contracts/         ports; a data port is repositories/{queries,commands}/<entity>.repository
├── infrastructure/<system>/  this feature's contracts over one outside system; in composition, a contract
│                          answered through another feature
├── presentation/          what calls the program: bindings/{queries,commands}/<op>/, and role folders of
│                          the vocabulary
└── index.*                the surface
```

A surface is the file the language resolves when a folder is imported. A **binding unit** binds one operation to the program's framework.

## The vocabulary

The layers are the folders of the tree. **`root/`**{#composition-root} is the composition root: the wiring file, the providers, the configuration parsed at start, the handler of last resort and the registration of every delivery unit. **`features/`**{#bounded-context} holds the features, bounded contexts blind to each other. **`composition/`**{#composition-module} holds modules laid out as features: what several features make together, and the delivery units that compose them. **`infrastructure/`**{#gateway} holds the adapters, each implementing ports over one outside system — the kernel's at the top of the source, a feature's or a composition module's own contracts inside it — or, inside a module of composition, a feature's contract answered through another feature's surface. **`kernel/`**{#shared-domain} is the shared kernel: the vocabulary two or more features use with one meaning, and the ports of outside systems they ask in the same words. **`shared/`**{#shared-code} holds, at any level, what two or more of its neighbours need and the level gives no other home. **`libs/`**{#generic-library} holds code that knows nothing of the product: primitives and vendor clients, publishable. **`integrations/`**{#host-integration} holds the package's integration into a host framework, an entry of its own. **`entrypoints/`**{#extra-entry} holds another artefact of the program, or a command of a tooling program. Inside a feature, **`domain/`**{#pure-layer} is the domain layer, the model; **`application/`**{#application-layer} is the application layer, its use cases and the ports they ask; and **`presentation/`**{#presentation-layer} is the presentation layer, all through which the program is called — a screen, a request, a command, a message, a schedule — which binds each use case to its framework.

A role folder holds members of one kind. **`contracts/`**{#port} holds the ports, in a feature's application or in the kernel, and **`repositories/`**{#data-port} inside it holds the data ports. **`use-cases/`**{#use-case} holds the use cases, one folder for each operation, and **`bindings/`**{#binding} the binding units, one folder for each operation. Under `use-cases/`, `bindings/` and `repositories/`, **`queries/`**{#read-operation} holds the reads and **`commands/`**{#write-operation} the writes. **`entities/`**{#business-type} holds the entities and enumerations a feature reads and decides on and the aggregates it changes, one folder each: an aggregate's holds its root, whose file declares the transitions, which belong to the root alone, and the domain event each yields beside it, then its inner entities and the enumerations only that aggregate uses; **`value-objects/`**{#invariant-value} holds the values with an invariant. **`services/`**{#domain-service} holds the domain services, the rules and computations no one entity or aggregate owns. **`errors/`**{#expected-failure} holds the expected failures: a feature's in its domain, those every feature shares in the kernel. **`constants/`**{#constant} holds a module's constants and `types/` its types, vocabulary with no behaviour. **`utils/`**{#helper} holds pure helpers with no meaning of the product. **`steps/`**{#pipeline-stage} holds a pipeline's stages, inside the use case or domain service that runs them. **`models/`**{#wire-model} holds the wire models and stored shapes, inside adapters. **`providers/`**{#framework-provider} holds the framework's providers and the instances they wire.

A role file's suffix names its role. **`.entity`**{#business-type-file} marks an entity or a business type, **`.aggregate`**{#aggregate-file} an aggregate's root, **`.value-object`**{#invariant-value-file} a value object, **`.service`**{#domain-service-file} a domain service and `.error` an error. **`.repository`**{#data-port-file} marks a data port, **`.port`**{#port-file} any other port, and **`.adapter`**{#gateway-file} a port's implementation that is no repository. **`.use-case`**{#use-case-file} marks a use case, and **`.model`**{#wire-model-file} a wire model or a stored shape. **`.utils`**{#helper-file}, `.types` and **`.constants`**{#constant-file} mark the files of helpers, types and constants, and `.config` a file of configuration.

The language fixes the spelling. Each block names its own folders and suffixes, and a project adds its own the same way.

## Form

### module-has-the-one-form · SHOULD

Every module, at any depth — the source of a package others import, a feature, a module of composition, a lib, a module of a shared layer or of a role folder — is a folder with a surface, the layers or role folders it needs and modules of this same form.

| Why |
|---|
| a reader who knows one module knows them all, and a role folder means the same thing wherever it appears. |

### behaviour-lives-in-a-feature · SHOULD

Behaviour — what a package does — lives in a feature with its layers; vocabulary — types, constants, kinds — lives in the kernel and in role folders, and utils hold only pure helpers with no meaning of the product.

| Why |
|---|
| behaviour found only in features is found with its domain, its adapters and its binding units around it. |

### package-laid-out-by-the-tree · SHOULD

A package’s root holds its manifest, its source, the suites that drive the built package and, where the language's runner expects one, the tree of specs that mirrors the source, the writing for readers outside the code, one folder per kind of content it ships as is, and the files tools look up there; its source holds only the folders of the tree and role folders.

| Why |
|---|
| a reader who knows one repository finds the way in every other, and a file has one obvious place. |

### feature-laid-out-by-its-tree · SHOULD

A feature, and a module of composition, holds its layers, its specs and its surface and nothing else, and its domain, its application and its presentation hold only the role folders of the vocabulary.

| Why |
|---|
| an aggregate, a use case, a port or an adapter is found in the same place in every feature, and a loose file belongs to no layer the rules see. |

### failures-live-with-their-contract · SHOULD

Failures every feature shares, and the base error every error the application declares extends, live in the kernel’s errors, and a feature’s own, each a **domain error**, in its domain’s errors.

| Why |
|---|
| a failure declared where its contract lives is found with it. |

## Surfaces

### module-reached-only-through-its-surface · MUST

A module, and any other folder with a surface, is reached from outside only through that surface, which offers what a caller may couple to and nothing else; the composition root, and the surface of a package that offers it, reach a feature's adapter through that adapter's own surface.

| Why |
|---|
| whatever a module exposes, a caller eventually depends on. |

### module-files-import-each-other-directly · MUST

Inside a module, a file imports a file of its own folder directly and anything else of the module through the surface of the role folder or module that holds it, and never the surface of its own module.

| Why |
|---|
| a file that imports its own surface imports itself, and that is where cycles begin. |

### surface-only-re-exports · MUST

A surface re-exports by name what callers may use: no declaration, no logic, no re-export of everything.

| Why |
|---|
| a surface that declares or computes becomes a room of its own, and a wildcard offers internals nobody chose to offer. |

### further-entry-sits-beside-the-surface · SHOULD

A package others import offers each further entry that serves no host framework — `testing`, the helpers its consumers test with — as a file beside its surface, named after what it offers, which re-exports by name from the tree and declares nothing.

| Why |
|---|
| a consumer finds every door of the package at the top of its source, as `@angular/core/testing` and `hono/testing` show, and an entry that declares nothing never becomes a second home for logic. |

### surface-offers-operations-not-mechanisms · SHOULD

A feature’s surface offers its operations and their presentation — use cases, binding units, entities and aggregates — and, as types, the contracts it asks another feature to answer, which composition implements; never its mechanisms: its adapters, mappers, wire models.

| Why |
|---|
| a caller that reaches a mechanism depends on how the feature works rather than on what it does. |

### surface-only-on-a-module-or-one-kind · MUST

A module has a surface, its door, and so does a **role folder**, whose members are of one kind; a **layer folder**, whose members lie on different sides of the boundaries the imports hold, has none and is never an import target — save `root/`, whose surface the entry files import — and neither has the source of an application, whose members are of different kinds. The source of a package others import is a module, and only its consumers import its surface.

| Why |
|---|
| every import then names the side of each boundary it reaches, and no surface couples a caller to members it never uses. |

## Names

### folder-takes-its-layer-or-role-name · SHOULD

A folder whose purpose a layer or a role of the active vocabulary names takes that name; layer names are fixed words, whatever their grammatical number.

| Why |
|---|
| a folder named by the vocabulary tells its place in the tree before it is opened. |

### file-carries-its-role-suffix · MUST

A **role file**, a file of a role, carries its **role suffix**, whatever its folder; a surface, an entry, a name a tool fixes, a unit named after its own folder, a member of a set whose role has no suffix and a registry carry none, and a binding unit, named after its operation, carries none save the one its framework's block names. A spec keeps the suffix of the file it proves.

| Why |
|---|
| the name tells the role before the file is opened, and a tool can check it. |
