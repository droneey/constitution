# Root

> Governs the composition root: what it assembles, that it decides nothing, what it alone reads and configures, and the door its entries take.

## Assembly

### composition-root-assembles-the-program · MUST

Only the composition root assembles the program, and it hands every stateful resource it builds to the program's stop. It chooses every concrete implementation, builds every adapter, every use case and every stateful resource — a client, a pool of connections, a cache —, applies every decorator, and connects them, in its own files or in the place the program's framework block names; a decorator here is behaviour wrapped around an implementation of a contract, not a language's decorator syntax. The stop releases each such resource.

| Why |
|---|
| a concrete choice made outside the root is hidden in the unit that makes it, so the program's shape cannot be read in one place nor the choice replaced, and a resource built where nothing knows to release it leaks at the program's stop — the composition root pattern. |

### composition-root-decides-nothing · MUST

The composition root decides nothing. It chooses the implementations and connects them, and reads the environment only to hand on what it read; it chooses between implementations by data — a table keyed by a setting, or an entry for each configuration — never by a branch. Every other decision lives in the unit that owns it by meaning and is offered through that unit's surface: a mechanism of the outside world — writing to a terminal in colour or plain, the process's streams, a closed pipe — in an adapter, and the parse of a setting's value in the configuration provider.

| Why |
|---|
| the root is left out of coverage and mutation, where only the boot spec sees the program start, so a decision made there is one no case proves — Humble Object. |

### unit-receives-its-dependencies-by-contract · MUST

A unit receives its dependencies typed by their contracts, and a use case typed by its own type. It never builds an adapter or asks a registry for one by its contract, and receives its dependencies as parameters or, in a delivery or binding unit, from a typed scope the composition root fills. A port of a binding unit's own concern — the source of the identifier it makes for a command, a reporter of the events it reports — is handed in by the root as its use cases are.

| Why |
|---|
| a dependency handed in is one a spec replaces by handing in another, while one a unit builds or looks up binds it to the concrete choice the root exists to make — dependency injection. |

### container-holds-only-registrations-the-root-declares · MUST

A program uses no container but its framework's, which holds only the registrations the composition root declares. This holds where the program's framework block brings a container, and that container finds no registration by scanning, by name or by convention; where the framework brings none, the root connects the program by hand, with no container library.

| Why |
|---|
| a registration found by scanning or by name is a choice no file states, and a container library the framework does not impose adds only indirection. |

### package-has-at-most-one-root · MUST

A package holds at most one composition root, and a library holds none. A program that is assembled apart — on another framework or runtime, or built as an artefact of its own — is a package of its own, and what two such programs run lives in a package with no root; artefacts that start the one root in different ways are entries of one package.

| Why |
|---|
| a root is one place only while a package has one; a second root in the same tree splits every layer between two programs that assemble it differently. |

## Registration

### delivery-unit-registered-by-the-root · MUST

The composition root registers every delivery unit with its framework. That holds for each address, handler, subscription or schedule the program answers, registered by the names the surfaces of features and composition offer, and no unit is found by scanning a folder or registers itself on import. Where the framework fixes the place of its registration — a folder, a manifest —, the registration lives there, belongs to the root and holds only the address, its parsing and the handoff to the unit; a guard or a loader the framework runs there only applies the answer its binding unit decided.

| Why |
|---|
| a unit found by scanning, or one that registers itself on import, is answered by a framework's guess, so no one place lists what the program answers, and a decision kept in a registration sits where no case proves it, while the unit is proven with what it decides. |

## The environment and logging

### root-alone-reads-the-environment · MUST

Only the composition root reads the environment, through its configuration provider. The **configuration provider** is the one unit that reads the environment in its platform's form — a process's variables, the configuration served beside a bundle — and parses it by the configuration's declaration into the values the root hands on. It sits at the edge, in the top-level `infrastructure/`, and implements no port; only the root imports it, an entry file passes the environment on unread, and a spec may read the environment to drive the program.

| Why |
|---|
| a module that reads the environment depends on the process through a read no signature shows, so a spec cannot drive it without setting that process's environment. |

### root-alone-configures-logging · MUST

Only the composition root configures logging. The root alone decides where the logging facade's records go, and alone imports the library that writes them.

| Why |
|---|
| sinks configured in several places send records where no one place decides, and a test cannot replace them without touching the code that configured them. |

## Entries

### entry-file-hands-the-process-to-the-program · MUST

An entry file hands the process to the program. It takes one thing from the surface of the composition root, the function that runs the program from that entry, hands it what the process gives — its arguments, its environment, its streams — or what the host that calls the entry hands over, and ends with what it returns; an entry the program's framework block fixes keeps the form that block gives it.

| Why |
|---|
| an entry file is left out of the specs, so a decision made in it is proven by none and fails first in production, while what the program decides at its start and its end is proven in the units that own it and the function the entry runs is the one the program's boot spec starts — Humble Object. |
