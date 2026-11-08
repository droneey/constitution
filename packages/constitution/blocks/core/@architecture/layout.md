# Layout

> Governs a package's tree: its folders and their names, its surfaces, and where behaviour and the pieces shared between features live — in the kernel's role folders, the top-level `shared/`, libs or a library of their own.

## Vocabulary

The trees start at a package's source, which sits in the package's top folder beside the parts foundation's `layout` places there.

```text
src/
├── <entry>                the entry file of a program: hands the process to the program the root runs
├── <surface>              the surface of a package others import: its main published entry
├── <further entry>        a further published entry of a package others import, named after what it offers
├── root/                  the composition root: the files that assemble the program and register every
│                          delivery unit, behind the one door an entry file takes the program through
├── presentation/          the program's presentation
├── composition/<m>/       features that orchestrate other features: what the business combines across them
├── features/<f>/          the features
├── kernel/                the stable base every feature builds on: types of one meaning, ports needed
│                          alike, pieces with no business meaning, each in its role folder
├── infrastructure/<system>/  where the top of the source reaches the world outside: an adapter module of
│                          the kernel's ports over one system, or another unit at the edge
├── shared/                plumbing without business, used by two or more features
├── libs/                  code that knows nothing of the product: primitives, vendor clients
├── integrations/<framework>/  the package's integration into a framework that loads it, an entry file
│                          of its own
└── entrypoints/<n>/       another artefact of the program, or a tooling subcommand shipped apart from it
features/<f>/
├── domain/                the domain model
│   ├── <concept>/         a concept of the feature's language: usually one aggregate, or an enumeration
│   │   │                  that stands on its own, or a rule no entity owns
│   │   ├── entities/      the aggregate's root with its predicates, derived values and rebuild from
│   │   │                  storage, its inner entities
│   │   ├── transitions/   the aggregate's starting transition and its moves
│   │   ├── events/        the domain events its transitions yield
│   │   ├── value-objects/ the value objects, its identifier and enumerations among them, each with its
│   │   │                  predicates and derived values
│   │   ├── services/      the domain services
│   │   └── errors/        the concept's expected failures: a rule of the business refused
│   └── shared/            what two or more concepts of the feature use and none owns, in the same role folders
├── application/           the use cases and the ports they ask
│   ├── use-cases/         the use cases, queries in queries/ and commands in commands/, each with the
│   │                      parse of its operation input, a query with a read model no port returns,
│   │                      and a use case with the callbacks it hands a port in its callbacks/
│   ├── errors/            the application layer's expected failures: the operation cannot proceed, or
│   │                      its input is invalid
│   └── contracts/         every port, each with the failures it declares and the read models
│                          it returns
├── infrastructure/<system>/  the adapter module of this feature's ports over one outside system, with
│                          its edge workers; in composition, also one that answers a port through
│                          another feature
├── presentation/          what calls the program: the binding units in bindings/, by side, and the role
│                          folders of an interface's block
└── <surface>              the surface
```

`<entry>` and `<surface>` are foundation's `layout` terms, and **`<further entry>`**{#further-entry} likewise stands for what a language's block names. An artefact is the term of foundation's tests chapter. A program starts at an entry file, as foundation's `layout` defines it: `<entry>` at the top of the source, an entrypoint's main or an integration's main.

Of a package's published entries, as foundation's `dependencies` defines them, its surface is the **main published entry**, and each other is a **further published entry**, a file of the same form as a surface, named after what it offers, as the helpers its consumers test with.

A **library package** is a package others import that runs as no program of its own, unlike a lib, a folder module in `libs/`.

The outside system is foundation's `names` term, the command and the query its `functions` terms, the operator its `code` term and the product its `placement` term, and the terms of the program's parts are defined in the chapters that govern them: the aggregate in the domain chapter; the use case, the operation input and the read model in the application chapter; the port, the port of a binding unit's own concern, the event port, the dispatcher, the reporter ports, the port callback, the adapter module and the edge worker in the ports chapter; asking, combining, the reaction and the saga in the composition chapter; the calling framework, the binding unit and the delivery unit in the presentation chapter.

The **layers** are the folders of the tree.

**`root/`**{#composition-root} holds the composition root, the architecture's form of foundation's assembly.

**`features/`**{#bounded-context} holds the features.

**`composition/`**{#composition-module} holds the composition modules: a composition module is a feature that orchestrates other features — a context downstream of them, laid out and ruled as a feature save where the rules of composition and of the layers say otherwise.

**`infrastructure/`**{#adapter} holds the adapter modules: at the top of the source those of the kernel's ports and the other units at the edge a block places there, inside a feature or a composition module those of its own ports and, in a composition module, those that answer a feature's port through another feature; an adapter module also holds the edge workers over its system.

**`kernel/`**{#shared-kernel} holds the stable base every feature builds on, in role folders: the shared kernel, as the domain chapter defines it; in its `contracts/`, the ports of outside systems that features need in the same words, the ports of a binding unit's own concern and the event port; and pieces with no business meaning, such as a guard of exhaustiveness, a base error or the base type of a domain event.

**`shared/`**{#shared-code} holds what two or more folder modules of its level need where that level gives it no other home — at the top of the source, plumbing without business meaning that two or more features use.

**`libs/`**{#generic-library} holds code that knows nothing of the product: primitives and vendor clients.

**`integrations/`**{#host-integration} holds the package's integration into a framework that loads it, an entry file of its own.

**`entrypoints/`**{#extra-entry} holds another artefact of the program, with what ships only in it, or a tooling subcommand shipped apart from the program; a subcommand the program itself answers is a delivery unit of its presentation.

**`domain/`**{#domain-layer}, inside a feature, is the domain layer, the domain model.

**`application/`**{#application}, inside a feature, is the application layer, its use cases and the ports they ask.

**`presentation/`**{#presentation-layer}, inside a feature, is the presentation layer, through which the program is called; at the top of the source, `presentation/` is the program's presentation.

The **shared layers** are the kernel, the top-level `shared/` and libs.

**Inward** is toward the kernel, the most stable code, in this order: the entry files, the composition root and integrations; the program's presentation; composition; a feature's presentation; its application layer; its domain layer; the kernel.

The top-level `shared/` and libs sit inward of every layer that may import them, and an adapter module outward of the layer whose ports it implements; of two layers, the one inward is the **inner** one and the other the **outer** one.

The **edge** is every folder that may hold effects and import any package: the infrastructure, with everything it holds, libs, the composition root, the entry files and integrations.

The **port owner** of a port is the feature, the composition module or the kernel whose `contracts/` declares it, and an adapter's port owner is its port's.

A **folder module** is a folder with a surface, the layers or role folders it needs, and folder modules of this same form.

A **role folder** holds members of one kind.

**`contracts/`**{#port} holds the ports, in a feature's application or in the kernel, each with the expected failures it declares beside it.

**`use-cases/`**{#use-case} holds the use cases.

**`bindings/`**{#binding} holds the binding units and, in the program's presentation, the interface-wide units, apart from its sides.

**`queries/`**{#read-operation}, under `use-cases/` and `bindings/`, holds the queries.

**`commands/`**{#write-operation}, under `use-cases/` and `bindings/`, holds the commands.

A **concept folder**{#concept-folder}, inside a domain layer, is named in the feature's language for one concept of its domain model, and the domain layer's role folders live in a concept folder or in the domain layer's `shared/`.

**`entities/`**{#entity} holds entities alone: an aggregate's root, whose file holds its data, its predicates and derived values and its rebuild from storage, and its inner entities.

**`transitions/`**{#aggregate-transition} holds an aggregate's starting transition and its moves.

**`events/`**{#domain-event} holds the domain events a concept's transitions yield.

**`value-objects/`**{#value-object} holds the value objects, the aggregate's identifier and an enumeration among them; each file holds a value object's data and its predicates and derived values.

**`services/`**{#domain-service} holds the domain services.

**`errors/`**{#expected-failure} holds expected failures: in a domain layer, those of a rule of the business that refused; in a feature's application, those of an operation that cannot proceed — what it acts on is not found, its actor may not act — or whose input is invalid; in the kernel, the base error and the failures every port over one kind of system declares.

**`constants/`**{#constant} holds a folder module's constants, vocabulary with no behaviour.

**`types/`**{#type-folder} holds a folder module's types, likewise vocabulary with no behaviour.

**`utils/`**{#helper} holds pure helpers with no meaning of the product.

**`callbacks/`**{#callback-folder} holds the port callbacks a use case hands a port, beside that use case.

**`steps/`**{#pipeline-stage} holds a pipeline's steps, beside its runner, as foundation's `relations` defines it: here the use case or the domain service that runs them.

**`dtos/`**{#wire-model} holds the wire models, inside the infrastructure.

A **layer folder** — a layer, or a concept folder — holds members the import rules keep apart.

A **role file** is a file whose name ends in a role word's suffix or a collection suffix, as foundation's `names` chapter defines both, and that ending is its **role suffix**.

**`.entity`**{#entity-file} marks an entity that is no aggregate's root, **`.aggregate`**{#aggregate-file} an aggregate's root, **`.value-object`**{#value-object-file} a value object, an enumeration included, **`.service`**{#domain-service-file} a domain service, **`.transitions`**{#aggregate-transition-file} a file of an aggregate's transitions, **`.event`**{#domain-event-file} a domain event and **`.error`**{#error-file} an error.

**`.port`**{#port-file} marks a port — `mailer.port`, `payment-gateway.port` —, and **`.adapter`**{#adapter-file} a port's implementation — `mailer.adapter`, `payment-gateway.adapter`.

**`.use-case`**{#use-case-file} marks a use case, and **`.dto`**{#wire-model-file} a wire model, the shape of an outside format that an adapter parses.

**`.utils`**{#helper-file}, **`.types`**{#type-file} and **`.constants`**{#constant-file} are the collection suffixes of the files that collect helpers, types and constants, and **`.config`**{#config-file} marks a file of configuration its tool fixes. Every other suffix here, `.dto` and `.config` among them, is the file's spelling of a role word; foundation's `names` chapter defines both classes.

Every folder and suffix named here is a default.

## Form

### module-has-the-one-form · SHOULD

Every folder module has the one form of a folder module, at any depth. The source of a package others import, a feature, a composition module, a lib, and a folder module of a shared layer or of a role folder are folder modules.

| Why |
|---|
| a folder module laid out its own way must be learned before it is read, and a role folder that means one thing here and another there misleads the reader who knows it from elsewhere. |

### package-laid-out-by-the-tree · MUST

Every package's source is laid out by the tree: it holds only the folders of the tree and role folders. A feature and a composition module hold only their layers, specs and surface; a domain layer holds only concept folders and its `shared/`, each holding role folders; an application and a presentation hold only role folders; and a role folder of a domain layer or of the kernel holds its files flat. Exempt: an open set's members, in the folder of their own foundation's `layout` gives them; a pipeline's runner, in a folder of its own with its `steps/`; a use case with its `callbacks/`, likewise; and, in a language whose visibility works by its own unit of encapsulation rather than by file, a concept made one such unit with its transitions as the root's methods, kept from the presentation and the adapters by the language's visibility or a check of imports.

| Why |
|---|
| a source laid out its own way must be searched before it is changed, and a loose file belongs to no layer the import rules see, so they pass it unchecked. |

### role-folder-holds-only-its-role · SHOULD

Every role folder holds only members of the role the vocabulary gives it. `utils/` holds only pure helpers with no meaning of the product, and `constants/` and `types/` only vocabulary with no behaviour.

| Why |
|---|
| a member kept in another role's folder is not found where its role is looked for, and a helper with an effect or a meaning of the product hides behaviour where no layer's rules reach it. |

## Homes

### behaviour-lives-in-a-feature · SHOULD

Every behaviour of the business lives in a feature or a composition module, with its layers. Exempt: vocabulary with no behaviour — types, constants, kinds —, which may live in the kernel and in role folders.

| Why |
|---|
| behaviour kept outside a feature sits apart from the domain model, the adapters and the binding units it belongs with, so the reader who changes it misses them. |

### code-placed-by-its-reason-to-change · SHOULD

All code lives in the layer that owns its reason to change, beside its consumer. It lifts to the nearest common level only when a second consumer appears, and a library or a helper is placed the same way.

| Why |
|---|
| code kept away from its reason to change changes apart from what it changes with, and code lifted before its second consumer guesses at a sharing that may never come — the common closure principle. |

### shared-piece-placed-by-meaning · SHOULD

Every piece shared across features is placed by its meaning. With a business meaning it lifts to the kernel only as the rules of composition allow; without one it goes to the top-level `shared/`, or to a role folder of the kernel where the domain layer, the application layer or the kernel needs it, as a guard of exhaustiveness or a base error does; one any program could use goes to libs, a vendor's client among them. What two composition modules share is placed the same way, and what two adapter modules share goes to libs, taking what it needs of the program as parameters, or, where it knows the program and holds no effect, to the top-level `shared/`.

| Why |
|---|
| a piece placed against its meaning is not where a reader looks for it, and one the inner layers need, placed where they may not import it, is copied into each. |

### vendor-client-one-lib-per-system · SHOULD

Every vendor's client in `libs/` is a folder module of its own, one per outside system.

| Why |
|---|
| two systems' clients in one folder module change together whenever either system changes, and the adapters of one system import the other's with it. |

### piece-shared-within-a-feature-placed-by-its-owner · SHOULD

Within a feature, every piece is placed by the concept that owns it. A piece one concept owns — its identifier, its value objects — stays with it however many concepts use it, and only what no concept owns goes to the domain layer's `shared/`.

| Why |
|---|
| a piece moved to the domain layer's `shared/` because a second concept uses it loses its owner, and the next reader cannot tell whose rules it follows or who may change it. |

### domain-service-of-several-concepts-takes-its-own-folder · SHOULD

Every domain service over the aggregates of several concepts sits in a concept folder of its own. It never sits in one of theirs or in the domain layer's `shared/`.

| Why |
|---|
| a service of several concepts kept in one of them makes that concept know the others, and one kept in `shared/` makes the shared part know concepts it must stay below. |

### code-shared-by-several-products-kept-in-a-library · SHOULD

All code run by programs of several products that knows nothing of those products lives in a library package of its own. The library package holds no product.

| Why |
|---|
| code copied into each product drifts between the copies, and code kept beside a product can import that product. |

### pipeline-stages-live-under-steps · SHOULD

Every pipeline's steps live in its runner's `steps/` and nowhere else. They sit beside the use case or the domain service that runs them, which then sits in a folder of its own.

| Why |
|---|
| a step kept apart from its runner is not found where its order is read, and changes apart from the runner it changes with — the common closure principle. |

## Surfaces

### module-reached-only-through-its-surface · MUST

Every folder module, and every folder with a surface, is reached by code outside it only through its surface. Exempt: a spec, which may also take the fake and the contract suite that sit beside a port, and a fixture, which may reach past a surface to build the value it builds.

| Why |
|---|
| a caller that reaches past a surface depends on what the folder module never offered, and breaks when it changes — information hiding. |

### file-never-imports-its-own-modules-surface · MUST

Inside a folder module, every file imports its own folder's files directly, never the surface of a folder that holds it. That includes its folder module's surface.

| Why |
|---|
| a file that imports its own surface imports itself, and that is where cycles begin. |

### surface-only-re-exports · MUST

Every surface that is a file only re-exports, a further published entry included. It holds no declaration and no logic.

| Why |
|---|
| a surface that declares becomes a room of its own, beside the tree that already holds what it offers. |

### surface-offers-only-what-callers-may-couple-to · SHOULD

Every surface offers, by name, only what a caller may couple to, and never re-exports everything.

| Why |
|---|
| a surface that offers more than its callers may couple to, or a wildcard, hands out internals nobody chose to offer, and every caller of them breaks when they change — information hiding. |

### further-entry-sits-beside-the-surface · SHOULD

Every further published entry that serves no framework the package plugs into sits beside the package's surface, never inside the tree.

| Why |
|---|
| a published entry kept elsewhere is a door a consumer does not find, and one placed inside the tree becomes a second home for what the tree already holds. |

### surface-offers-operations-not-mechanisms · SHOULD

Every feature's or composition module's surface offers its operations, never its mechanisms. It offers its use cases and binding units, the units of its presentation the levels above render, the checked constructors of its value objects, the predicates and derived values of its aggregates and value objects and its domain events; as types, its aggregates with their inner entities, its value objects, the read models its queries return, its expected failures with their codes and the ports it asks another feature to answer, which composition implements. It never offers its adapters, mappers, wire models, an aggregate's transitions or, where the language lets it, its rebuild from storage.

| Why |
|---|
| a caller that reaches a mechanism depends on how the feature works rather than what it does, and breaks when the feature changes how — information hiding. |

### surface-only-on-a-module-or-one-kind · MUST

Only a folder module and a folder of one kind, a role folder, have a surface. A layer folder, the source of a program no package imports and a domain layer's `shared/` have none. Exempt: `root/`, the one door through which an entry file takes the program.

| Why |
|---|
| a surface on a layer folder lets one import reach members the import rules keep apart, and couples its caller to members it never uses. |

## Names

### folder-takes-its-layer-or-role-name · MUST

Every folder takes the name the vocabulary gives its layer or role, wherever one names its purpose. A layer's name is a fixed word whatever its grammatical number.

| Why |
|---|
| a folder named its own way hides its place in the tree, and the settings that find a layer or a role by name miss it. |

### file-carries-its-role-suffix · MUST

Every role file carries its role suffix, whatever its folder. A binding unit carries the suffix its platform's or framework's block names. Exempt: a surface, an entry file, a name a tool fixes, a unit named after its own folder, a member of a set whose role has no suffix, the file that registers an open set's members, and a binding unit where those blocks name no suffix.

| Why |
|---|
| a file without its suffix hides its role until it is opened, and the tool that checks roles by suffix passes it unchecked. |

### spec-keeps-the-suffix-of-the-file-it-proves · MUST

Every spec keeps the role suffix of the file it proves, before its own.

| Why |
|---|
| a spec that drops its file's suffix, as one named after the order that proves the order's aggregate root, is not found beside the role it proves, and the tool that pairs specs with their files by name passes it. |

### binding-unit-named-after-its-operation · SHOULD

Every binding unit is named after the operation it binds.

| Why |
|---|
| a binding unit named after its screen or its transport hides which operation it binds, and a second binding of the same operation is not found beside it. |

### further-entry-named-after-what-it-offers · SHOULD

Every further published entry is named after what it offers.

| Why |
|---|
| a published entry named after where it sits or who first used it tells a consumer nothing of what importing it brings. |
