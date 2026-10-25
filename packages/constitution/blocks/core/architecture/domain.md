# Domain

> Governs entities, value objects, use cases, contexts.

## The vocabulary

- **Ubiquitous language.** Names match the business, mirrored from the people who own it and kept in the project's glossary.
- **Bounded context.** A feature is one: one word may mean different things in two features.
- **Ports and adapters.** A port names what the domain needs, in the domain's words; an adapter implements it over one outside system.
- Entities are the business types with identity; a **value object** is a small value that guards an invariant; a **use case** is an operation a feature offers, with the business rules it carries. Their form is the language's.
- **Domain event.** It records, in the past tense, what happened, in the domain's words.

## Where rules live

### business-rule-lives-in-the-domain · MUST

A rule that would hold with no user interface and no transport lives in the domain, even with a single consumer; any other lives in the layer that owns its interface or transport.

| Why |
|---|
| the business is the reason such a rule changes, not its caller. |

### domain-logs-nothing · MUST

The domain, its use cases included, logs nothing: it returns a result or a failure, or emits an event, and a binding or delivery unit logs what happened, a failure the domain handled included.

| Why |
|---|
| a domain that logs would decide what an operator is told, which is its caller’s to know. |

### entity-rule-lives-beside-the-entity · SHOULD

What concerns one entity alone — a predicate, a derived value, a transition of its state — is a pure function in that entity’s file, never a method and never repeated in a use case, a binding unit or a delivery unit.

| Why |
|---|
| data alone crosses a cache, an address and storage as it is, while a method is lost there; and a rule about one entity written once beside it is changed once. |

### business-value-lives-in-the-domain · MUST

A business value with an invariant — an email address, an amount in its currency, a percentage — is a value object of the domain, or of the kernel when features share it, never a mechanism of a boundary.

| Why |
|---|
| the invariant has one home, in the layer that owns its meaning. |

## Contexts

### feature-cut-where-the-language-changes · SHOULD

A feature is cut where the business's language and model change — one meaning per word, one model — never per delivery unit, kind of stored record or entity; two features that must share a model to say what they do are one feature.

| Why |
|---|
| a context cut finer than its model duplicates that model and translates between its copies on every call. |

### contexts-duplicate-rather-than-share · SHOULD

Across bounded contexts a model is duplicated by default and shared by exception; a fact or a rule of the business is never duplicated: a context that needs another’s entity keeps its own narrow view of it, such as a reference by identifier, and the shared kernel holds only what is universal and stable.

| Why |
|---|
| a type shared by two contexts must satisfy both, and the contexts stop being able to change apart. |

## Use cases

### operation-has-a-use-case · MUST

Every operation a feature offers, a read included, has its use case in the domain, however thin: a query's may only ask its port, and the rules it gains later go there.

| Why |
|---|
| the domain then lists everything the feature does, in the same form for every interface that offers it, and a rule added to a read reaches every interface without touching their bindings. |

### command-loads-through-its-write-port · SHOULD

A command loads what it changes — the entity, or the aggregate whose invariants it keeps — through its own port of the write side, and decides only on what it loaded and on its input.

| Why |
|---|
| what a command changes it must load to keep its invariants, and loading it through the write side keeps the command blind to the read side. |

### command-returns-nothing · SHOULD

A command returns no data — only its success or its expected failure; the caller makes the identifier of what the command creates and passes it in.

| Why |
|---|
| a command that returns data is half a query, and an identifier the caller makes lets it retry the command safely. |

### query-and-command-apart · MUST

Where a feature splits its **read side** from its **write side**, the two never import each other, directly or through a surface that joins them.

| Why |
|---|
| reads and writes change for different reasons and scale differently. |

### pipeline-stage-never-calls-a-stage · SHOULD

A stage of a pipeline never calls another stage; the use case calls them in order.

| Why |
|---|
| the use case then reads as the pipeline. |
