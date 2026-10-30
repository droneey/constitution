# Domain

> Governs the model: aggregates, entities, value objects, domain services and events, contexts.

## The vocabulary

- **Ubiquitous language.** Names match the business, mirrored from the people who own it and kept in the project's glossary.
- **Bounded context.** A feature is one: one word may mean different things in two features. The **shared kernel** holds what two or more contexts share with one meaning: the part of the model they use alike, and the ports of outside systems they ask in the same words.
- *Entity.* A business type with identity, which lives through changes. A *value object* is a small immutable value that guards an invariant and is compared by its data.
- *Aggregate.* Entities and values changed as one, one boundary of consistency; its **aggregate root** is the entity through which alone it changes. A *factory* builds a valid aggregate: its `create`, or, when building needs several aggregates or values, a domain service that calls that `create`; its `restore` rebuilds one read back from storage.
- **Domain service.** A rule or a computation of the domain that no one entity or aggregate owns: stateless and pure.
- **Domain event.** What happened, in the past tense and the domain's words, yielded by the transition that decided it.
- *Repository.* The port through which a use case loads an aggregate, or an entity read on its own, and saves an aggregate, in the model's words.
- **Anti-corruption layer.** An adapter that translates another model — an outside system's or another feature's — into this context's terms.

Their form is the language's.

## Where rules live

### business-rule-lives-in-the-domain · MUST

A rule that would hold with no user interface and no transport lives in the domain, even with a single consumer; any other lives in the layer that owns its interface or transport.

| Why |
|---|
| the business is the reason such a rule changes, not its caller. |

### aggregate-rule-lives-in-its-module · SHOULD

What concerns one aggregate or one entity alone — a predicate, a derived value, a transition — lives in its module, in the form its language's block names, and is never repeated in a use case, a binding unit or a delivery unit.

| Why |
|---|
| a rule about one aggregate written once beside it is changed once, and a copy in a use case is skipped by the next use case. |

### business-value-lives-in-the-domain · MUST

A business value with an invariant — an email address, an amount in its currency, a percentage — is a value object of the domain, or of the kernel when features share it, never a mechanism of a boundary.

| Why |
|---|
| the invariant has one home, in the layer that owns its meaning. |

### value-object-checks-what-the-domain-relies-on · SHOULD

A value object checks the invariants the domain relies on and no more; a stricter check an interface asks for — a required field, a format hint, a stricter pattern — is the interface's own, and composes the value object's check instead of restating it.

| Why |
|---|
| the domain's check then changes only when the domain's needs do, and an interface's wishes never refuse a value the domain would accept through another door. |

## Aggregates

### aggregate-changed-only-by-its-transitions · MUST

An aggregate changes only through its root's transitions. Each transition, declared in the aggregate's own module, checks its precondition — the move the business allows from the current state — and returns a new state that keeps every invariant. No code outside that module builds the aggregate, a changed copy of it or one of its inner entities, save through its `create`, which checks the creation's precondition and yields its event, or its `restore`, which rebuilds one already stored — checking its invariants, no precondition, and yielding no event — for the adapter that reads it, a stored one that breaks an invariant failing as corrupt data, never as a refused move; no write repository exists for an inner entity.

| Why |
|---|
| a value checked only when it is first built is valid only until the first change made elsewhere, and a precondition a caller checks is skipped by the next caller. |

### independent-entity-is-its-own-aggregate · SHOULD

An entity with a life of its own — created, changed or removed apart from its parent — is an aggregate of its own, which others reference by identifier. An invariant that must hold in one transaction across several aggregates is the sign their boundary is drawn wrong.

| Why |
|---|
| an aggregate that holds what changes apart locks it on every change, and two people editing unrelated things collide; one split where an invariant spans it lets each part change into a state the two together forbid. |

### transition-yields-its-event · SHOULD

A transition the business announces returns the domain event it decided beside the new state; a use case publishes the events its model yielded and makes none of its own.

| Why |
|---|
| the event is a fact of the decision, so the code that decides is the one that can name it truly, and a use case that writes events can announce what never happened. |

## Domain services

### domain-service-holds-a-rule-of-several · MUST

A decision or computation that reads several aggregates is a domain service: a pure function the domain declares, which takes the aggregates and values it decides on and never a port.

| Why |
|---|
| a rule of several aggregates written in a use case is copied by every use case that needs it, and one written into one of the aggregates makes it know the others. |

## Contexts

### feature-cut-where-the-language-changes · SHOULD

A feature is cut where the business's language and model change — one meaning per word, one model — never per delivery unit, kind of stored record or entity; two features that must share a model to say what they do are one feature.

| Why |
|---|
| a context cut finer than its model duplicates that model and translates between its copies on every call. |
