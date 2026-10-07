# Domain

> Governs entities, value objects, use cases, contexts.

## The vocabulary

- **Ubiquitous language.** Names match the business, mirrored from the people who own it and kept in the project's glossary.
- **A feature is a bounded context.** One word may mean different things in two features.
- **Ports and adapters.** A port names what the domain needs, in the domain's words; an adapter implements it over one outside system.
- **Entities, value objects, use cases.** Business types with identity; small values that guard an invariant; the operations that carry business rules. Their form is the language's.
- **Domain events.** A domain event records, in the past tense, what happened, in the domain's words.

## Where rules live

### business-rule-lives-in-the-domain · MUST
A rule that would hold with no user interface and no transport lives in the domain, even with a single consumer; any other lives in the layer that owns its interface or transport.

| Why | Tags |
|---|---|
| the business is the reason such a rule changes, not its caller. | [] |

### domain-logs-nothing · MUST
The domain, its use cases included, logs nothing: it returns a result or a failure, or emits an event, and a binding or delivery unit logs what happened.

| Why | Tags |
|---|---|
| a domain that logs would decide what an operator is told, which is its caller’s to know. | [] |

### entity-rule-lives-beside-the-entity · SHOULD
What concerns one entity alone — a predicate, a derived value, a transition of its state — is a pure function in that entity’s file, never a method and never repeated in a use case or a screen.

| Why | Tags |
|---|---|
| a rule about one entity written once is changed once. | [] |

### value-object-built-only-by-its-check · MUST
A business value with an invariant — an email address, an amount in its currency, a percentage — is a value object of the domain, and a boundary gets one only through its check, never through a mechanism of its own.

| Why | Tags |
|---|---|
| the invariant has one home, in the layer that owns its meaning. | [data] |

### contexts-duplicate-rather-than-share · SHOULD
Across bounded contexts duplication is the default and sharing the exception: a context that needs another’s entity keeps its own narrow view of it, such as a reference by identifier, and the shared kernel holds only what is universal and stable.

| Why | Tags |
|---|---|
| a type shared by two contexts must satisfy both, and the contexts stop being able to change apart. | [] |

## Use cases

### use-case-only-with-business-logic · SHOULD
A use case exists only when its operation carries business logic; without any, its binding unit calls the port directly.

| Why | Tags |
|---|---|
| a use case that only passes a call through adds a place to read without hiding anything. | [] |

### command-loads-through-its-write-port · SHOULD
A command loads what it changes — the entity, or the aggregate whose invariants it keeps — through its own port of the write side, and decides only on what it loaded and on its input.

| Why | Tags |
|---|---|
| what a command changes it must load to keep its invariants, and loading it through the write side keeps the command blind to the read side. | [] |

### command-returns-nothing · SHOULD
A command returns nothing; the caller makes the identifier of what the command creates and passes it in.

| Why | Tags |
|---|---|
| a command that returns data is half a query, and an identifier the caller makes lets it retry the command safely. | [] |

### query-and-command-apart · SHOULD
The read side and the write side never import each other, directly or through a surface that joins them.

| Why | Tags |
|---|---|
| reads and writes change for different reasons and scale differently. | [] |

### pipeline-stage-never-calls-a-stage · SHOULD
A stage of a pipeline never calls another stage; the use case calls them in order.

| Why | Tags |
|---|---|
| the use case then reads as the pipeline. | [] |
