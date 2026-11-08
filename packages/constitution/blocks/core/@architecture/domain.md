# Domain

> Governs the domain model: its language and the features it is cut into, its aggregates and their transitions, its value objects, domain services and events, and where a rule of the business lives.

## Vocabulary

The domain model speaks the **ubiquitous language**{#ubiquitous-language}: the business's own words, taken from the people who own it and kept in the project's glossary.

Each feature is a **bounded context**, as domain-driven design names it: one domain model in which a word has one meaning, though another feature may give it another — never a slice of one operation, nor a layer of the interface.

What two or more features use with one meaning is their **shared kernel**, the part of the domain model they use alike.

A **subdomain** is a part of what the business does, classed by what it is to the business: the **core domain** is what sets the product apart, a **supporting subdomain** serves it, and a **generic subdomain** solves what many products solve alike; each feature serves one subdomain or several.

The domain model is made of entities, as foundation's types chapter defines them, and of **value objects**, small immutable values with no identity of their own, compared by their data, most of which guard an invariant.

An **aggregate**{#aggregate} is entities and value objects changed as one, one boundary of consistency.

The **aggregate root**{#aggregate-root} is the entity through which alone an aggregate changes.

An aggregate's state is the whole value it holds at one moment, and its stage the part of that state from which the business allows its aggregate moves, as foundation's types chapter defines a value's state and stage.

An **aggregate transition** is a function that returns a state of an aggregate as a new value, with the domain event it decided where the business announces the move: its starting transition, as foundation's `names` defines it, and each **aggregate move**, a move the business allows from the stage the aggregate is in, each named by the business's verb.

An aggregate transition's **precondition** is what the business requires before it: for an aggregate move, that the business allows it from the stage the aggregate stands in; for the starting transition, what the business requires of a creation. An aggregate's rebuild from storage, as foundation's `names` defines it, restores it from what the store keeps of it — its last state, or the events that led to it — and is no aggregate transition.

The **aggregate version** of an aggregate counts the aggregate transitions that changed it: its starting transition sets it to 1, and each aggregate move that changes its state raises it by one, inside the transition. The aggregate's rebuild from storage restores the aggregate version stored, and the aggregate also keeps the aggregate version it was loaded at, which no aggregate move changes: the one its rebuild restored, or 0 where its starting transition built it.

A **domain service** is a rule or a computation of the domain model that no one aggregate, entity or value object owns: a pure function of the aggregates and values it decides on.

A **domain event** is what happened, in the past tense and the domain model's words, yielded by the transition that decided it, and a reaction to it is a use case, as the composition chapter defines one. The predicates and derived values of an aggregate, an entity or a value object answer about its state and change nothing; each language's block gives the form of all of these.

## Where rules live

### business-rule-lives-in-the-domain · MUST

Every rule of the business lives in the domain model. Such a rule would hold with no interface, no transport and no store, and stays there even with a single consumer.

| Why |
|---|
| a rule of the business kept at a caller is skipped by the next caller, so the business holds through one door and not another. |

### interface-rule-lives-with-its-interface · SHOULD

Every rule of an interface or a transport lives in the presentation or the adapter that owns it. It never lives in the domain model.

| Why |
|---|
| a rule of a transport in the domain model ties the business to a caller it should not know, and changes it whenever that caller's wishes do. |

### rule-of-one-thing-lives-beside-its-data · SHOULD

Every rule of one thing is a side-effect-free function of that thing alone, written once beside its data. It is a predicate or a derived value of one aggregate, entity or value object, or an operation of one value object, such as the sum of two amounts or whether two date ranges overlap.

| Why |
|---|
| a rule about one thing written once beside it is changed and proven once, while a copy kept at a caller is copied with its mistakes and skipped by the next caller — information expert. |

### business-value-lives-in-the-domain · MUST

Every business value with an invariant is a value object of the domain model. It is never a mechanism of the presentation or of an adapter. An email address, an amount in its currency and a percentage are such values.

| Why |
|---|
| an invariant checked by a mechanism of one door is skipped by every other door into the program, and a value that breaks it reaches the business rules. |

### value-object-checks-what-the-domain-relies-on · MUST

Every value object checks the invariants the domain model's rules rely on, and no more: an invariant without which a rule of the domain model would compute a wrong answer. A stricter check an interface asks for — a required field, a format hint, a stricter pattern — is the interface's own.

| Why |
|---|
| a value object that checks what one interface wants refuses, through every other door, a value the domain model would accept, and changes whenever that interface's wishes do. |

### interface-check-composes-the-value-objects-check · SHOULD

Every stricter check an interface asks for of a value composes the value object's check and never restates it.

| Why |
|---|
| a check restated at an interface drifts from the value object's, so the interface accepts a value the domain model refuses or refuses one it accepts. |

## Aggregates

### aggregate-changed-only-by-its-transitions · MUST

Every state an aggregate takes is one its aggregate transitions or its rebuild from storage built and checked: it is built only through its starting transition or its rebuild, and changed only through its aggregate moves, each returning, as a new value, a state that keeps every invariant. No other code builds the aggregate, a changed copy of it or one of its inner entities, or changes one in place.

| Why |
|---|
| a value checked only when first built is valid only until the first change made elsewhere — the aggregate pattern. |

### transition-checks-its-precondition · MUST

Every aggregate transition checks its precondition before it returns a state: the starting transition the creation's, each aggregate move the stage it starts from.

| Why |
|---|
| a precondition a caller checks is skipped by the next caller, so a move the business forbids from the stage the aggregate stands in goes through — the aggregate pattern. |

### repeated-move-changes-nothing · MUST

Every aggregate move repeated after it took effect returns the same state and no event. A repeat is a repeated transition, as foundation's effects chapter defines one: confirming an order again, or a deposit made again under its intent's identifier, while a deposit under a new identifier is a new move. It is the form `repeated-transition-does-nothing` takes in the domain model. Exempt: a repeat a rule of the business refuses, which fails with an expected failure.

| Why |
|---|
| a move repeated by a retry that changes the state again or yields a second event turns every retry of a command into a second change, and a deposit taken for a repeat by its amount alone drops a second real one — Helland's idempotence, the idempotency key and Richardson's idempotent consumer. |

### adding-move-carries-the-identifier-of-its-intent · MUST

Every aggregate move that is an adding transition carries the identifier of its intent in its input. A deposit and a seat added to a booking are such moves.

| Why |
|---|
| an adding move told from the next by its amount alone cannot be told from its own retry, so the aggregate either takes a retried deposit twice or drops a second real one — the idempotency key. |

### aggregate-bounded-by-its-true-invariants · MUST

Every aggregate holds its root and only what a true invariant binds to it at every change. An entity with a life of its own — created, changed or removed apart from its parent — is an aggregate of its own, and data kept together only to navigate, show or load it at once is what a query returns.

| Why |
|---|
| an aggregate that holds what changes apart locks it on every change, and two people editing unrelated things collide, while one split where an invariant spans it lets its parts reach a state the two together forbid — model true invariants in consistency boundaries, and design small aggregates. |

### rule-independent-of-aggregates-saved-together · MUST

Every rule holds whether or not several aggregates are saved together. No rule relies on it: an invariant across them at once makes them one aggregate, one that may lag is kept by a reaction to the event of the change, and being created together binds nothing.

| Why |
|---|
| an invariant left to a transaction that happens to save both aggregates breaks the first time one of them is saved alone — model true invariants in consistency boundaries. |

### aggregate-references-another-by-identifier · MUST

Every aggregate holds another only by its identifier, never as a copy of its state or a reference to it. A rule that needs both is decided by a transition handed the values it needs of the other, or by a domain service, as `domain-service-holds-a-rule-of-several` gives.

| Why |
|---|
| a copy of another aggregate goes stale at the other's next change and tempts a change of both at once where no invariant asks it, while an identifier keeps each its own boundary of consistency — reference other aggregates by identity. |

### domain-model-changed-only-through-a-use-case · MUST

The domain model changes only through a use case. Only use cases, and the domain services they call, call an aggregate's transitions, and one use case may change several aggregates of its feature. Exempt: a spec and its fixtures, which call what they prove or build.

| Why |
|---|
| a change made outside a use case is neither checked against the store, saved nor announced, and the caller that made it holds a state no one else sees. |

## Events

### transition-yields-its-event · MUST

Every transition whose move the business announces returns the domain event it decided beside the state it reaches. No other code, a use case among them, makes a domain event.

| Why |
|---|
| an event made apart from the transition that decided it can announce what the transition never decided, or miss what it did — the domain event pattern. |

### domain-event-carries-the-facts-of-its-move · MUST

Every domain event carries what its readers need of the move it announces. That is its aggregate's identifier and the aggregate version its transition reached, the instant it happened and the values the move decided, so no reader loads the aggregate again to learn what happened.

| Why |
|---|
| an event that names only its aggregate sends each reader to load a state that may have changed since, so a reaction acts on what the event never announced — the domain event pattern. |

## Domain services

### domain-service-holds-a-rule-of-several · SHOULD

Every rule no one aggregate, entity or value object owns is a domain service, which the domain layer declares. Its main case is a decision or a computation over several aggregates.

| Why |
|---|
| a rule of several aggregates written in a use case is copied by every use case that needs it, and one written into one of the aggregates makes it know the others — the domain service pattern. |

### domain-service-takes-no-port · SHOULD

Every domain service decides only on the values it is handed, and takes no port.

| Why |
|---|
| a service that asks a port mixes the decision with the effect, so its decision is proven only through a fake of the port, while one handed what it decides on is proven on plain values — the domain service pattern, in its stricter form that takes no port, and a functional core in an imperative shell. |

## Features

### feature-cut-where-the-language-changes · SHOULD

Every feature is cut where the ubiquitous language and its domain model change. Inside it each word has one meaning and it holds one domain model, never cut per interface, kind of stored record or entity; two features that share an aggregate or its rules to say what they do are one feature.

| Why |
|---|
| a feature cut finer than its model duplicates the model and translates between its copies on every call, and one that spans two languages gives a word two meanings inside it — bounded context, in the stricter form that makes each feature one. |

### feature-classed-by-its-subdomain · SHOULD

Each feature is classed by the most valuable subdomain it serves: the core domain, a supporting subdomain or a generic subdomain. A composition module with a domain model of its own is classed the same way.

| Why |
|---|
| modelling effort spent evenly is spent mostly where the business gains least — the distillation of the core domain. |

### subdomain-classes-recorded-in-project-md · SHOULD

`PROJECT.md` names the core domain, and each feature's subdomains and class. A composition module with a domain model of its own is named there the same way.

| Why |
|---|
| a class kept in no file is decided again by each reader, so the effort it was to steer goes where each of them guesses — the distillation of the core domain. |

### generic-feature-models-only-what-it-cannot-take · SHOULD

Every feature classed generic models only what is its own, what no library or outside system it can take already does.

| Why |
|---|
| a generic subdomain built where one could be taken spends the effort the core domain needed — the distillation of the core domain. |

### generic-feature-keeps-no-core-term · SHOULD

Every feature classed generic keeps no term of the core domain, so that what others built can replace it.

| Why |
|---|
| a generic feature that carries the core domain's terms can no longer be replaced by what others built, and changes whenever the core domain does — the distillation of the core domain. |
