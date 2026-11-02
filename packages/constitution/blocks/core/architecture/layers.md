# Layers

> Governs the layers: the direction of their imports and the effects they may hold.

The import rules of this chapter together are the **layer matrix**{#layer-matrix}; the language's block names the source root, the surface and the suffix form. They hold the order inward, the edge and the shared layers as the layout's vocabulary gives them.

## Direction

### import-points-inward · MUST

An import points inward. Inward is toward stability, in the order the layout's vocabulary gives, and no import points the reverse way; an import made only for types counts like any other.

| Why |
|---|
| an outward import lets a volatile detail break a stable rule — the dependency rule. |

### domain-imports-only-itself-and-the-kernel · MUST

Of the program's code, the domain imports only itself and the kernel. It imports nothing in the kernel's `contracts/` and never a port, a use case or anything of the presentation, and of the standard library only what holds no effect.

| Why |
|---|
| a domain that imports a port, a use case or the presentation changes whenever they do and can no longer be read or tested alone, though it is the most stable code of the program — the dependency rule. |

### application-imports-only-the-domain-and-the-kernel · MUST

Of the program's code, the application layer imports only itself, the domain, the kernel and, in composition, the surfaces of the features it composes. It never imports an adapter, a presentation or the composition root, and of the standard library it imports only what holds no effect.

| Why |
|---|
| a use case that knows a framework, an adapter or a transport can run nowhere else, and the next interface, worker or command of the program must write it again — ports and adapters. |

### domain-model-changed-only-through-a-use-case · MUST

The domain model changes only through a use case. Only the use cases of an aggregate's feature, and the domain services they call, call its transitions to change it; the adapters that rebuild the aggregate from storage, its repository's and a queries port's, call its rebuild alone, which changes nothing, and a spec calls what it proves. By default the imports hold it, a concept's `transitions/` being imported by those alone, and a language's block may hold it instead by a check the block names.

| Why |
|---|
| a change made outside a use case is neither checked against the store, saved nor announced, and the caller that made it holds a state no one else sees. |

### query-and-command-apart · MUST

The read side and the write side never import each other's code. No use case or binding unit of one side imports a file of the other side's, a query's use case takes from `contracts/` its queries ports and no repository, and a command's use case the repositories of the aggregates it loads or saves and no queries port; either may also take a port that belongs to neither side. A surface that offers both sides by name — of `contracts/`, of the use cases, of a feature — belongs to neither, and a caller takes from it only what its own side may take.

| Why |
|---|
| a side that imports the other changes whenever the other does, and the two can no longer change, scale or be stored apart; a query that reaches a repository can save, and reads from the commands' store, and a command that reaches a queries port decides on a read that may lag — command–query responsibility segregation. |

### port-knows-no-vendor · MUST

A port knows no vendor. That holds for its parameters and its results too: none imports a vendor, an adapter, another feature or another port’s internals, and each speaks only the domain's and the kernel's types, the read models declared beside the queries ports and the values of the standard library that hold no effect.

| Why |
|---|
| a port that knows a vendor ties every implementation, and the layer that declares it, to that vendor — the dependency inversion principle. |

### adapter-imports-only-its-owners-domain-and-shared-layers · MUST

An adapter imports only what its owner's ports speak, the shared layers and, where it answers a feature's port through another feature, that feature's surface. What its owner's ports speak is that owner's domain and its ports. No adapter imports a use case, a presentation, another composition module or another adapter module.

| Why |
|---|
| adapters that know each other or their callers form a hidden second program beside the domain. |

### feature-never-imports-a-feature · MUST

A feature never imports another feature. Features are combined only by a layer above them — composition or the program's presentation.

| Why |
|---|
| a feature that knows another cannot change, be tested or be removed alone. |

### feature-reacts-to-another-only-through-composition · MUST

A feature reacts to another feature's events only through composition. It offers its own events through its surface and never subscribes to another feature's; the reaction is a use case of a composition module, which reaches the other feature's events and calls the reacting feature's operation through their surfaces, and which a subscription in that module's presentation binds.

| Why |
|---|
| a feature that subscribes to another depends on its events as much as on an import, and a chain of reactions hidden in subscribers spread through the features is one no reader can follow from one place. |

### composition-module-never-imports-another · MUST

A composition module never imports another. What two of them need of the features is composed in each, or the two become one module.

| Why |
|---|
| a composition module that leans on another becomes a layer above it, and the composition stops being one flat level any module can be read from alone. |

### program-presentation-imports-only-surfaces-and-shared-layers · MUST

The program's presentation imports, of what lies inward of it, only surfaces and the shared layers. Those are the surfaces of features and composition modules, the kernel, the top-level `shared/` and libs.

| Why |
|---|
| the program's presentation spans every feature, so one import past their surfaces ties the whole presentation to a feature's internals, and every change inside that feature reaches it. |

### root-imported-only-by-entry-files · MUST

The composition root is imported only by entry files and specs.

| Why |
|---|
| the root knows every concrete choice, and code that imports it can no longer be tested with fakes. |

### adapter-imported-only-by-the-root · MUST

An adapter is imported only by the composition root. Beside the composition root, specs may import it, and so may the surface through which a package offers it to its consumers; the composition root and that surface import it through the surface of its adapter module; a use case or a composition module receives it through its port, and a binding or delivery unit receives the use case built over it.

| Why |
|---|
| an adapter imported past its port binds its caller to the vendor the port hides, and a spec can replace it only by patching the import. |

### entrypoint-never-imported · MUST

No code imports an entrypoint, and an entrypoint reaches features only through their surfaces.

| Why |
|---|
| an entrypoint is a separate artefact: importing it drags that artefact into another, and one that reaches past a feature's surface ties the artefact to that feature's internals. |

### integration-never-imported · MUST

No other code of the package imports an integration, and an integration imports only the surfaces of the package’s modules. It never imports the package's main entry or another integration.

| Why |
|---|
| an integration imported by the rest of the package loads its host framework for every consumer, not only for those who use that host, and one that imports the main entry or another integration ties the hosts to each other. |

### kernel-imports-only-itself · MUST

The kernel imports only itself. Of the program's code it imports nothing else, and beyond that code only the data files its values are read from, what of the standard library holds no effect, and a library of one outside format or arithmetic its value objects may import as the domain's do.

| Why |
|---|
| everything depends on the kernel, so a change in anything it imports reaches every feature at once — the stable dependencies principle. |

### libs-import-no-code-of-the-program · MUST

A lib imports no code of the program. It imports no feature, nor the kernel, shared, adapters, integrations or the composition root, and knows nothing of the repository that uses it.

| Why |
|---|
| a lib could be published tomorrow, and one import of the program ties it to this program for good. |

### shared-imports-no-feature-adapter-port-or-root · MUST

The top-level `shared/` imports no feature, adapter or port, the kernel's included, and not the composition root.

| Why |
|---|
| plumbing that knows a feature becomes part of that feature, and every other feature that uses the plumbing is then tied to it unseen. |

### layer-imports-dependencies-by-its-role · MUST

Each folder of the tree imports only the installed dependencies its role admits. The domain, the application layer and the kernel import none, the edge imports any, and every other folder imports only a dependency whose block gives it a home there. A dependency with no block, or whose block names no home, is imported only at the edge, and specs import what they need. The one exception in the domain and the kernel is a library of one outside format or arithmetic — a numbering plan, bank account numbers by country, decimal arithmetic —, which only the value objects that need it import. Such a library does no input or output, holds no state or configuration, needs no framework and is pinned exactly; its types stay out of every signature and its failures are its own, and a general schema or parsing library is never one.

| Why |
|---|
| a dependency imported wherever it is handy spreads its volatility into layers that should not change with it, and replacing it then reaches the domain, while one table by folder role holds every dependency at once, those nobody wrote a rule for included; a format no one should write by hand is held only in the value objects that need it. |

## Effects

### effects-held-only-by-the-edge · MUST

Only the edge holds effects. An effect is input and output, the network, storage, the file system, the clock, randomness, identifiers, the environment or a process; the application layer and every other unit of logic reach effects only through ports their adapters implement, and the domain reaches none. A unit outside the edge reaches no effect through a lib either. Three uses stand outside the ports: diagnostics a unit outside the domain and the application layer writes through the logging facade, a binding unit's timer that schedules its own work, and a delivery unit reading and writing through the input and output its framework hands it — a request and its reply, the streams of a run.

| Why |
|---|
| logic that holds an effect answers differently from run to run, so its specs need the real effect or a patch of it, run slowly and fail at random — ports and adapters, and a functional core in an imperative shell. |

### domain-and-application-log-nothing · MUST

The domain and the application layer log nothing. A use case returns its result or fails with its expected failure, and a binding or delivery unit logs what happened, a failure the use case handled included.

| Why |
|---|
| a domain or a use case that logs decides what an operator is told, which only its caller knows enough to decide. |
