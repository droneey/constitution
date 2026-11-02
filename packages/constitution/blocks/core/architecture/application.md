# Application

> Governs the use cases: what crosses into them, what they decide, what they return, and how reads and writes are cut.

## The vocabulary

A use case is an application service: one operation the feature offers, a read or a write. A write is a command and a read a query, and "command" names nothing else here: one command of a command-line program is a subcommand.

A use case takes its **operation input**{#operation-input}: one value of the domain's own types — identifiers and value objects — that holds what the operation is asked to do. The **call context** is what the call carries beside it: who acts, and the call's cancellation and the time it has left. The **unvalidated input**{#unvalidated-input} is the same operation's plain values as a caller holds them, before the parse that turns them into its operation input. A **read model**{#read-model} is a shape a query returns that is no aggregate, entity or value object of the domain. A read model may also be a projection kept apart, fed by the write side's events and rebuilt from them. A feature's **read side**{#read-side} is its queries — their use cases, what binds them to an interface, and the ports they read through, its queries ports with their read models — and its **write side**{#write-side} its commands — their use cases, what binds them, and the ports they load and save through, its repositories; a port of neither kind, as a clock or a mailer, belongs to neither side.

## Use cases

### operation-has-a-use-case · MUST

Every operation a feature offers has its use case. The use case sits in the application layer, however thin, and a read has one too: a query's use case may do no more than ask its queries port, the steps it gains later go there, and the rules it gains go to the domain model.

| Why |
|---|
| an operation with no use case is reached by each interface its own way, so a step it gains later lands in one interface and is missed by the others — the service layer pattern. |

### use-case-leaves-decisions-to-the-domain-model · MUST

A use case orchestrates and the domain model decides. Every branch on an aggregate's state or on a business value is a call into the domain model: a transition, a domain service, a predicate or a derived value. Where a rule needs a fact only a port can answer — whether a name is taken, a total over stored records, an answer of another feature —, the use case asks that port first and hands the answer to the domain model as a value. The use case's own branches follow the operation's flow — what was found, who acts, which port to ask, the outcome a port or the domain model returned — and decide no rule of the business: a check that reads only who acts — the actor's role or rights the call context carries — is the application layer's, while one that reads the aggregate's data or a business value with the actor, as "only the owner may cancel" or "only a manager may refund past a limit", is a predicate of the domain model that takes the actor.

| Why |
|---|
| a rule written in a use case, or decided there on a port's answer, is skipped by the next use case that changes the same aggregate and proven only through a fake of the port, and the domain model is left holding the data while the rules live nowhere — a thin application service over a rich domain model, and a functional core in an imperative shell. |

## Input and output

### use-case-takes-only-its-operation-input · MUST

A use case takes only its operation input, parsed by the one parse beside it, and the call context. Its operation input is made of the domain's own types, and the use case parses nothing itself: no wire model, framework request, stored record or unvalidated input reaches it. The parse of the operation's unvalidated input into its operation input sits beside the use case and is offered with it, and every binding or delivery unit reaches the use case through it. The binding or delivery unit that calls the use case hands it the call context, in its language's form.

| Why |
|---|
| a use case that parses its own input, or takes it unparsed, runs on values the domain never checked and fills its specs with malformed input, and a parse written in each binding or delivery unit (a screen, a request handler, a subcommand, a message consumer) drifts from the others and fails each caller its own way — parse, don't validate. |

### use-case-hands-its-deadline-to-every-port-call · MUST

A use case hands its cancellation and the time it has left to every port call it makes. It hands them in its language's form — what the call context carries, passed with each port call, or a scope that encloses every call the use case awaits —, whether or not the port crosses a process boundary, which the port hides from it.

| Why |
|---|
| foundation asks that each call across a process boundary be bounded by its caller, but a use case cannot see which of its port calls cross one, so a port call it hands neither its cancellation nor its deadline keeps working behind the adapter, holding its connection and the other side's quota, for a caller who has left — deadline propagation. |

### use-case-signature-speaks-the-business · MUST

A use case's signature speaks the business. A query returns an aggregate, an entity or a value object, an enumeration among the value objects, as it is, and a read model only where its caller needs what no one aggregate or entity holds — data joined across aggregates, a total — or where the aggregates its answer needs outnumber one bounded page. No type of a framework, a transport or a store appears in its signature.

| Why |
|---|
| a type of a framework, a transport or a store in a use case's signature ties every caller and every spec of it to that type, so a change of framework, transport or store reaches every operation; a read model that wraps one aggregate copies its data and leaves its predicates behind, so its caller decides again what the aggregate already answers — the dependency rule, and you aren't gonna need it. |

### use-case-fails-with-three-kinds-of-failure · MUST

A use case fails only with an expected failure of three kinds. They are the domain's, when a rule of the business refused — a predicate of the domain model that takes the actor among them —, from an `errors/` of its domain; the application layer's, when the operation cannot proceed — what it acts on is not found, its actor may not act —, from its application's `errors/`; and one a port it asks declares, beside that port in `contracts/` or, where every port over one kind of system shares it, in the kernel's `errors/`. Any other failure passes as a defect.

| Why |
|---|
| a failure of no named kind leaves its caller unable to tell a refusal from an operation that cannot proceed or from a fault of a system it asked, so it answers each the same wrong way, and an expected failure a use case passes on from somewhere else is one none of its callers wrote a case for. |

## Reads and writes

### command-returns-nothing · MUST

A command returns nothing. It returns no value, or fails with its expected failure, in its language's form; a command that starts something takes the identifier of what it starts from its caller, who makes it. Where an outside system mints its own identifier for what the command starts, the caller still passes one of its own. The port to that system reports the outside identifier as the outcome of the change it makes, and the use case saves it beside the caller's, through the aggregate's repository where the program stores the aggregate, for a query to read. A follow-up the user needs at once, such as the address of a payment page, is saved the same way.

| Why |
|---|
| a command that returns data is half a query, and an identifier the caller makes lets it retry the command safely and find what the command started even when the answer to the first attempt was lost — command–query separation, in its strict form, which leaves no exception for what the command created. |

### read-model-declared-and-named-by-its-operation · MUST

A read model is declared and named by the operation that returns it. It is declared beside the signature that returns it — in the file of the queries port that returns it or, where no port returns it, beside the query whose result it is —, and named for that operation, never for a screen.

| Why |
|---|
| a read model declared away from the signature that returns it is looked for in another file than the one its reader opens, and one named for a screen changes with that screen and is copied for the next. |

### query-and-command-apart · MUST

The read side and the write side never import each other's code. No use case or binding unit of one side imports a file of the other side's, a query's use case takes from `contracts/` its queries ports and no repository, and a command's use case the repositories of the aggregates it loads or saves and no queries port; either may also take a port that belongs to neither side. A surface that offers both sides by name — of `contracts/`, of the use cases, of a feature — belongs to neither, and a caller takes from it only what its own side may take. A composition module's use case calls the features it composes through their surfaces and keeps to its side: a query calls only their queries, and a command their commands and the queries it needs, whose answers may lag, so a rule that must hold at the change is decided by the command of the feature that makes it.

| Why |
|---|
| a side that imports the other changes whenever the other does, and the two can no longer change, scale or be stored apart; a query that reaches a repository can save, and reads from the commands' store, and a command that reaches a queries port decides on a read that may lag — command–query responsibility segregation. |
