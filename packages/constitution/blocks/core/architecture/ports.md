# Ports

> Governs a port and the adapter that implements it.

## The vocabulary

A port is the contract an inner layer declares for what it asks of the world outside it, and every member of `contracts/` is one. A data port is one through which a use case reaches the data the program's store keeps, in the domain model's words: a repository, through which a command loads and saves an aggregate, or a **queries port**{#queries-port}, through which a query reads. The side through which the program is driven has its port in the use case's own type, with the parse of its operation input offered beside it, and the presentation's units are what drive it. An adapter implements one port over one outside system, and an owner's adapters over one system, with what they share of it, make its **adapter module**, a module of its infrastructure named after the system, or after the feature it answers a port through; they reach the system through its client. An **edge worker** is a unit at the edge that the composition root starts and that implements no port, as an outbox's relay or a queue's workers do. The outside system's own shape — a response, a row, a message, a file format — is a wire model, and an adapter that translates the model of another bounded context — an outside system's, or another feature's — into its owner's terms is an **anti-corruption layer**{#anti-corruption-layer}. What another program reads of a domain event is an **integration event**{#integration-event}, a wire model of its own that the adapter publishing it maps from the domain event.

## Declarations

### port-declared-by-the-layer-that-needs-it · MUST

A port is declared by the inner layer that needs it. It is written in that layer’s words and implemented by the outer one; both depend on the port, never the inner layer on the implementation. The one exception is a port of a binding unit's own concern — the source of the identifier it makes for a command, a reporter of the events it reports —, which the kernel's `contracts/` declares, since no presentation declares a port.

| Why |
|---|
| a port declared by its implementation binds the business rules to that vendor or engine, so replacing it reaches into them, while a port the presentation declared would sit where no adapter may import it — the dependency inversion principle. |

### port-justified-by-its-boundary · MUST

A port at the boundary with something outside the program is justified by that boundary alone. The outside may be a vendor, an engine, a transport, a format or the clock, and a port at such a boundary with one adapter is complete, not premature.

| Why |
|---|
| a boundary with the outside crossed without a port lets the outside system's shape into the code that calls it, so every change of that system reaches the code, whether or not a second implementation ever arrives — ports and adapters. |

### repository-per-aggregate-and-queries-port-for-reads · MUST

Each aggregate the program stores has one repository, which serves it through its root. A repository serves one aggregate, never an inner entity, a table or a feature: beside storing it, it answers the facts the aggregate's commands need, such as whether an email is taken, and deals in nothing else. A queries port returns aggregates, entities, value objects — enumerations among them — and read models, and never loads through a repository: an aggregate it returns, one or a bounded page of them, its adapter rebuilds through the aggregate's rebuild from storage.

| Why |
|---|
| a repository that also serves screens grows an operation for every list a screen shows and ties every command to the reads' store. A queries port that loads through a repository reaches the commands' store and its save, so the reads can no longer move to another store apart from the commands, and one that builds an aggregate past its rebuild from storage hands on a state no check saw — the repository pattern, and command–query responsibility segregation. |

### repository-stores-whole-aggregates · MUST

A repository stores whole aggregates. It loads an aggregate whole, saves it whole and removes it whole, and offers no operation that changes or removes one part of one — a field, a status, an inner entity — in the store.

| Why |
|---|
| a change the store applies to one part skips the transition that checks it, and the invariant then holds only in the code that remembered it — the repository pattern. |

### data-port-named-by-its-word · MUST

A data port's name ends in the word for its kind of port. A repository is named after its aggregate and the word **`Repository`**{#repository-suffix}, and a queries port after the aggregate it reads, or its feature where it reads several, and the word **`Queries`**{#queries-suffix}, each in the singular; each word is a default, which a language's or a framework's block respells under its id.

| Why |
|---|
| a data port named off its word hides from its reader which side it serves, and the tool that keeps a query's use case from a repository, and a command's from a queries port, by the names they import passes it unchecked. |

### port-knows-no-vendor · MUST

A port knows no vendor. That holds for its parameters and its results too: none imports a vendor, an adapter, another feature or another port’s internals, and each speaks only the domain's and the kernel's types, the read models declared beside the queries ports and the values of the standard library that hold no effect.

| Why |
|---|
| a port that knows a vendor ties every implementation, and the layer that declares it, to that vendor — the dependency inversion principle. |

## Adapters

### outside-shape-mapped-in-the-adapter · MUST

An adapter maps its outside system's shapes and failures to its port, and decides no rule of the business. A wire model is mapped in both directions, its spellings of absence included, and neither it nor a failure of the dependency's own type travels inward: a failure that crosses a port is one the port declares or a defect. The adapter carries out what its port is asked, and the criterion of a read — whose records, which statuses — reaches it from the use case and the domain model as parameters.

| Why |
|---|
| a vendor’s shape or failure inside the domain turns every change of the vendor into a change of the business rules, a caller of a port acts on the port's failures alone, and a criterion of the business written in an adapter is proven by no spec of the domain model and forgotten by the next adapter of the same port — ports and adapters, and an anti-corruption layer. |

### adapter-module-one-per-system-and-owner · MUST

An owner has one adapter module for each outside system. The module lives beside that owner, holds an adapter for each port of its owner the system serves and keeps inside it the schema, the mapping and the failures those adapters share; an adapter that answers a feature’s port through another feature lives in an adapter module of the composition module that joins the two, and an edge worker lives in the adapter module of the system it serves.

| Why |
|---|
| an outside system's knowledge (its client, its errors, its wire shapes) spread over several modules is fixed in each when the system changes, and the copies drift apart. |

### adapter-builds-no-client-as-its-module-loads · MUST

An adapter builds no client or connection as its module loads. It is built only when the composition root calls for it, apart from the other adapters over the same client, and takes the client and every other dependency it needs from the composition root as parameters.

| Why |
|---|
| an adapter that connects as its module loads reaches its outside system before the composition root chose it, in every spec and tool that imports it, and holds a client no signature names, while adapters built together over one client leave the composition root no way to hand the queries port's adapter a client of its own, such as a replica's, apart from the repository's. |
