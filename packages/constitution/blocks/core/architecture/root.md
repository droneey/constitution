# Root

> Governs the composition root: wiring and configuration.

## Wiring

### composition-root-wires-everything · MUST

The **composition root** chooses every concrete implementation, builds every adapter, every use case and every stateful client — a cache, a store, a connection — applies every decorator — behaviour wrapped around an implementation of a contract, not a language's decorator syntax — and wires the program in one known place, its **wiring file**. A unit receives its dependencies typed by their contracts, or a use case by its own type — as parameters or, in a delivery or binding unit, from a typed scope the root fills — and never builds an adapter or asks a registry for one by its contract. A framework's container, where the program's framework block brings one, wires only from bindings the root declares, never by scanning, name or convention; where the framework brings no container, the root wires by hand, with no container library.

| Why | Tags |
|---|---|
| one place that names every concrete choice makes the program’s shape readable and every choice replaceable; a container library the framework does not impose adds only indirection. | [] |

### package-has-at-most-one-root · MUST

A package holds at most one composition root, and a library holds none. A program that wires itself apart — on another framework or runtime, or built as an artefact of its own — is a package of its own, and what two such programs run lives in a package with no root; artefacts that start the one root in different ways are entries of one package.

| Why | Tags |
|---|---|
| a root is one place only while a package has one; a second root in the same tree splits every layer between two programs that wire it differently. | [] |

### delivery-unit-registered-by-the-root · MUST

The root registers every **delivery unit** with its framework — each address, handler, subscription or schedule the program answers — by the names the surfaces of features and composition offer; no unit is found by scanning a folder or registers itself on import. Where the framework fixes the folder of its registration, the registration lives there, holds only what the framework asks of it — the address and its parsing, guards, loading, the handoff to the unit — and belongs to the root.

| Why | Tags |
|---|---|
| the root is then the one place that lists everything the program answers, and a unit added or removed changes that list, not a framework's guess. | [] |

### root-alone-reads-the-environment · MUST

The composition root, its configuration provider included, and the entry files alone read the environment; a spec may read it to drive the program.

| Why | Tags |
|---|---|
| no module depends on the process’s environment through a read no signature shows. | [security] |

### root-alone-configures-logging · MUST

The composition root alone configures where log records go.

| Why | Tags |
|---|---|
| sinks configured in one place decide where every record goes, and a test replaces them without touching the code. | [] |
