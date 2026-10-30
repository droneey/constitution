# Layers

> Governs a layer: what it holds and may import.

The import rules of this chapter together are the **layer matrix**; the language's block names the source root, the surface file and the suffix form. The edge is every folder that may hold effects and import any package: adapters, libs, the root, the entry files and integrations. Inward means toward the kernel, in this order: the entry files, the root and integrations; composition; a feature's presentation; its application; its domain; the kernel. Shared plumbing and libs sit below every layer that may import them, and an adapter beside the layer whose ports it implements.

## Direction

### import-points-inward · MUST

An import points inward, toward stability, in the order this chapter opens with; never the reverse; an import made only for types counts like any other.

| Why |
|---|
| an outward import lets a volatile detail break a stable rule. |

### domain-imports-only-itself-and-the-kernel · MUST

Of the program's code, the domain imports only itself and the kernel's model — never a port, a use case or anything of the presentation; of the language's standard library, only what holds no effect.

| Why |
|---|
| a domain that imports a library changes when the library does, and cannot be read or tested without it. |

### application-imports-only-the-domain-and-its-contracts · MUST

Of the program's code, the application imports only the domain, the kernel and its own contracts, and in composition the surfaces of the features it composes — never an adapter, a presentation or the root; of the language's standard library, only what holds no effect.

| Why |
|---|
| a use case that knows a framework, an adapter or a screen can run nowhere else, and the next client, worker or command of the program must write it again. |

### feature-never-imports-a-feature · MUST

A feature never imports another feature; features are combined only by the layer above them.

| Why |
|---|
| a feature that knows another cannot change, be tested or be removed alone. |

### composition-module-never-imports-another · MUST

A module of composition never imports another; what two of them need lives in the kernel when it carries business meaning and in shared when it does not, and what they need of the features is composed in each, or the two become one module.

| Why |
|---|
| a composition module that leans on another becomes a layer above it, and the composition stops being one flat level any module can be read from alone. |

### effects-held-only-by-the-edge · MUST

Only the edge holds effects — input and output, the network, storage, the file system, the clock, randomness, identifiers, the environment and processes — and the application and every other unit of logic reach them only through ports their adapters implement, while the domain reaches none. A unit outside the edge reaches no effect through a lib either. A unit outside the domain and the application writing diagnostics through the logging facade, a binding unit's timer that schedules its own work, and a delivery unit reading and writing through the input and output its framework hands it — a request and its reply, the streams of a run — stand outside the ports.

| Why |
|---|
| code without effects is deterministic, so it is tested fast, reasoned about locally and reused, and a test replaces an effect through its port — a functional core in an imperative shell. |

### root-imported-only-by-entries · MUST

The composition root is imported only by entry files — a file at the top of the source, an entrypoint's main and an integration's main — and by specs.

| Why |
|---|
| the root knows every concrete choice, and code that imports it can no longer be tested with fakes. |

### adapter-imported-only-by-the-root · MUST

An adapter is imported only by the composition root and by the surface of a package that offers it to its consumers, each through the adapter's own surface, and by specs; a use case or a composition module receives it through its port, and a binding or delivery unit receives the use case built over it.

| Why |
|---|
| an adapter imported past its port binds its caller to the vendor the port hides, and a spec can replace it only by patching the import. |

### entrypoint-never-imported · MUST

No code imports an entrypoint; an entrypoint composes features through their surfaces and holds what ships only in its artefact.

| Why |
|---|
| an entrypoint is a separate artefact, and importing it drags that artefact into another. |

### integration-never-imported · MUST

No other code of the package imports an integration, and an integration imports only the surfaces of the package’s modules, never its main entry or another integration.

| Why |
|---|
| the host framework calls the package, so an integration offered as its own entry loads the framework only for those who use it. |

### kernel-imports-only-itself · MUST

Of the program's code, the kernel imports only itself and the data files its values are read from; of the standard library, only what holds no effect; of installed dependencies, only a library of one outside format or arithmetic that one value object imports.

| Why |
|---|
| everything depends on the kernel, so it depends on nothing that changes. |

### libs-import-no-application-code · MUST

A lib imports no code of the application — no feature, nor the kernel, shared, adapters, integrations or the root — and knows nothing of the repository that uses it.

| Why |
|---|
| a lib could be published tomorrow, and one import of the application ties it to this program for good. |

### shared-imports-no-feature-adapter-contract-or-root · MUST

Shared plumbing imports no feature, adapter or contract, the kernel's included, and not the root.

| Why |
|---|
| plumbing that knows a feature is part of that feature. |

### layer-imports-dependencies-by-its-role · MUST

Each folder of the tree imports installed dependencies by its role: the domain, the application and the kernel import none, save a library of one outside format or arithmetic the domain cannot reasonably own — a numbering plan, bank account numbers by country, decimal arithmetic — that does no input or output, holds no state or configuration, needs no framework and is pinned exactly, which one value object imports, keeping its types out of every signature and its failures its own; a general schema or parsing library is never one. The edge imports any; every other folder imports only a dependency whose block gives it a home there. A dependency with no block, or whose block names no home, is imported only at the edge; specs import what they need.

| Why |
|---|
| a dependency is volatile, and one table by folder role holds every dependency at once, those nobody wrote a rule for included; a library swapped for another is then swapped at the edge alone, and a format no one should write by hand is held in the one value object that needs it. |

## Homes

### code-placed-by-its-reason-to-change · MUST

Code lives in the layer that owns its reason to change, beside its consumer when they share it, and lifts to the nearest common level only when a second consumer appears; a library or a helper is placed the same way.

| Why |
|---|
| code placed by its reason to change is found where it is needed and moves only when that reason moves. |

### code-shared-across-repositories-released-from-a-library-repository · SHOULD

Code that knows nothing of the product and is needed by more than one repository is released from a repository of libraries, which holds nothing of any product; until a second repository needs it, it lives in the `libs/` of the source that uses it.

| Why |
|---|
| the boundary of what knows nothing of the product is then the repository's, which no import can cross, and one release reaches every repository that needs it instead of a copy in each. |

### contract-lifts-on-its-second-feature · MUST

A contract belongs to the feature that needs it; when a second feature needs it in the same words and an outside system answers it — a clock, a mailer — it lifts to the kernel's `contracts/`, never sideways into one of them, while one each context words its own way stays with each context. A contract another feature answers never lifts: each feature that asks words its own.

| Why |
|---|
| a contract owned by one feature and used by another couples the second to the first, and one lifted while a feature answers it carries that feature's model and failures into the kernel. |

### type-lifts-when-features-share-its-meaning · MUST

A business type — an entity, a value object, an enumeration — belongs to the feature whose model holds it, and lifts to the kernel only when two or more features use it with one meaning, universal and stable; otherwise — another meaning, only a sliver of it, or a meaning not yet universal and stable — a feature that needs it keeps its own narrow view, a type of its own or a reference by identifier, into which composition translates the other’s.

| Why |
|---|
| one meaning has one home every feature reads, while a type shared by features that read it differently must satisfy them all and stops them changing apart; a narrow view changes with its feature alone. |

### composition-lifts-on-its-second-consumer · MUST

Composition across features lives beside the delivery unit that needs it, in that unit's composition module, and lifts into the module's own layers when a second unit needs it; facts derived from several features, and the implementation of a contract one feature asks another to answer, live in a composition module's layers from their first use.

| Why |
|---|
| a composition layer made before a second consumer is one nobody needs yet. |

### shared-piece-placed-by-meaning · SHOULD

A shared piece with business meaning goes to the kernel, one without it to shared, and one that would make sense in any program to libs; a piece without meaning that the domain or the kernel needs — a guard of exhaustiveness, a base error — lives in a role folder of the kernel, which both may import. The kernel stays small.

| Why |
|---|
| the folder then says what a piece means, and the kernel does not grow into a second domain. |

### vendor-client-lives-in-libs · SHOULD

A vendor’s client without knowledge of the application lives in libs, one module per system.

| Why |
|---|
| every adapter of that system and other programs can reuse it, and the adapters stay thin. |

### protocol-between-artefacts-lives-in-shared · SHOULD

A protocol two artefacts of one program speak lives in the program’s shared plumbing, imported by both.

| Why |
|---|
| each side speaks the same types, and neither artefact imports the other. |

## Delivery units

### delivery-unit-beside-what-it-serves · SHOULD

A delivery unit that serves one feature’s operations lives in that feature’s presentation; one that composes several features lives in the composition module that composes them. No folder of the tree is a delivery layer of its own.

| Why |
|---|
| a unit lives with the reason it changes. |

### binding-unit-calls-only-use-cases · MUST

A binding unit, and a delivery unit that binds several operations itself, calls each operation's use case and never a port of its feature or of the kernel; a port of its own concern — the identifier it makes for a command, the events it reports — comes from the root as the use case does.

| Why |
|---|
| the interface then reaches the domain at one door per operation, and which store or service answers stays the root's choice, hidden from every interface. |

### delivery-unit-stays-thin · SHOULD

A delivery unit — a screen, a command, a handler, a tool function — parses its input, calls the operations whose results it presents, and presents them; it holds no business logic, and what an operation reports reaches it as a returned value, never as output printed along the way.

| Why |
|---|
| business logic in a delivery unit cannot be reused by another transport or tested without it. |
