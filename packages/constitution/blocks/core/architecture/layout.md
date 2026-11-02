# Layout

> Governs a package's tree: its folders and their names, its surfaces, and where each piece of code lives.

## The trees

The trees start at a package's `src/`, which sits in the package's root beside the parts foundation's `layout` places there.

```text
src/
├── <entry>                the entry of a program: hands the process to the program the root runs
├── <surface>              the surface of a package others import: its main entry
├── <further entry>        a further entry of a package others import, named after what it offers
├── root/                  the composition root: the files that assemble the program and register every
│                          delivery unit, behind the one door an entry takes the program through
├── presentation/          the program's presentation
├── composition/<m>/       modules laid out as features: what the business combines across features — a
│                          query or a command that joins, derives or decides across them
├── features/<f>/          the features, blind to each other
├── kernel/                the shared kernel and the ports of outside systems features ask alike, in role
│                          folders as a concept's and an application layer's
├── infrastructure/<system>/  the adapter module of the kernel's ports over one outside system, and the
│                          configuration provider
├── shared/                plumbing without business, used by two or more features
├── libs/                  code that knows nothing of the product: primitives, vendor clients; publishable
├── integrations/<host>/   the package's integration into a host framework, an entry of its own
└── entrypoints/<n>/       another artefact of the program, or a command of a tooling program

features/<f>/
├── domain/                the domain model
│   ├── <concept>/         a concept of the feature's language: usually one aggregate, or an entity or
│   │   │                  enumeration that stands on its own, or a rule no entity owns
│   │   ├── entities/      the aggregate's root with its predicates and derived values, its inner entities
│   │   ├── transitions/   the aggregate's transitions
│   │   ├── value-objects/ the value objects, enumerations among them, each with its predicates and
│   │   │                  derived values
│   │   ├── services/      the domain services
│   │   └── errors/        the concept's expected failures
│   └── shared/            what two or more concepts of the feature use, in the same role folders
├── application/           the use cases and the ports they ask, free of any framework
│   ├── use-cases/         the use cases, reads in queries/ and writes in commands/, each with the parse
│   │                      of its operation input, and a query with a read model no port returns
│   └── contracts/         every port, a repository and a queries port among them, each queries port
│                          declaring the read models it returns
├── infrastructure/<system>/  the adapter module of this feature's ports over one outside system; in
│                          composition, also one that answers a port through another feature
├── presentation/          what calls the program: the binding units in bindings/, by side, and the role
│                          folders of an interface's block
└── <surface>              the surface
```

`<entry>`, `<surface>` and `<further entry>` stand for what a language's block names. A program starts at an entry file: `<entry>` at the top of the source, an entrypoint's main or an integration's main. A package others import offers its published entries: its surface, which is its main entry, and each further entry. The terms of the program's parts are defined in the chapters that govern them: the aggregate in the domain chapter; the use case, its operation input and the read model in the application chapter; the port, the queries port and the adapter module in the ports chapter; the interface, the binding unit and the delivery unit in the presentation chapter; and the configuration provider in the root chapter.

## The vocabulary

The layers are the folders of the tree. **`root/`**{#composition-root} holds the composition root. **`features/`**{#bounded-context} holds the features, blind to each other. **`composition/`**{#composition-module} holds modules laid out as features: what the business combines across features. **`infrastructure/`**{#adapter} holds the adapter modules: at the top of the source those of the kernel's ports and the root's configuration provider, inside a feature or a composition module those of its own ports and, in a composition module, those that answer a feature's port through another feature. **`kernel/`**{#shared-kernel} holds the shared kernel and, beside it, the ports of outside systems that features ask in the same words. **`shared/`**{#shared-code} holds what two or more of its neighbours need where its level gives it no other home — at the top of the source, plumbing without business meaning that two or more features use. **`libs/`**{#generic-library} holds code that knows nothing of the product: primitives and vendor clients, publishable. **`integrations/`**{#host-integration} holds the package's integration into a host framework, an entry of its own. **`entrypoints/`**{#extra-entry} holds another artefact of the program, with what ships only in it, or a command of a tooling program. Inside a feature, **`domain/`**{#domain-layer} is the domain layer, the domain model; **`application/`**{#application} is the application layer, its use cases and the ports they ask; and **`presentation/`**{#presentation-layer} is the presentation layer, through which the program is called. At the top of the source, `presentation/` is the program's presentation.

The shared layers are the kernel, the top-level `shared/` and libs: the layers outward of the application layer may import all three, and the domain and the application layer the kernel alone. Inward is toward the kernel, the most stable code, in this order: the entry files, the composition root and integrations; the program's presentation; composition; a feature's presentation; its application layer; its domain; the kernel. The top-level `shared/` and libs sit inward of every layer that may import them, and an adapter module outward of the layer whose ports it implements; of two layers, the one inward is the inner one and the other the outer one. The edge is every folder that may hold effects and import any package: the infrastructure, with its adapters and the configuration provider, libs, the composition root, the entry files and integrations. A port's owner is the feature, the composition module or the kernel whose `contracts/` declares it, and an adapter's owner is its port's.

A role folder holds members of one kind. **`contracts/`**{#port} holds the ports, in a feature's application or in the kernel, a repository and a queries port among them. **`use-cases/`**{#use-case} holds the use cases, and a use case whose pipeline gives it stages sits in a folder of its own, holding its `steps/`; and **`bindings/`**{#binding} the binding units. Under `use-cases/` and `bindings/`, **`queries/`**{#read-operation} holds the reads and **`commands/`**{#write-operation} the writes. Inside a domain, a **concept folder**{#concept-folder} is named in the feature's language for one concept of its domain model — usually one aggregate, or an entity or enumeration that stands on its own, or a rule no entity owns — and the domain's role folders live in a concept folder or in the domain's `shared/`, which holds what two or more of its concepts use. **`entities/`**{#entity} holds entities alone: in a concept folder, an aggregate's root, whose file holds its data and its predicates and derived values, and its inner entities. **`transitions/`**{#aggregate-transition} holds an aggregate's transitions. **`value-objects/`**{#value-object} holds the value objects, an enumeration among them, since it has no identity and is compared by value; each file holds a value object's data and its predicates and derived values. **`services/`**{#domain-service} holds the domain services. **`errors/`**{#expected-failure} holds the expected failures. **`constants/`**{#constant} holds a module's constants and `types/` its types, vocabulary with no behaviour. **`utils/`**{#helper} holds pure helpers with no meaning of the product. **`steps/`**{#pipeline-stage} holds a pipeline's stages, beside the use case or domain service that runs them. **`models/`**{#wire-model} holds the wire models, inside the infrastructure.

A role file's suffix names its role. **`.entity`**{#entity-file} marks an entity that is no aggregate's root, **`.aggregate`**{#aggregate-file} an aggregate's root, **`.value-object`**{#value-object-file} a value object, an enumeration included, **`.service`**{#domain-service-file} a domain service, **`.transitions`**{#aggregate-transition-file} a file of an aggregate's transitions and `.error` an error. **`.port`**{#port-file} marks a port, a repository and a queries port included — `order-repository.port`, `order-queries.port`, `mailer.port` —, and **`.adapter`**{#adapter-file} a port's implementation — `order-repository.adapter`, `order-queries.adapter`. **`.use-case`**{#use-case-file} marks a use case, and **`.model`**{#wire-model-file} a wire model. **`.utils`**{#helper-file}, `.types` and **`.constants`**{#constant-file} mark the files of helpers, types and constants, and `.config`, which the tools that read it fix, a file of configuration.

Every folder and suffix named here is a default: the language fixes the spelling, and its block respells one under the same id. One that no tool's setting names — `types/`, `.types`, `.error`, `.config` — carries no id, and a block respells it by a rule of its own. Each block names its own folders and suffixes, and a project adds its own the same way.

## Form

### module-has-the-one-form · MUST

Every module has one form. At any depth — the source of a package others import, a feature, a composition module, a lib, a module of a shared layer or of a role folder — it is a folder with a surface, the layers or role folders it needs and modules of this same form.

| Why |
|---|
| a module laid out its own way must be learned before it is read, and a role folder that means one thing here and another there misleads the reader who knows it from elsewhere. |

### package-laid-out-by-the-tree · MUST

A package's source is laid out by the tree. It holds only the folders of the tree and role folders; a feature, and a composition module, holds only its layers, its specs and its surface, and in each the domain holds only concept folders and its `shared/`, each holding only the role folders of the vocabulary, and the application and the presentation hold only those role folders. A role folder of a domain or of the kernel holds its files flat, save a domain service whose pipeline gives it a folder of its own, holding its `steps/`.

| Why |
|---|
| a source laid out its own way must be searched before it is changed, and a file with two plausible places ends up in both; a loose file belongs to no layer the rules see, so the import rules pass it unchecked, and a piece kept in a place of its feature's own choosing is searched for in every feature. |

## Homes

### behaviour-lives-in-a-feature · MUST

Behaviour lives in a feature or a composition module. What a package does lives in a feature or a composition module, with its layers; vocabulary — types, constants, kinds — lives in the kernel and in role folders, and utils hold only pure helpers with no meaning of the product.

| Why |
|---|
| behaviour kept outside a feature or a composition module sits apart from the domain, the adapters and the binding units it belongs with, so the reader who changes it misses them. |

### code-placed-by-its-reason-to-change · MUST

Code lives in the layer that owns its reason to change. It lives beside its consumer when they share it, and lifts to the nearest common level only when a second consumer appears; a library or a helper is placed the same way.

| Why |
|---|
| code kept away from its reason to change is changed in two places for one reason, and code lifted before its second consumer guesses at a sharing that may never come — the common closure principle. |

### code-shared-across-repositories-released-from-a-library-repository · MUST

Code that several repositories need is released from a repository of libraries. This holds for code that knows nothing of the product, and that repository holds nothing of any product; until a second repository needs the code, it lives in the `libs/` of the source that uses it.

| Why |
|---|
| code copied into each repository that needs it drifts between the copies, and code released from a repository that also holds a product can import that product, which nothing then stops. |

### port-lifts-on-its-second-feature · MUST

A port stays with the feature that needs it until a second feature needs it in the same words from an outside system. It then lifts to the kernel's `contracts/`, as a clock's or a mailer's does, and never sideways into one of the features. A port each feature words its own way stays in each feature, and a port another feature answers never lifts: each feature that asks it words its own. A port of a binding unit's own concern sits in the kernel's `contracts/` from its first use, since no presentation declares a port.

| Why |
|---|
| a port owned by one feature and used by another couples the second to the first, and one lifted while a feature answers it carries that feature's domain model and failures into the kernel. |

### read-model-declared-and-named-by-its-operation · MUST

A read model is declared and named by the operation that returns it. It is declared beside the signature that returns it — in the file of the queries port that returns it or, where no port returns it, beside the query whose result it is —, and named for that operation, never for a screen.

| Why |
|---|
| a read model declared away from the signature that returns it is looked for in another file than the one its reader opens, and one named for a screen changes with that screen and is copied for the next. |

### type-lifts-when-features-share-its-meaning · MUST

A type of the domain model lifts to the kernel only when features share its meaning. Such a type — an entity, a value object, an enumeration — belongs to the feature whose domain model holds it until two or more features use it with one meaning, the one the glossary gives its word in each of them. Otherwise, where the meaning differs or a feature uses only a sliver of it, a feature that needs it keeps its own narrow view, a type of its own or a reference by identifier, into which composition translates the other’s.

| Why |
|---|
| one meaning has one home every feature reads, while a type shared by features that read it differently must satisfy them all and stops them changing apart; a narrow view changes with its feature alone — shared kernel. |

### composition-holds-what-the-business-combines · MUST

What the business combines across features is an operation of a composition module. A fact joined, sorted or paged across features, a total or a decision across them is such an operation from its first use, and its use case gathers each feature's answers through their surfaces. Showing or handing on several features' answers together combines nothing of the business.

| Why |
|---|
| a rule of the business across features written in one screen is copied by every other interface that needs it and drifts between them, while a screen that only lays answers side by side changes with the screen, not with the business. |

### shared-piece-placed-by-meaning · MUST

A piece shared across features is placed by its meaning. One with business meaning goes to the kernel, one without it to the top-level `shared/`, and one that would make sense in any program to libs, a vendor's client that knows nothing of the program among them, one module per system. A piece without meaning that the domain or the kernel needs — a guard of exhaustiveness, a base error — lives in a role folder of the kernel, which both may import. What two composition modules share is placed the same way, and what two adapter modules share goes to libs, taking what it needs of the program as parameters, or, when it knows the program and holds no effect, to the top-level `shared/`. A piece shared within one feature stays in it: a piece two of its concepts use goes to its domain's `shared/`, save a domain service whose rule reads aggregates of several concepts, which takes a concept folder of its own.

| Why |
|---|
| a piece placed against its meaning is not where a reader looks for it, a vendor's client kept inside one adapter is written again by the next adapter of that system, and a kernel that takes pieces with no business meaning grows into a second domain every feature depends on. |

### pipeline-stages-live-under-steps · MUST

A pipeline's stages live in their owner's `steps/`. The owner is the use case or the domain service that runs them, and its stages live nowhere else.

| Why |
|---|
| a stage kept apart from the use case or the domain service that runs it is not found where its order is read, and changes apart from the owner it changes with — the common closure principle. |

## Surfaces

### module-reached-only-through-its-surface · MUST

A module, and any other folder with a surface, is reached from outside only through its surface. The surface offers what a caller may couple to and nothing else.

| Why |
|---|
| a caller that reaches past a surface depends on what the module never offered, and breaks when the module changes it — information hiding. |

### file-never-imports-its-own-modules-surface · MUST

Inside a module, a file never imports its own module's surface. It imports a file of its own folder directly and anything else of the module through the surface of the role folder or module that holds it.

| Why |
|---|
| a file that imports its own surface imports itself, and that is where cycles begin. |

### surface-only-re-exports · MUST

A surface that is a file only re-exports. It re-exports by name what callers may use, and holds no declaration, no logic and no re-export of everything.

| Why |
|---|
| a surface that declares or computes becomes a room of its own, and a wildcard offers internals nobody chose to offer. |

### further-entry-sits-beside-the-surface · MUST

A further entry of a package sits beside its surface and only re-exports. That holds for each one, such as the helpers its consumers test with, that a package others import offers and that serves no host framework; it is a file named after what it offers, which re-exports by name from the tree and declares nothing.

| Why |
|---|
| an entry kept elsewhere is a door a consumer does not find, and one that declares becomes a second home for logic beside the tree. |

### surface-offers-operations-not-mechanisms · MUST

A feature's or a composition module's surface offers its operations, never its mechanisms. Each offers its operations, the predicates and derived values of its aggregates and value objects, its domain events and the units of its presentation the levels above call or render — use cases, binding units. As types, it offers its aggregates with their inner entities, its value objects, enumerations among them, the read models its queries return, its expected failures with their codes and the ports it asks another feature to answer, which composition implements; it never offers its adapters, mappers or wire models, nor an aggregate's transitions, its rebuild from storage among them.

| Why |
|---|
| a caller that reaches a mechanism depends on how the feature works rather than on what it does, and breaks when the feature changes how — information hiding. |

### surface-only-on-a-module-or-one-kind · MUST

A module and a role folder each have a surface, and a layer folder has none. The members of a **role folder** are of one kind; a **layer folder** — a layer, or a concept folder — holds members that the import rules keep apart, and is never an import target, save `root/`, the one layer folder with a surface, the one door through which an entry file takes the program. The source of a program no package imports, and a domain's `shared/`, whose members are of different kinds, have no surface either. The source of a package others import is a module, and only its consumers import its surface.

| Why |
|---|
| a surface on a layer folder lets one import reach members the import rules keep apart and couples its caller to members it never uses, and an entry file that reaches into the composition root couples to a file that happens to hold a part of it instead of the one thing it runs. |

## Names

### folder-takes-its-layer-or-role-name · MUST

A folder takes the name the vocabulary gives its layer or role. That holds wherever a layer or a role of the active vocabulary names its purpose, and layer names are fixed words, whatever their grammatical number.

| Why |
|---|
| a folder named its own way hides its place in the tree until it is opened, and the settings that find a layer or a role by its name miss it. |

### file-carries-its-role-suffix · MUST

A **role file**, a file of a role, carries its **role suffix**, whatever its folder. A surface, an entry, a name a tool fixes, a unit named after its own folder, a member of a set whose role has no suffix and a registry carry none. A binding unit, named after its operation, carries the suffix its platform's or its framework's block names, and none where they name none. A spec keeps the suffix of the file it proves.

| Why |
|---|
| a file without its suffix hides its role until it is opened, and the tool that checks roles by their suffix passes it unchecked. |
