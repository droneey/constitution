# Code

## Naming

## domain-names-free-of-vendor-and-storage · SHOULD
A domain name names the concept, never the vendor or the storage behind it: `UserRecord`, not `UserMongoDocument`.

| Why | Check | Tags |
|---|---|---|
| a vendor in a domain name must be renamed everywhere when the vendor changes, and leaks it into code that should not know it. | review | [] |

## Units

## deep-modules-no-pass-through → module-hides-much-behind-small-public-entry
A layer that only passes a call through to the next one is removed. A domain use-case exists only when its operation carries business logic; without any, its binding unit calls the port directly.

| Why | Check | Tags |
|---|---|---|
| a pass-through adds a place to read and change without hiding anything. | review | [] |

## Comments and leftovers

## diagnostics-through-the-logging-port → side-effects-at-the-edges
Diagnostics a program keeps on purpose go through the logging port, never straight to the console or a stream. The port is the language's standard logging facade, whose sinks only `root/` configures, where the language has one, and a contract of the program's own where it has none. The domain, its use-cases included, logs nothing: it returns a result or an error, or emits an event, and a binding unit of `app/` or the delivery layer logs what happened.

| Why | Check | Tags |
|---|---|---|
| a port decides in one place where diagnostics go and what they may carry, and a test replaces it without touching the code; a facade every library already writes to is that port, so the program's records and theirs pass one pipeline, and a domain that logs would decide what is worth telling an operator, which is the caller's to know. | review | [] |

## Absence

## wire-absence-mapped-at-boundary → absence-has-one-value
Other spellings of absence live only in wire types and in the adapters that read them, which map them to the one internal value at the boundary.

| Why | Check | Tags |
|---|---|---|
| a wire spelling that travels inward brings a second absence into code that checks for one. | review | [] |

## Failure

## typed-failures-homed-by-layer → expected-failures-typed-with-codes
Universal failures live in `kernel/errors`, a feature's in its `domain/errors`, and adapters map transport failures to them; nothing raw passes a boundary.

| Why | Check | Tags |
|---|---|---|
| a failure declared where its contract lives is found with it, and a raw transport failure that passes the boundary couples its caller to the vendor. | review | [] |

## one-error-handler-per-transport → failure-shown-as-what-happened-and-what-next · MUST
Defects travel to the boundary. Each transport has one handler of last resort that turns a failure into what its user sees, and a program exits only there. A handler nested below it — a screen's error boundary — only renders a failure within its own part, in the same shape.

| Why | Check | Tags |
|---|---|---|
| one handler gives every failure the same shape and the same next step, and no internal detail leaks past it; a nested one that only renders keeps a failure to the part it broke. | review | [] |

## Types

## value-object-built-only-by-its-check → invariant-checked-at-construction · MUST
A business value with an invariant — an email, an amount in its currency, a percentage — is a value object of the domain, and its check lives there; a boundary — an adapter's mapper, a form, a parser — gets one only through that check, never through a mechanism of its own.

| Why | Check | Tags |
|---|---|---|
| the invariant has one home, in the layer that owns its meaning, and a second way to make the value would be a second definition that drifts. | review | [data] |

## schema-derives-from-domain-types → domain-values-never-typed-again
A schema over a domain type or enum derives its values from it, so the edge depends on the domain and never restates it.

| Why | Check | Tags |
|---|---|---|
| a schema that restates the domain drifts from it, and a stricter or looser schema locks out, or lets in, what the domain does not mean. | review | [] |

## Effects

## environment-read-only-by-the-root → configuration-parsed-once-at-boot
Only `root/` — or the configuration provider a lower block names — and the entry files read the environment; a spec may read it to drive the program.

| Why | Check | Tags |
|---|---|---|
| the root parses the configuration where it builds the program, and no module depends on the process's environment through a read no signature shows. | review | [security] |

## stateful-clients-built-by-the-root → one-explicit-composition-root
A stateful client — a cache client, a store, a connection — is never created at a module's top level: it is built by the composition root and handed in.

| Why | Check | Tags |
|---|---|---|
| a client built at import time is shared by every test and every render on the server, and cannot be replaced. | review | [] |

## Patterns and design

## decorators-applied-at-composition-root → one-explicit-composition-root
A behaviour wrapped around an implementation is a decorator, applied at the composition root where the implementation is chosen.

| Why | Check | Tags |
|---|---|---|
| the wrapped unit stays unchanged, and the root shows every wrapper beside the choice it wraps. | review | [] |

## ports-and-use-cases-answer-or-change → function-answers-or-changes-state · MUST
A port or use-case answers a question or changes state, never both. A command may load what it changes — the entity, or the aggregate whose invariants it keeps — through its own port of the write side, and decides only on what it loaded and what its caller passed.

| Why | Check | Tags |
|---|---|---|
| a read that writes cannot be retried or cached, and a command that reads beyond what it changes decides on data its caller never saw, while what it changes it must load to keep its invariants. | review | [] |

## command-returns-nothing → function-answers-or-changes-state
A command returns nothing. Returning the identity of what it created is strongly discouraged, and avoided wherever the caller can supply the identity: the caller makes the identifier and passes it in.

| Why | Check | Tags |
|---|---|---|
| a command that returns data is half a query its caller comes to depend on; an identifier the caller makes lets it retry the command safely and read the result through a query. | review | [] |
