# Layout

> Governs a package's tree: folders, names, surfaces.

## The trees

A package keeps each folder below only when it has a file to hold. A delivery unit lives in the feature or the composition module it serves, and the root registers it. At every level, `shared/` holds what two or more of its neighbours need and the level gives no other home: in a source, the plumbing several features use.

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
├── kernel/                the shared domain: the vocabulary features share and the ports of outside systems
│                          they ask alike, in role folders as a domain's: pure, small, stable
├── adapters/<system>/     adapters implementing the kernel's ports
├── shared/                application plumbing without business, used by two or more features
├── libs/                  code that knows nothing of the product: primitives, vendor clients; publishable
├── integrations/<host>/   the package's integration into a host framework, an entry of its own
└── entrypoints/<n>/       another artefact of the program, or a command of a tooling program

features/<f>/
├── domain/                pure
│   ├── entities/          business types and enumerations
│   ├── value-objects/     values with an invariant
│   ├── contracts/         ports; a data port is repositories/{queries,commands}/<entity>.repository
│   ├── use-cases/         {queries,commands}/<op>/, one for each operation, reads included
│   └── errors/            the feature's expected failures
├── adapters/<system>/     this feature's contracts over one outside system; in composition, a contract
│                          answered through another feature
├── app/                   binding units: use-cases/{queries,commands}/<op>/, and role folders of the vocabulary
└── index.*                the surface
```

A surface is the file the language resolves when a folder is imported. A **binding unit** binds one operation to the program's framework.

## The vocabulary

The layers are the folders of the tree. **`root/`**{#composition-root} is the composition root: the wiring file, the providers, the configuration parsed at start, the handler of last resort and the registration of every delivery unit. **`features/`**{#bounded-context} holds the features, bounded contexts blind to each other. **`composition/`**{#composition-module} holds modules laid out as features: what several features make together, and the delivery units that compose them. **`adapters/`**{#gateway} holds the adapters, each implementing ports over one outside system — the kernel's at the top of the source, a feature's or a composition module's own contracts inside it — or, inside a module of composition, a feature's contract answered through another feature's surface. **`kernel/`**{#shared-domain} holds the domain the features share: the vocabulary two or more features use with one meaning, and the ports of outside systems they ask in the same words. **`shared/`**{#shared-code} holds, at any level, what two or more of its neighbours need and the level gives no other home. **`libs/`**{#generic-library} holds code that knows nothing of the product: primitives and vendor clients, publishable. **`integrations/`**{#host-integration} holds the package's integration into a host framework, an entry of its own. **`entrypoints/`**{#extra-entry} holds another artefact of the program, or a command of a tooling program. Inside a feature, **`domain/`**{#pure-layer} is the pure layer, and **`app/`**{#application-layer} holds the binding units and the role folders they need.

A role folder holds members of one kind. **`contracts/`**{#port} holds the ports, in a feature's domain or in the kernel, and **`repositories/`**{#data-port} inside it holds the data ports. **`use-cases/`**{#use-case} holds the use cases, one folder for each operation. Under `use-cases/` and `repositories/`, **`queries/`**{#read-operation} holds the reads and **`commands/`**{#write-operation} the writes. **`entities/`**{#business-type} holds the business types and enumerations, and **`value-objects/`**{#invariant-value} the values with an invariant. **`errors/`**{#expected-failure} holds the expected failures: a feature's in its domain, those every feature shares in the kernel. **`constants/`**{#constant} holds a module's constants and `types/` its types, vocabulary with no behaviour. **`utils/`**{#helper} holds pure helpers with no meaning of the product. **`steps/`**{#pipeline-stage} holds a pipeline's stages. **`models/`**{#wire-model} holds the wire models and stored shapes, inside adapters. **`providers/`**{#framework-provider} holds the framework's providers and the instances they wire.

A role file's suffix names its role. **`.entity`**{#business-type-file} marks an entity, **`.value-object`**{#invariant-value-file} a value object and `.error` an error. **`.repository`**{#data-port-file} marks a data port, **`.port`**{#port-file} any other port, and **`.adapter`**{#gateway-file} a port's implementation that is no repository. **`.use-case`**{#use-case-file} marks a use case, and **`.model`**{#wire-model-file} a wire model or a stored shape. **`.utils`**{#helper-file}, `.types` and **`.constants`**{#constant-file} mark the files of helpers, types and constants, and `.config` a file of configuration.

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

A feature, and a module of composition, holds its layers, its specs and its surface and nothing else, and its domain holds only the role folders of the tree.

| Why |
|---|
| a use case, a port or an adapter is found in the same place in every feature, and a loose file belongs to no layer the rules see. |

### failures-live-with-their-contract · SHOULD

Failures every feature shares, and the base error every error the application declares extends, live in the kernel’s errors, and a feature’s own, each a **domain error**, in its domain’s errors.

| Why |
|---|
| a failure declared where its contract lives is found with it. |

### pipeline-stages-live-under-steps · SHOULD

A pipeline’s stages live in its steps folder, in the order the use case calls them.

| Why |
|---|
| the use case reads as the pipeline, and a stage is added, removed or tested alone. |

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

A feature’s surface offers its operations and their presentation — use cases, binding units, entities — and, as types, the contracts it asks another feature to answer, which composition implements; never its mechanisms: its adapters, mappers, wire models.

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

A **role file**, a file of a role, carries its **role suffix**, whatever its folder; a surface, an entry, a name a tool fixes, a unit named after its own folder, a member of a set whose role has no suffix, a registry and a binding unit named after its operation carry none. A spec keeps the suffix of the file it proves.

| Why |
|---|
| the name tells the role before the file is opened, and a tool can check it. |

### data-port-named-by-entity-and-side · SHOULD

A data port is named after its entity and its side: `<Entity>QueryRepository` for reads, `<Entity>CommandRepository` for writes.

| Why |
|---|
| the name alone tells two ports of one entity apart, wherever they are imported. |
