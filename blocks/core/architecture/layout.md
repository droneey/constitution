# Layout

> Governs the tree of a package: its folders, their names and its surfaces.

## The trees

A package keeps each folder below only when it has a file to hold. The block that owns the package's entry surface names its delivery layer: the commands of a command line, the handlers of a server, the screens of a router.

```
<package>/
├── <manifest>             the manifest, the lockfile, and the files tools look up at the root
├── src/                   the source: the module tree below
├── tests/<kind>/          suites that drive the built package, one folder per kind: tests/e2e/
├── docs/                  writing for readers outside the code
└── <kind>/<member>/       content the package ships as it is, one folder per kind, members of one shape

src/
├── main.*                 the entry of a program: builds the root and runs it
├── index.*                the surface of a package others import: its main entry
├── root/                  the composition root: the wiring file, providers, configuration parsed at start,
│                          the handler of last resort
├── <delivery>/            the delivery layer: commands, handlers or screens; its block names the folder
├── composition/           the only code that knows several features
├── features/<f>/          bounded contexts, blind to each other
├── contracts/             ports two or more features need
├── adapters/<system>/     adapters implementing those shared ports
├── kernel/                shared business vocabulary: pure, small, stable
├── shared/                application plumbing without business, used by two or more features
├── libs/                  code that knows nothing of the product: primitives, vendor clients; publishable
├── integrations/<host>/   the package's integration into a host framework, an entry of its own
└── entrypoints/<n>/       another artefact of the program, or a command of a tooling program

features/<f>/
├── domain/                pure
│   ├── entities/          business types and enumerations
│   ├── value-objects/     values with an invariant
│   ├── contracts/         ports; a data port is repositories/{queries,commands}/<entity>.repository
│   ├── use-cases/         {queries,commands}/<op>/, only for an operation with business logic
│   └── errors/            the feature's expected failures
├── adapters/<system>/     this feature's contracts over one outside system
├── app/                   binding units: use-cases/{queries,commands}/<op>/, and role folders of the vocabulary
└── index.*                the surface
```

A unit's specs sit in the `__tests__/` beside it. A surface is the file the language resolves when a folder is imported.

## The vocabulary

- Layers: `root`, `features`, `composition`, `contracts`, `adapters`, `kernel`, `shared`, `libs`, `integrations`, `entrypoints`, `domain`, `app`.
- Roles: `use-cases`, `queries`, `commands`, `entities`, `value-objects`, `repositories`, `errors`, `constants`, `types`, `utils`, `steps`, `models` (wire and stored shapes inside adapters), `providers` (framework providers and the instances they wire).
- Suffixes: `.entity`, `.value-object`, `.error`, `.repository`, `.port`, `.adapter` (a port's implementation that is no repository), `.use-case`, `.utils`, `.types`, `.constants`, `.model`, `.config`.

The language fixes the spelling. Each block names its own folders and suffixes, and a project adds its own the same way.

## Form

### module-has-the-one-form · SHOULD
Every module, at any depth — a package’s source, a feature, the kernel, a module of a shared layer — is a folder with a surface, the role folders it needs and modules of this same form, and every folder appears only when needed.

| Why | Tags |
|---|---|
| a reader who knows one module knows them all, and a role folder means the same thing wherever it appears. | [] |

### behaviour-lives-in-a-feature · SHOULD
Behaviour — what a package does — lives in a feature with its layers; vocabulary — types, constants, kinds — lives in the kernel and in role folders, and utils hold only pure helpers with no meaning of the product.

| Why | Tags |
|---|---|
| behaviour found only in features is found with its domain, its adapters and its binding units around it. | [] |

### package-laid-out-by-the-tree · SHOULD
A package’s root holds its manifest, its source, the suites that drive the built package, the writing for readers outside the code, one folder per kind of content it ships as is, and the files tools look up there; its source holds only the folders of the tree and role folders.

| Why | Tags |
|---|---|
| a reader who knows one repository finds the way in every other, and a file has one obvious place. | [] |

### feature-laid-out-by-its-tree · SHOULD
A feature holds its layers, its specs and its surface and nothing else, and its domain holds only the role folders of the tree.

| Why | Tags |
|---|---|
| a use case, a port or an adapter is found in the same place in every feature, and a loose file belongs to no layer the rules see. | [] |

### failures-live-with-their-contract · SHOULD
Failures every feature shares live in the kernel’s errors, a feature’s in its domain’s errors.

| Why | Tags |
|---|---|
| a failure declared where its contract lives is found with it. | [] |

### pipeline-stages-live-under-steps · SHOULD
A pipeline’s stages live in its steps folder, in the order the use case calls them.

| Why | Tags |
|---|---|
| the use case reads as the pipeline, and a stage is added, removed or tested alone. | [] |

## Surfaces

### module-reached-only-through-its-surface · MUST
A module — and the kernel and every role folder of a domain — is reached from outside only through its surface, which offers what a caller may couple to and nothing else.

| Why | Tags |
|---|---|
| whatever a module exposes, a caller eventually depends on. | [] |

### module-files-import-each-other-directly · MUST
Inside a module, files import each other directly, and a file never imports the surface of its own module.

| Why | Tags |
|---|---|
| a file that imports its own surface imports itself, and that is where cycles begin. | [] |

### surface-only-re-exports · MUST
A surface re-exports by name what callers may use: no declaration, no logic, no re-export of everything.

| Why | Tags |
|---|---|
| a surface that declares or computes becomes a room of its own, and a wildcard offers internals nobody chose to offer. | [] |

### surface-offers-operations-not-mechanisms · SHOULD
A feature’s surface offers its operations and their presentation — use cases, binding units, entities — never its mechanisms: repositories, mappers, wire models.

| Why | Tags |
|---|---|
| a caller that reaches a mechanism depends on how the feature works rather than on what it does. | [] |

### layer-folder-has-no-surface · MUST
A layer folder has no surface and is never an import target, nor is the source of a package nothing imports; a caller imports the role folder inside it. The source of a package others import has one surface, its main entry, which only its consumers import.

| Why | Tags |
|---|---|
| an import then names the role it couples to, and no surface gathering several roles hides an edge the layer rules forbid. | [] |

## Names

### folder-takes-its-layer-or-role-name · SHOULD
A folder whose purpose a layer or a role of the active vocabulary names takes that name; layer names are fixed words, whatever their grammatical number.

| Why | Tags |
|---|---|
| a folder named by the vocabulary tells its place in the tree before it is opened. | [] |

### file-carries-its-role-suffix · MUST
A file carries its role’s suffix, whatever its folder; a surface, an entry, a name a tool fixes, a component named after its own folder, a member of a set whose role has no suffix, a registry and a binding unit named after its operation carry none. A spec keeps the suffix of the file it proves.

| Why | Tags |
|---|---|
| the name tells the role before the file is opened, and a tool can check it. | [] |

### data-port-named-by-entity-and-side · SHOULD
A data port is named after its entity and its side: `<Entity>QueryRepository` for reads, `<Entity>CommandRepository` for writes.

| Why | Tags |
|---|---|
| the name alone tells two ports of one entity apart, wherever they are imported. | [] |
