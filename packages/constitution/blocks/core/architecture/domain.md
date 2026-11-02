# Domain

> Governs the domain model: its language and the features it is cut into, its aggregates and their transitions, its value objects, domain services and events, and where a rule of the business lives.

## The vocabulary

The domain model speaks the **ubiquitous language**{#ubiquitous-language}: the business's own words, taken from the people who own it and kept in the project's glossary. Each feature is a bounded context, as domain-driven design names it: one domain model in which a word has one meaning, though another feature may give it another — never a slice of one operation, as vertical slice architecture cuts one, nor a feature as feature-sliced design names one. What two or more features use with one meaning is their shared kernel, the part of the domain model they use alike. A **subdomain** is a part of what the business does, classed by what it is to the business: the **core domain** is what sets the product apart, a supporting subdomain serves it, and a generic subdomain solves what many products solve alike; each feature serves one subdomain or several.

The domain model is made of entities, as foundation's `types` defines them, and of **value objects**, small immutable values with no identity of their own, compared by their data, most of which guard an invariant. An **aggregate**{#aggregate} is entities and value objects changed as one, one boundary of consistency, and its **aggregate root**{#aggregate-root} is the entity through which alone it changes. An aggregate transition is a function that returns a state of an aggregate as a new value, with the domain event it decided where the business announces the move: its starting transition, as foundation's `names` defines it, and each move the business allows from the stage the aggregate is in, each named by the business's verb. Its rebuild from storage, as foundation's `names` defines it too, is no transition but a function beside the root's data. Each language's block gives their form. A domain service is a rule or a computation of the domain that no one aggregate, entity or value object owns: a pure function of the aggregates and values it decides on. A **domain event** is what happened, in the past tense and the domain's words, yielded by the transition that decided it.

The predicates and derived values of an aggregate, an entity or a value object answer about its state and change nothing. Their form is the language's.

## Where rules live

### business-rule-lives-in-the-domain · MUST

A rule of the business lives in the domain model. Such a rule would hold with no interface, no transport and no store, and stays there even with a single consumer; a rule of an interface or a transport lives in the presentation or the adapter that owns that interface or transport.

| Why |
|---|
| a rule of the business kept at a caller changes for that caller's reasons and is skipped by the next caller, so the business holds through one door and not through another, and a rule of an interface or a transport moved into the domain model ties it to a caller it should not know. |

### rule-of-one-thing-lives-beside-its-data · MUST

A predicate or a derived value of one aggregate, entity or value object, or an operation of one value object, is written once, beside its data. It is a side-effect-free function of that thing alone — the sum of two amounts is an operation of a value object —, kept in the form its language's block names and written nowhere else.

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

Every state an aggregate takes is one its transitions or its rebuild from storage checked. Each transition checks its precondition — the move the business allows from the stage it starts from — and returns, as a new value in the form its language's block gives it, a state that keeps every invariant. Its starting transition checks the creation's precondition; its rebuild from storage checks the invariants of one already stored but no precondition and yields no event, and a stored one that breaks an invariant fails as a defect of corrupt data, never as a refused move. A move into the stage the aggregate already stands in returns the same state and no event, unless the business names that move a refusal. No other code builds the aggregate, a changed copy of it or one of its inner entities, or changes one in place.

| Why |
|---|
| a value checked only when it is first built is valid only until the first change made elsewhere, and a precondition a caller checks is skipped by the next caller — the aggregate pattern. |

### aggregate-bounded-by-its-true-invariants · MUST

An aggregate holds its root and only what a true invariant binds to it at every change. An entity with a life of its own — created, changed or removed apart from its parent — is an aggregate of its own, and data kept together only to navigate, show or load it at once is no part of the aggregate but what a query returns. No rule of the domain relies on several aggregates being saved together: an invariant that must hold across them at once makes them one aggregate, and one that may lag is kept by a reaction to the event of the change. Being created together binds nothing.

| Why |
|---|
| an aggregate that holds what changes apart locks it on every change, and two people editing unrelated things collide, while one split where an invariant spans it lets each part change into a state the two together forbid, and an invariant left to a transaction that happens to save both breaks the first time one of them is saved alone — model true invariants in consistency boundaries, and design small aggregates. |

### aggregate-references-another-by-identifier · MUST

An aggregate holds another aggregate only by its identifier, never as a copy of its state or a reference to it. A rule that needs both is decided by a transition or a domain service that receives the other as input.

| Why |
|---|
| a copy of another aggregate held inside one goes stale at the other's next change and tempts a change of both at once where no invariant asks it, while an identifier keeps each its own boundary of consistency — reference other aggregates by identity. |

### transition-yields-its-event · MUST

A transition whose move the business announces returns the domain event it decided beside the state it reaches. The event is declared in its concept's `events/`, and no other code, a use case among them, makes a domain event.

| Why |
|---|
| an event made apart from the transition that decided it can announce what the transition never decided, or miss what it did — the domain event pattern. |

### domain-model-changed-only-through-a-use-case · MUST

The domain model changes only through a use case. Only the use cases of an aggregate's feature, and the domain services they call, call its transitions to change it; the adapters that rebuild the aggregate from storage, its repository's and a queries port's, call its rebuild alone, which changes nothing, and a spec and its fixtures call what they prove or build.

| Why |
|---|
| a change made outside a use case is neither checked against the store, saved nor announced, and the caller that made it holds a state no one else sees. |

## Domain services

### domain-service-holds-a-rule-of-several · MUST

A rule no one aggregate, entity or value object owns is a domain service. Its main case is a decision or a computation that reads several aggregates; it is a pure function the domain declares, which takes the aggregates and values it decides on and never a port, and one that builds an aggregate from several others calls that aggregate's starting transition.

| Why |
|---|
| a rule of several aggregates written in a use case is copied by every use case that needs it, and one written into one of the aggregates makes it know the others. A service that asks a port mixes the decision with the effect, so its decision is proven only through a fake of the port, while one handed what it decides on is proven on plain values — the domain service pattern, in the stricter form that takes no port, and a functional core in an imperative shell. |

## Features

### feature-cut-where-the-language-changes · MUST

A feature is cut where the business's language and its domain model change. Inside it each word has one meaning, and it holds one domain model, never cut per interface, kind of stored record or entity; two features that must share an aggregate or its rules to say what they do are one feature.

| Why |
|---|
| a feature cut finer than its domain model duplicates that model and translates between its copies on every call, and one that spans two languages gives a word two meanings inside it, which every reader of the feature must tell apart — bounded context, in the stricter form that makes each feature one. |

### feature-classed-by-its-subdomain · MUST

Each feature is classed by the most valuable subdomain it serves. It serves one subdomain or several, each the core domain, a supporting subdomain or a generic one, and `PROJECT.md` names the core domain and, for each feature, the subdomains it serves and its class; a composition module with a domain model of its own is named and classed the same way. A feature classed generic models only what no library or outside service it can take already does, and keeps no term of the core domain.

| Why |
|---|
| modelling effort spent evenly is spent mostly where the business gains least, and a generic feature that carries the core domain's terms can no longer be replaced by what others already built — the distillation of the core domain. |
