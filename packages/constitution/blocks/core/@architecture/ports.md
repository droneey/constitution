# Ports

> Governs a port and the adapter that implements it, and how domain events travel through the event port.

## Vocabulary

A **port** is the contract an inner layer declares for what it needs of the world outside it, and every member of `contracts/` is one; what it reaches beyond the program is an outside system, as foundation's `names` defines it.

A **reporter port** carries what a use case reports along the way that neither its result nor its failure carries: the **progress reporter** a command's progress and report to its user or its operator, the **fault reporter** to the operator what the program goes on past: a failure an optional part contained, a step, a compensation or a reaction that is spent, and a late outcome, as the composition chapter defines these.

The **event port** is the port through which domain events are handed on, after their change, to the reactions and the programs that read them; one event port serves every feature.

The **dispatcher** is the unit of the event port's adapter module that, within the program, calls for each event every subscription registered with it for the event's kind.

A **port of a binding unit's own concern** is one a binding unit needs for what it does around the use case, whatever the business, such as the progress reporter, which shows a command's progress in its interface's way, the source of the identifier it makes for a command, and the sink of the events that record how its interface is used.

A **port callback** is a function a use case hands a port for its adapter, or the outside system behind it, to call during that call, as a handler a streaming parser calls for each record is, or a tool a language model calls while the program runs it.

An **adapter** implements one port over one outside system or, in composition, through another feature.

A port owner's adapters over one system, with what they share of it, make its **adapter module**, named after the system, or after the feature it answers a port through; they reach the system through its client.

An **edge worker** is a unit at the edge that the composition root starts and that implements no port, as a unit that hands on the events of stored changes is. Every unit at the edge that hands the program's own domain events of stored changes to their reactions is one, whatever it takes them from, such as a queue only the program reads; a use case that hands on the events of its unstored changes is none, and a consumer of the messages another program sends is no edge worker but a delivery unit, as the presentation chapter defines it.

The outside system's own shape — a response, a row, a message, a file format — is a **wire model**.

An adapter that translates another bounded context's model — an outside system's, or another feature's — into its port owner's terms is an **anti-corruption layer**{#anti-corruption-layer}.

What another program reads of a domain event is an **integration event**{#integration-event}, a wire model of its own.

## Declarations

### port-declared-by-the-layer-that-needs-it · SHOULD

Every port is declared by the inner layer that needs it, in that layer's words, and implemented by the outer one; both depend on the port. Exempt: a port of a binding unit's own concern, since no presentation declares a port, and the event port, which every feature hands its events through, both of which the kernel's `contracts/` declares.

| Why |
|---|
| a port declared by its implementation binds the business rules to that vendor or engine, so replacing it reaches into them — the dependency inversion principle. |

### port-justified-where-the-program-meets-the-outside · SHOULD

Every port to an outside system is justified alone by the place where the program meets that system. With one adapter it is complete, not premature.

| Why |
|---|
| a call to an outside system made without a port lets that system's shape into the code that makes it, so every change of that system reaches the code, whether or not a second implementation ever arrives — ports and adapters. |

### port-knows-no-vendor · MUST

Every port, with its parameters and its results, speaks only the program's own types and knows no vendor. Those are the domain model's and the kernel's types, the read models declared beside the ports that return them and values of the standard library that hold no effect; none imports a vendor, an adapter, another feature or another port's internals.

| Why |
|---|
| a port that knows a vendor ties every implementation, and the layer that declares it, to that vendor — the dependency inversion principle. |

## Port callbacks

### callback-reaches-only-what-its-use-case-reaches · MUST

Every port callback reaches only what the use case that hands it may reach, keeping to that use case's side. One an outside system calls reaches another feature's data only through a port by which its feature asks another feature.

| Why |
|---|
| a port callback that reaches past what its use case may reach opens, to whatever calls it, a door past the use case's side and the features' surfaces that no rule of the program guards, as a tool handed to a language model or a check a solver runs on each candidate would — ports and adapters. |

### callback-reads-its-features-data-through-a-read-side-port · SHOULD

Every port callback an outside system calls reads its feature's own data only through a read side's port, never a write side's. That port is its query's own or, in a command, one the command declares for its port callbacks.

| Why |
|---|
| a port of the write side answers only the facts its commands need, so a port callback that reads through one grows it an operation for every question an outside system may ask, and ties those reads to the commands' store — command–query responsibility segregation. |

## Adapters

### outside-shape-mapped-in-the-adapter · MUST

Every adapter maps its outside system's shapes to its port's, in both directions. A wire model is mapped with its spellings of absence and never travels inward; the failures cross the port as `port-failure-declared-or-a-defect` gives.

| Why |
|---|
| a vendor's shape inside the domain model turns every change of the vendor into a change of the business rules — ports and adapters, and an anti-corruption layer. |

### port-failure-declared-or-a-defect · MUST

Every failure crossing a port, a port callback's among them, is one the port declares or a defect of the program's own. No failure is of the dependency's own type.

| Why |
|---|
| a caller of a port acts on the port's failures alone, so a failure the port never declared reaches it as a case none of its callers wrote, and a vendor's failure type that passes as a defect ties every layer it crosses to that vendor — ports and adapters. |

### adapter-decides-no-rule-of-the-business · SHOULD

Every adapter carries out each call of its port and decides no rule of the business. The criterion of a read — whose records, which statuses — reaches it from the use case as parameters, and a criterion the domain model also decides on reaches it as the domain model's own value.

| Why |
|---|
| a criterion of the business written in an adapter is proven by no spec of the domain model and forgotten by the next adapter of the same port — ports and adapters. |

### adapter-module-one-per-system-and-owner · SHOULD

Every port owner has one adapter module per outside system, beside it. The adapter module holds an adapter for each of its ports that system serves and the schema, mapping and failures they share. An adapter that answers a feature's port through another feature lives in the composition module that joins them, and an edge worker in the adapter module of the system it serves.

| Why |
|---|
| an outside system's knowledge, its client, its errors and its wire shapes, spread over several adapter modules is fixed in each when the system changes, and the copies drift. |

### adapter-builds-no-client-as-its-module-loads · MUST

Every adapter's file reaches nothing outside the program as it loads: it builds no client and opens no connection.

| Why |
|---|
| an adapter that connects as it loads reaches its system in every spec and tool that imports it. |

## Events

### yielded-event-handed-on-after-its-change · MUST

Every domain event of a stored change is handed on only once the write that keeps the change commits.

| Why |
|---|
| an event handed on before its change is kept announces what may never happen — the domain event pattern. |

### unstored-changes-event-handed-on-after-its-use-case · MUST

Every domain event of an unstored change is handed on only once the use case that yielded it has made its change.

| Why |
|---|
| an event handed on while its use case is still at work announces a change that use case may yet fail to make — the domain event pattern. |

### stored-changes-events-handed-on-by-an-edge-worker · MUST

Every domain event of a stored change is handed to the event port only by an edge worker. The worker takes it from the write that kept it with the change.

| Why |
|---|
| an event the use case hands on apart from the write that kept it is lost, or announced for a change never kept, when the program stops between the two — the transactional outbox. |

### unstored-changes-events-handed-on-by-their-use-case · MUST

Every domain event of an unstored change is handed to the event port only by the use case that yielded it.

| Why |
|---|
| an event no one unit is charged with handing on reaches no reaction, or reaches each twice when two units both hand it on, and one handed on by the unit that bound the operation is lost by every other binding of it. |

### yielded-event-handed-on-at-least-once · MUST

Every domain event is handed on at least once and never dropped: the unit that hands it on stops only once every reaction to it has run, raising no failure, or holds it for its operator, as `spent-step-held-for-its-operator` gives.

| Why |
|---|
| an event dropped leaves every reaction to it undone, a saga's among them, whose next call that event was to make — the transactional outbox. |

### event-handed-on-again-only-on-a-transient-failure · MUST

Every edge worker hands an event on again only to a reaction whose failure is transient: one that lost a race or gave no answer included. It does so only within a limit of its retries, as `failure-retried-only-when-transient` gives.

| Why |
|---|
| an event handed on again after a call refusal or a defect repeats a failure no retry clears, while a reaction cut off by its program's stop before it answered has not run, and its event is still owed, and a saga's reaction raises none of its step's failures, so this retry never stacks on its saga's — the transactional outbox. |

### aggregates-events-reach-each-reaction-in-order · MUST

Every aggregate's events reach each reaction in the order its transitions yielded them. An event reaches a reaction only once every earlier event of the same aggregate has run for it, so one held for its operator holds back those after it.

| Why |
|---|
| a reaction that takes a later event first acts on a state the aggregate has already left, as a read model that shows a cancelled order as placed again or a returned book as still on loan — the transactional outbox, relayed in order. |

### event-handed-to-the-dispatcher-within-the-program · SHOULD

Within the program, the event port's adapter module hands each event, as it is, to the dispatcher. It maps to its integration event only an event that leaves the program.

| Why |
|---|
| an event sent within the program through a transport other programs read, or mapped as though it left, ties every reaction to that transport's shape and delay, and turns the domain model's own events into a contract no other program asked for. |

### integration-event-mapped-by-its-publishing-adapter · MUST

Every integration event is mapped from its domain event by the adapter that publishes it. No domain event leaves the program as it is.

| Why |
|---|
| a domain event sent as it is makes the domain model a contract other programs read, so every change of the model breaks them — a published language. |
