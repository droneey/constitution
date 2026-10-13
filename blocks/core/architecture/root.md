# Root

> Governs the composition root: wiring and configuration.

## Wiring

### composition-root-wires-everything · MUST
The composition root chooses every concrete implementation, builds every adapter and stateful client — a cache, a store, a connection — applies every decorator — behaviour wrapped around an implementation of a contract, not a language's decorator syntax — and wires the program in one known place. A unit receives its dependencies typed by their contracts — as parameters or, in a delivery or binding unit, from a typed scope the root fills — and never builds an adapter or asks a registry for one by its contract. A framework's container, where the program's framework block brings one, wires only from bindings the root declares, never by scanning, name or convention.

| Why | Tags |
|---|---|
| one place that names every concrete choice makes the program’s shape readable and every choice replaceable. | [] |

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
