# Composition

> Governs the composition root: where the program is wired and configured.

## Wiring

### composition-root-wires-everything · MUST
Concrete implementations are chosen and wired in one known place, the composition root. A unit receives its dependencies typed by their contracts and never builds or asks for an adapter; reading a typed scope the root fills is receiving. A container wires only from bindings written in the declarations the root composes; one that finds them by scanning, name or convention is forbidden.

| Why | Tags |
|---|---|
| one place that names every concrete choice makes the program’s shape readable and every choice replaceable. | [] |

### root-hands-adapters-their-dependencies · MUST
The composition root hands every adapter its dependencies — the transport, the clients it speaks through — as a factory’s parameters or through its constructor; an adapter keeps no hidden state and imports no shared instance.

| Why | Tags |
|---|---|
| a dependency an adapter receives is visible and replaceable, and nothing it holds leaks between its callers unseen. | [] |

### root-chooses-the-real-effects · MUST
The composition root alone chooses the real implementation of every effect’s port — the clock, randomness, identifiers, the environment, the file system, processes, the network; logic never calls an effect directly.

| Why | Tags |
|---|---|
| everything else receives the effect through its port, so a test replaces it without touching the code. | [testing] |

### root-alone-reads-the-environment · MUST
Only the composition root — or the configuration provider a block below names — and the entry files read the environment; a spec may read it to drive the program.

| Why | Tags |
|---|---|
| no module depends on the process’s environment through a read no signature shows. | [security] |

### root-builds-every-stateful-client · MUST
A stateful client — a cache, a store, a connection — is built by the composition root and handed in, never created at a module’s top level.

| Why | Tags |
|---|---|
| a client built at import time is shared by every test and cannot be replaced. | [] |

### root-applies-the-decorators · MUST
Behaviour wrapped around an implementation is a decorator, applied by the composition root where the implementation is chosen.

| Why | Tags |
|---|---|
| the wrapped unit stays unchanged, and the root shows every wrapper beside the choice it wraps. | [] |

### root-alone-configures-logging · MUST
Logging is reached through one port — the language’s standard logging facade where it has one, a port of the program’s own where it has none — and only the composition root configures where its records go; a unit outside the domain may reach the facade without having it handed in.

| Why | Tags |
|---|---|
| sinks configured in one place decide where every record goes, and a test replaces them without touching the code. | [] |
