# Domain

> Governs the domain model: its language and the features it is cut into, its aggregates and their transitions, its value objects, domain services and events, and where a rule of the business lives.

## The vocabulary

The domain model speaks the **ubiquitous language**{#ubiquitous-language}: the business's own words, taken from the people who own it and kept in the project's glossary. Each feature is a bounded context, as domain-driven design names it: one domain model in which a word has one meaning, though another feature may give it another. What two or more features use with one meaning is their shared kernel, the part of the domain model they use alike. A **subdomain** is a part of what the business does, classed by what it is to the business: the **core domain** is what sets the product apart, a supporting subdomain serves it, and a generic subdomain solves what many products solve alike; each feature serves a subdomain.

The domain model is made of entities — things with an identity that live through their changes, the same entity whatever their other data — and of value objects, small immutable values with no identity of their own, compared by their data, most of which guard an invariant. An **aggregate**{#aggregate} is entities and value objects changed as one, one boundary of consistency, and its **aggregate root**{#aggregate-root} is the entity through which alone it changes. An aggregate transition is a function that returns a state of an aggregate as a new value: its starting transition, which builds a new aggregate; its rebuild from storage, which restores one already stored; and each move the business allows from the stage the aggregate is in. Each language's block gives their form. A domain service is a rule or a computation of the domain that no one aggregate, entity or value object owns: a pure function of the aggregates and values it decides on. A **domain event**{#domain-event} is what happened, in the past tense and the domain's words, yielded by the transition that decided it.

The predicates and derived values of an aggregate, an entity or a value object answer about its state and change nothing. Their form is the language's.

## Where rules live

### business-rule-lives-in-the-domain · MUST

A rule of the business lives in the domain model. Such a rule would hold with no interface, no transport and no store, and stays there even with a single consumer; a rule of an interface or a transport lives in the presentation or the adapter that owns that interface or transport.

| Why |
|---|
| a rule of the business kept at a caller changes for that caller's reasons and is skipped by the next caller, so the business holds through one door and not through another, and a rule of an interface or a transport moved into the domain model ties it to a caller it should not know. |

### rule-of-one-thing-lives-beside-its-data · MUST

A predicate or a derived value of one aggregate, entity or value object, or an operation of one value object, is written once, beside its data. It is a side-effect-free function of that thing alone — the sum of two amounts is an operation of a value object —, kept in the form its language's block names and written nowhere else; an aggregate's transitions sit apart from its data, in `transitions/`.

| Why |
|---|
| a rule about one thing written once beside it is changed once and proven once, while a copy kept at a caller is copied with its mistakes and skipped by the next caller — information expert. |

### business-value-lives-in-the-domain · MUST

A business value with an invariant is a value object of the domain, never a mechanism of the presentation or of an adapter. Such values include an email address, an amount in its currency and a percentage.

| Why |
|---|
| an invariant checked by a mechanism of the presentation or of an adapter is skipped by every other door into the program, and a value that breaks it reaches the business rules. |

### value-object-checks-what-the-domain-relies-on · MUST

A value object checks the invariants the domain's rules rely on and no more. The domain relies on an invariant when a rule of the domain model would compute a wrong answer without it; a stricter check an interface asks for — a required field, a format hint, a stricter pattern — is the interface's own, and composes the value object's check instead of restating it.

| Why |
|---|
| a value object that checks what one interface wants refuses, through every other door, a value the domain would accept, and changes whenever that interface's wishes do. |

## Aggregates

### aggregate-changed-only-by-its-transitions · MUST

Every state an aggregate takes is one its transitions checked. Each transition checks its precondition — the move the business allows from the stage it starts from — and returns, as a new value in the form its language's block gives it, a state that keeps every invariant. Its starting transition checks the creation's precondition; its rebuild from storage checks the invariants of one already stored but no precondition and yields no event, and a stored one that breaks an invariant fails as corrupt data, never as a refused move. No other code builds the aggregate, a changed copy of it or one of its inner entities, or changes one in place.

| Why |
|---|
| a value checked only when it is first built is valid only until the first change made elsewhere, and a precondition a caller checks is skipped by the next caller — the aggregate pattern. |

### aggregate-bounded-by-its-true-invariants · MUST

An aggregate holds its root and only what a true invariant binds to it in one transaction. An entity with a life of its own — created, changed or removed apart from its parent — is an aggregate of its own, and data kept together only to navigate, show or load it at once is no part of the aggregate but what a query returns. Aggregates that one invariant binds in a transaction stay apart only while each is created, changed and removed on its own; otherwise they are one aggregate. Being created together binds nothing.

| Why |
|---|
| an aggregate that holds what changes apart locks it on every change, and two people editing unrelated things collide, while one split where an invariant spans it lets each part change into a state the two together forbid — model true invariants in consistency boundaries, and design small aggregates. |

### aggregate-references-another-by-identifier · MUST

An aggregate holds another aggregate only by its identifier, never as a copy of its state or a reference to it. A rule that needs both is decided by a transition or a domain service that receives the other as input.

| Why |
|---|
| a copy of another aggregate held inside one goes stale at the other's next change and tempts a transaction to change both where no invariant asks it, while an identifier keeps each its own boundary of consistency — reference other aggregates by identity. |

### transition-yields-its-event · MUST

A transition whose move the business announces returns the domain event it decided beside the state it reaches. The event is declared beside the transition. No other code, a use case among them, makes a domain event.

| Why |
|---|
| an event made apart from the transition that decided it can announce what the transition never decided, or miss what it did — the domain event pattern. |

## Domain services

### domain-service-holds-a-rule-of-several · MUST

A rule no one aggregate, entity or value object owns is a domain service. Its main case is a decision or a computation that reads several aggregates; it is a pure function the domain declares, which takes the aggregates and values it decides on and never a port, and one that builds an aggregate from several others calls that aggregate's starting transition.

| Why |
|---|
| a rule of several aggregates written in a use case is copied by every use case that needs it, and one written into one of the aggregates makes it know the others. A service that asks a port mixes the decision with the effect, so its decision is proven only through a fake of the port, while one handed what it decides on is proven on plain values — the domain service pattern, and a functional core in an imperative shell. |

## Features

### feature-cut-where-the-language-changes · MUST

A feature is cut where the business's language and its domain model change. Inside it each word has one meaning, and it holds one domain model, never cut per interface, kind of stored record or entity; two features that must share a domain model to say what they do are one feature.

| Why |
|---|
| a feature cut finer than its domain model duplicates that model and translates between its copies on every call, and one that spans two languages gives a word two meanings inside it, which every reader of the feature must tell apart — bounded context. |

### feature-classed-by-its-subdomain · MUST

Each feature is classed by the subdomain it serves. Its subdomain is the core domain, a supporting subdomain or a generic one, and `PROJECT.md` names the core domain and, for each feature, the subdomain it serves and its class. A feature of a generic subdomain models only what no library or outside service it can take already does, and keeps no term of the core domain.

| Why |
|---|
| modelling effort spent evenly is spent mostly where the business gains least, and a generic feature that carries the core domain's terms can no longer be replaced by what others already built — the distillation of the core domain. |
