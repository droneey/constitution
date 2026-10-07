# Root

> Governs the composition root: wiring and configuration.

## Wiring

### composition-root-wires-everything · MUST
The composition root chooses every concrete implementation and wires the program in one known place. A unit receives its dependencies typed by their contracts and never builds or asks for an adapter; reading a typed scope the root fills is receiving, and logging is reached without being handed in. A container wires only from bindings written in the declarations the root composes; one that finds them by scanning, name or convention is forbidden.

| Why | Tags |
|---|---|
| one place that names every concrete choice makes the program’s shape readable and every choice replaceable. | [] |

### root-builds-and-hands-in-every-stateful-part · MUST
The composition root builds every adapter and every stateful client — a cache, a store, a connection — and hands each in, an adapter its own dependencies as a factory’s parameters or through its constructor.

| Why | Tags |
|---|---|
| a part the root hands in is visible and replaceable, in production and in tests. | [] |

### root-alone-reads-the-environment · MUST
The composition root — or the configuration provider a block below names — and the entry files alone read the environment; a spec may read it to drive the program.

| Why | Tags |
|---|---|
| no module depends on the process’s environment through a read no signature shows. | [security] |

### root-applies-the-decorators · MUST
The composition root applies every decorator — behaviour wrapped around an implementation — where it chooses that implementation.

| Why | Tags |
|---|---|
| the wrapped unit stays unchanged, and the root shows every wrapper beside the choice it wraps. | [] |

### root-alone-configures-logging · MUST
The composition root alone configures where log records go; a unit outside the domain reaches the language’s standard logging facade, or the program’s own logging port where the language has none, without having it handed in.

| Why | Tags |
|---|---|
| sinks configured in one place decide where every record goes, and a test replaces them without touching the code. | [] |
