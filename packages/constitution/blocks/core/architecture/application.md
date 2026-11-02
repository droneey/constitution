# Application

> Governs the use cases: what crosses into them, what they decide, what they return, and how reads and writes are cut.

## The vocabulary

A use case is an application service: one operation the feature offers, a read or a write. A write is a command and a read a query.

A use case takes its **operation input**{#operation-input}: one value of the domain's own types — identifiers and value objects — that holds what the operation is asked to do. The **call context** is what the call carries beside it: who acts, and the call's cancellation and the time it has left. The **unvalidated input**{#unvalidated-input} is the same operation's plain values as a caller holds them, before the parse that turns them into its operation input. A **read model**{#read-model} is a shape a query returns that is no aggregate or value object of the domain. A read model may also be a projection kept apart, fed by the write side's events and rebuilt from them. A feature's **read side**{#read-side} is its queries — their use cases, what binds them to an interface, and the ports they read through, its queries ports with their read models — and its **write side**{#write-side} its commands — their use cases, what binds them, and the ports they load and save through, its repositories; a port of neither kind, as a clock or a mailer, belongs to neither side.

## Use cases

### operation-has-a-use-case · MUST

Every operation a feature offers has its use case. The use case sits in the application layer, however thin, and a read has one too: a query's use case may do no more than ask its queries port, the steps it gains later go there, and the rules it gains go to the domain model.

| Why |
|---|
| an operation with no use case is reached by each interface its own way, so a step it gains later lands in one interface and is missed by the others — the service layer pattern. |

### use-case-leaves-decisions-to-the-domain-model · MUST

A use case orchestrates and the domain model decides. Each branch on an aggregate's state or on a business value is a call into the domain model: a transition, a domain service, a predicate or a derived value. Where a rule needs a fact only a port can answer — whether a name is taken, a total over stored records, an answer of another feature —, the use case asks that port first and hands the answer to the domain model as a value. A use case branches only on whether a port found the record the operation acts on, on what its operation input names (to choose what to load or which port to ask), on who acts, and on a failure the domain model raised; it holds only the application layer's own rules — who may act, what to load, the order of the steps.

| Why |
|---|
| a rule written in a use case, or decided there on a port's answer, is skipped by the next use case that changes the same aggregate and proven only through a fake of the port, and the domain model is left holding the data while the rules live nowhere — a rich domain model. |

## Input and output

### use-case-takes-only-its-operation-input · MUST

A use case takes only its operation input, parsed by the one parse beside it, and the call context. Its operation input is made of the domain's own types, and the use case parses nothing itself: no wire model, framework request, stored record or unvalidated input reaches it. The parse of the operation's unvalidated input into its operation input sits beside the use case and is offered with it, and every binding or delivery unit reaches the use case through it. The binding or delivery unit that calls the use case hands it the call context, in its language's form.

| Why |
|---|
| a use case that parses its own input, or takes it unparsed, runs on values the domain never checked and fills its specs with malformed input, and a parse written in each binding or delivery unit (a screen, a request handler, a command, a message consumer) drifts from the others and fails each caller its own way — parse, don't validate. |

### port-call-bounded-by-its-use-cases-call · MUST

A use case's port call that crosses a process boundary is bounded by the use case's call. It is cancelled when the use case's call is, and ends within the time that call has left, in its language's form — what the call context carries handed on with each port call, or the scope that encloses every call the use case awaits.

| Why |
|---|
| a port call the use case's cancellation and deadline never reach keeps working, holding its connection and the other side's quota, for a caller who has left, and its answer reaches nobody. |

### use-case-signature-speaks-the-business · MUST

A use case's signature speaks the business. A query returns an aggregate or a value object, an enumeration among the value objects, as it is, and a read model only where its caller needs what no one aggregate holds — data joined across aggregates, a total — or where loading whole aggregates would cost too much; a use case's failures are named types of the domain, and no type of a framework, a transport or a store appears in its signature.

| Why |
|---|
| a type of a framework, a transport or a store in a use case's signature ties every caller and every spec of it to that type, so a change of framework, transport or store reaches every operation; a read model that wraps one aggregate copies its data and leaves its predicates behind, so its caller decides again what the aggregate already answers — the dependency rule, and you aren't gonna need it. |

## Reads and writes

### command-returns-nothing · MUST

A command returns nothing. It returns no value, or fails with its expected failure, in its language's form; a command that starts something takes the identifier of what it starts from its caller, who makes it. Where an outside system mints its own identifier for what the command starts, the caller still passes one of its own. The port to that system reports the outside identifier as the outcome of the change it makes, and the use case saves it beside the caller's through the aggregate's repository, for a query to read. A follow-up the user needs at once, such as the address of a payment page, is saved the same way.

| Why |
|---|
| a command that returns data is half a query, and an identifier the caller makes lets it retry the command safely and find what the command started even when the answer to the first attempt was lost — command–query separation. |
