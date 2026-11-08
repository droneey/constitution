# Root

> Governs the composition root: what it assembles, that it decides nothing, what it registers, and the door its entry files take.

## Assembly

### composition-root-assembles-the-program · SHOULD

Only the composition root assembles the program. It chooses every concrete implementation, builds every adapter, use case and stateful resource — a client, a pool of connections, a cache —, wraps each implementation of a contract in the behaviour added around it and connects them, in its own files or where the program's framework block names.

| Why |
|---|
| a concrete choice made outside the root is hidden in the unit that makes it, so the program's shape cannot be read in one place nor the choice replaced — the composition root pattern. |

### adapter-built-apart-from-its-siblings · SHOULD

The composition root builds every adapter apart from the other adapters over the same client.

| Why |
|---|
| adapters built together leave the root no way to hand a port that only reads a client of its own, such as a replica's. |

### stateful-resource-released-by-the-programs-stop · MUST

Every stateful resource the composition root builds is handed to the program's stop, which releases it.

| Why |
|---|
| a resource built where nothing knows to release it leaks at the program's stop, and holds a connection or a lock the next start then waits for. |

### composition-root-decides-nothing · MUST

The composition root only assembles and decides nothing. It takes the configuration only to hand it on, and chooses between implementations by data — a table keyed by a configured value, or an entry for each configuration —, never by a branch. Every other decision lives in the unit that owns it by meaning: a mechanism of the outside world — writing to a terminal in colour or plain, the process's streams, a closed pipe — in an adapter, and the parse of the configuration in the unit that reads it.

| Why |
|---|
| the root is left out of coverage and mutation, where only the boot spec sees the program start, so a decision made there is one no case proves — Humble Object and Seemann's Pure DI. |

### unit-receives-its-dependencies-by-contract · SHOULD

Every unit receives its dependencies typed by their contracts, and a use case by its own type.

| Why |
|---|
| a dependency typed by its concrete implementation binds the unit to the choice the root exists to make, so a spec cannot hand it another — dependency injection. |

### unit-handed-its-dependencies · SHOULD

Every unit is handed its dependencies and never looks one up in a service locator. It takes them as parameters or, in a delivery or binding unit, from a typed provider the root fills, and a port of a binding unit's own concern is handed in by the root as its use cases are.

| Why |
|---|
| a dependency handed in is one a spec replaces by handing in another, while one a unit looks up hides from its signature what it needs — dependency injection. |

### container-holds-only-registrations-the-root-declares · MUST

Every container holds only the registrations the composition root declares. It finds none by scanning, by name or by convention.

| Why |
|---|
| a registration found by scanning or by name is a choice no file states, and no one place lists what the program is made of — Humble Object and Seemann's Pure DI. |

### program-uses-only-its-frameworks-container · SHOULD

Every program uses its framework's container or none. Where the framework brings none, the root connects the program by hand, with no container library.

| Why |
|---|
| a container the framework does not impose adds only indirection between the root and what it connects. |

### package-has-at-most-one-root · SHOULD

Every package holds at most one composition root, and a library package none. A program assembled by a root of its own, as one on another framework or runtime is, is a package of its own, and the entry files of several artefacts that start the one root differently belong to one package.

| Why |
|---|
| a root is one place only while a package has one; a second root splits every layer between two programs that assemble it differently. |

### code-two-programs-run-kept-in-a-package-with-no-root · SHOULD

All code two programs with roots of their own both run lives in a package with no root.

| Why |
|---|
| code kept in one of the two programs' packages ties the other to that program's root and everything it assembles. |

## Registration

### delivery-unit-registered-by-the-root · SHOULD

The composition root registers every delivery unit with its calling framework. That covers each address, handler, subscription or schedule the program answers, a subscription registered with the dispatcher included. A registration names its unit by the name its surface offers, so no unit is found by scanning the code that holds it, and none registers itself on import.

| Why |
|---|
| a unit found by scanning is answered by a framework's guess, so no one place lists what the program answers. |

### registration-hands-every-failure-to-its-framework · MUST

Every registration of a delivery unit hands its calling framework the outcome of the unit's work, a failure included. It hands it in the form the calling framework's contract receives, so that a failure reaches the interface's handler of last resort, as `failure-never-dropped-unread` asks, and never discards a result still to come.

| Why |
|---|
| a failure a registration drops past its framework's contract bypasses the handler of last resort, so a defect in a new route crashes the process or hangs its caller, while the registration reads as one that decides nothing and is copied as it is. |

### fixed-registration-holds-only-the-handoff · SHOULD

Wherever the calling framework fixes the place of registration, the root's registration there holds only the address, its parse and the handoff. Such a place is a folder or a manifest, and a guard or a loader the calling framework runs there only applies the answer its binding or interface-wide unit decided.

| Why |
|---|
| a decision kept in a registration sits where no case proves it — Humble Object. |

## Entries

### entry-file-hands-the-process-to-the-program · SHOULD

Every entry file takes from the root's surface the one function that runs the program from that entry file. It hands that function what the process gives — its arguments, its environment variables, its streams — or what the host that calls the entry file hands over, and ends with what it returns. Exempt: an entry file a framework block fixes, which keeps the form that block gives it.

| Why |
|---|
| an entry file is left out of the specs, so a decision made in it is proven by none and fails first in production — Humble Object. |
