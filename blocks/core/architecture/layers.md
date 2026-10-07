# Layers

> Governs a layer: what it holds and may import.

The import rules of this chapter together are the layer matrix; the language's block names the source root, the surface file and the suffix form.

## Direction

### import-points-inward · MUST
An import points inward, toward stability: an outer layer imports an inner one, never the reverse.

| Why | Tags |
|---|---|
| an outward import lets a volatile detail break a stable rule. | [] |

### domain-imports-only-itself-the-kernel-and-shared-contracts · MUST
The domain imports only itself, the kernel and the shared contracts: no framework, no input or output, no vendor library however pure; a tool’s types stop at its boundary.

| Why | Tags |
|---|---|
| a domain that imports a library changes when the library does, and cannot be read or tested without it. | [] |

### feature-never-imports-a-feature · MUST
A feature never imports another feature; features are combined only by the layer above them.

| Why | Tags |
|---|---|
| a feature that knows another cannot change, be tested or be removed alone. | [] |

### effects-held-only-by-the-edge · MUST
Only the edge holds effects — input and output, the network, storage, the file system, the clock, randomness, identifiers, the environment and processes live in adapters, behind ports — and the domain and every other unit of logic reach them only through those ports. Reading the environment and writing diagnostics through the logging facade stand outside the ports.

| Why | Tags |
|---|---|
| code without effects is deterministic, so it is tested fast, reasoned about locally and reused, and a test replaces an effect through its port. | [] |

### root-imported-only-by-entries-and-delivery-wiring · MUST
The composition root is imported only by entry files and by the delivery layer’s own wiring.

| Why | Tags |
|---|---|
| the root knows every concrete choice, and code that imports it can no longer be tested with fakes. | [] |

### entrypoint-never-imported · MUST
No code imports an entrypoint; an entrypoint composes features through their surfaces and holds what ships only in its artefact.

| Why | Tags |
|---|---|
| an entrypoint is a separate artefact, and importing it drags that artefact into another. | [] |

### integration-never-imported · MUST
No other code of the package imports an integration, and an integration imports the package’s surfaces as a consumer would, never another integration.

| Why | Tags |
|---|---|
| the host framework calls the package, so an integration offered as its own entry loads the framework only for those who use it. | [] |

### kernel-imports-only-itself · MUST
The kernel imports only itself and the data files its values are read from.

| Why | Tags |
|---|---|
| everything depends on the kernel, so it depends on nothing that changes. | [] |

### libs-import-no-application-code · MUST
A lib imports no code of the application — no feature, the kernel, shared, contracts, adapters, integrations or the root — and knows nothing of the repository that uses it.

| Why | Tags |
|---|---|
| a lib could be published tomorrow, and one import of the application ties it to this program for good. | [] |

### shared-imports-no-feature-adapter-contract-or-root · MUST
Shared plumbing imports no feature, adapter or contract, and not the root.

| Why | Tags |
|---|---|
| plumbing that knows a feature is part of that feature. | [] |

### layer-imports-dependencies-by-its-role · MUST
Each folder of the tree imports installed dependencies by its role: the domain, the kernel and the contracts import none; the edge — adapters, libs, the root, the entry files, the delivery layer and integrations — imports any; every other folder imports only a dependency whose block gives it a home there. A dependency with no block, or whose block names no home, is imported only at the edge; specs import what they need.

| Why | Tags |
|---|---|
| a dependency is volatile, and one table by folder role holds every dependency at once, those nobody wrote a rule for included. | [] |

## Placement

### code-placed-by-its-reason-to-change · MUST
Code lives in the layer that owns its reason to change, beside its consumer when they share it, and lifts to the nearest common level only when a second consumer appears; a tool is placed the same way.

| Why | Tags |
|---|---|
| code placed by its reason to change is found where it is needed and moves only when that reason moves. | [] |

### contract-lifts-on-its-second-feature · MUST
A contract belongs to the feature that needs it; when a second feature needs it, it lifts to the shared contracts, never sideways into one of them.

| Why | Tags |
|---|---|
| a contract owned by one feature and used by another couples the second to the first. | [] |

### composition-lifts-on-its-second-consumer · MUST
Composition across features lives in the delivery unit that needs it and moves to its own composition module when a second consumer needs it; facts derived from several features are derived there.

| Why | Tags |
|---|---|
| a composition layer made before a second consumer is one nobody needs yet. | [] |

### shared-piece-placed-by-meaning · SHOULD
A shared piece with business meaning goes to the kernel, one without it to shared, and one that would make sense in any program to libs; the kernel stays small.

| Why | Tags |
|---|---|
| the folder then says what a piece means, and the kernel does not grow into a second domain. | [] |

### vendor-client-lives-in-libs · SHOULD
A vendor’s client without knowledge of the application lives in libs, one module per system.

| Why | Tags |
|---|---|
| every adapter of that system and other programs can reuse it, and the adapters stay thin. | [] |

### protocol-between-artefacts-lives-in-shared · SHOULD
A protocol two artefacts of one program speak lives in the program’s shared plumbing, imported by both.

| Why | Tags |
|---|---|
| each side speaks the same types, and neither artefact imports the other. | [] |

## The delivery layer

### delivery-unit-beside-what-it-serves · SHOULD
A delivery unit that serves one feature lives in that feature’s application layer where the entry surface allows it; one that composes several lives in the delivery layer or in composition.

| Why | Tags |
|---|---|
| a unit lives with the reason it changes. | [] |

### delivery-unit-stays-thin · SHOULD
A delivery unit — a screen, a command, a handler, a tool function — parses its input, calls the operations whose results it presents, and presents them; it holds no business logic, and what an operation reports reaches it as a returned value, never as output printed along the way.

| Why | Tags |
|---|---|
| business logic in a delivery unit cannot be reused by another transport or tested without it. | [] |
