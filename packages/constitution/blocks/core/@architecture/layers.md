# Layers

> Governs the layers: the direction of their imports and the effects they may hold.

## Vocabulary

The import rules of this chapter together are the **layer matrix**{#layer-matrix}; they hold the order inward, the edge and the shared layers as the layout's vocabulary gives them, and the language's block names the source root, the surface and the suffix form.

A **format library** is a library of one outside format or arithmetic — a numbering plan, bank account numbers, decimal arithmetic, calendar dates and times, an identifier's format —, which does no input or output, holds no state or configuration, needs no framework and is pinned exactly; a general schema or parsing library is none.

## Direction

### import-points-inward · MUST

Every import points inward, toward stability, in the order the layout gives, and never the reverse way. An import made only for types counts like any other, here and under every other rule of the layer matrix.

| Why |
|---|
| an outward import lets a volatile detail break a stable rule — the dependency rule. |

### domain-imports-only-itself-and-the-kernel · MUST

Of the program's code, the domain layer imports only itself and the kernel. It imports nothing of the kernel's `contracts/`, and never a port, a use case or anything of the presentation.

| Why |
|---|
| a domain layer that imports a port, a use case or the presentation changes whenever they do and can no longer be read or tested alone, though it is the most stable code of the program — the dependency rule. |

### application-imports-only-its-domain-the-kernel-and-composed-surfaces · MUST

Of the program's code, the application layer imports only itself, its domain layer and the kernel. In composition it also imports the surfaces of the features it composes; it never imports an adapter, a presentation or the composition root.

| Why |
|---|
| a use case that knows a framework, an adapter or a transport can run nowhere else, and the next interface, worker or subcommand must write it again — ports and adapters. |

### adapter-imports-only-its-owners-domain-ports-or-shared-layers · MUST

Every adapter imports only its own adapter module, what its port owner's ports speak and the shared layers. What those ports speak is its port owner's domain layer and ports. It never imports a use case, a presentation, another composition module or another adapter module. An edge worker imports as its adapter module's adapters do, receiving from the root the ports it hands its work to. Exempt: an adapter that answers a feature's port through another feature, which reaches the asking feature and the answering one, the answering one's query among them, through their surfaces, and the event port's adapter, which imports the surfaces of the features whose events it maps.

| Why |
|---|
| adapters that know each other or their callers form a hidden second program beside the domain. |

### concept-imports-only-anothers-values · SHOULD

Every concept of a domain layer imports another concept of its feature only for its identifier and its value objects. It never imports the other's entities, transitions or services. Exempt: a domain service of several concepts, which takes their aggregates.

| Why |
|---|
| a concept that reaches another's entities or transitions changes with them and can change them, and the boundary of each aggregate holds only on paper. |

### domain-shared-imports-no-concept · SHOULD

Every domain layer's `shared/` is imported by its concepts and imports none of them.

| Why |
|---|
| a `shared/` that knows a concept becomes part of it, and every other concept that uses it is tied to that concept unseen, or caught in a cycle with it. |

### feature-never-imports-a-feature · MUST

Every feature is combined with another only by a layer above them, composition or the program's presentation, and never imports it.

| Why |
|---|
| a feature that knows another cannot change, be tested or be removed alone. |

### composition-module-never-imports-another · MUST

Every composition module composes in itself what it needs of the features, never importing another; what two of them need is composed in each, or the two become one module.

| Why |
|---|
| a composition module that leans on another becomes a layer above it, and composition stops being one flat level any composition module can be read from alone. |

### program-presentation-imports-only-surfaces-and-shared-layers · SHOULD

Of what lies inward of it, the program's presentation imports only the surfaces of features and composition modules and the shared layers.

| Why |
|---|
| the program's presentation spans every feature, so one import past a surface ties all of it to a feature's internals. |

### root-imported-only-by-entry-files · MUST

The composition root is imported only by entry files. Exempt: specs.

| Why |
|---|
| the root knows every concrete choice, and code that imports it can no longer be tested with fakes. |

### adapter-imported-only-by-the-root · MUST

Every adapter is imported only by the composition root, through its adapter module's surface. A use case or a composition module receives it through its port, a binding or delivery unit receives the use case built over it, and an edge worker is imported and started by the root alone. Exempt: specs, and the surface through which a package offers it to consumers.

| Why |
|---|
| an adapter imported past its port binds its caller to the vendor the port hides, and a spec can replace it only by patching the import. |

### entrypoint-never-imported · MUST

No code imports an entrypoint.

| Why |
|---|
| an entrypoint is a separate artefact, so importing it drags that artefact into another. |

### integration-never-imported · MUST

No other code of the package imports an integration.

| Why |
|---|
| an integration imported by the rest of the package loads the framework it plugs into for every consumer. |

### integration-imports-only-surfaces · SHOULD

Every integration imports only the root's surface and the surfaces of the package's folder modules. It never imports the package's main published entry or another integration.

| Why |
|---|
| an integration that imports another ties the frameworks they plug into to each other, and one that imports the package's main published entry loads what the package offers its consumers instead of the program it integrates. |

### kernel-imports-only-itself · MUST

Of the program's code the kernel imports only itself. Beyond it, it imports only the data files its values are read from, the standard library and the installed dependencies its role admits.

| Why |
|---|
| everything depends on the kernel, so a change in anything it imports reaches every feature at once — the stable dependencies principle. |

### libs-import-no-code-of-the-program · MUST

Every lib stands apart from the program: it imports none of its code outside `libs/`.

| Why |
|---|
| a lib could be published tomorrow, and one import of the program ties it to this program for good. |

### shared-imports-no-feature-adapter-port-or-root · MUST

The top-level `shared/` stays plumbing: it imports no feature, adapter or port, the kernel's included, and no composition root.

| Why |
|---|
| plumbing that knows a feature becomes part of it, and every other feature that uses it is tied to it unseen. |

### layer-imports-dependencies-by-its-role · MUST

Each folder imports only the installed dependencies its role admits: the edge any, the application layer none, the domain layer and the kernel none but a format library, and every other folder only a dependency whose block gives it a home there. A dependency with no home is imported only at the edge. Exempt: test code, which imports what it needs.

| Why |
|---|
| a dependency imported wherever it is handy spreads its volatility into layers that should not change with it, while one table by role holds every dependency, those nobody wrote a rule for included. |

### format-library-kept-inside-its-value-objects · SHOULD

Every format library the domain layer or the kernel imports is imported only by the value objects that need it. Its types and its failures stay out of every signature. Exempt: specs, which import what they need.

| Why |
|---|
| a format library that leaks past its value objects makes the domain model speak its types, so replacing it reaches every rule that took them. |

## Effects

### effects-held-only-by-the-edge · MUST

Only the edge holds effects. Every other unit reaches one only through a port its adapters implement — the domain layer none —, calls nothing of a library or the standard library that holds one, and imports nothing the block of its language or its runtime bars. Exempt: a diagnostic written through the diagnostic handles, a binding unit's timer that schedules its own work, and a delivery unit reading and writing through the input and output its calling framework hands it, a request and its reply or the streams of a run.

| Why |
|---|
| logic that holds an effect answers differently from run to run, so its specs need the real effect or a patch of it, run slowly and fail at random — ports and adapters, and a functional core in an imperative shell. |

### contained-failure-reported-through-the-fault-reporter · MUST

Every failure of an optional part that a use case contains reaches the operator through the fault reporter the root hands in. Neither the use case's result nor its failure carries it.

| Why |
|---|
| a contained failure that only a log would show is either lost or logged by a domain or application layer that should not decide what an operator is told. |
