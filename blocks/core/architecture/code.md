# Code

## Units

### deep-modules-no-pass-through → module-hides-much-behind-small-public-entry
A layer that only passes a call through to the next one is removed. A domain use-case exists only when its operation carries business logic; without any, its binding unit calls the port directly.

| Why | Tags |
|---|---|
| a pass-through adds a place to read and change without hiding anything. | [] |

## Diagnostics

### diagnostics-through-the-logging-port → diagnostics-through-the-logging-facade
The logging facade, or the program's own logger where the language has none, is the program's logging port, and only `root/` configures its sinks. The domain, its use-cases included, logs nothing: it returns a result or an error, or emits an event, and a binding unit of `app/` or the delivery layer logs what happened.

| Why | Tags |
|---|---|
| sinks configured in one place decide where every record goes, and a test replaces them without touching the code; a domain that logs would decide what is worth telling an operator, which is the caller's to know. | [] |

## Absence

### wire-absence-mapped-at-boundary → absence-has-one-value
Other spellings of absence live only in wire types and in the adapters that read them, which map them to the one internal value at the boundary.

| Why | Tags |
|---|---|
| a wire spelling that travels inward brings a second absence into code that checks for one. | [] |

## Failure

### typed-failures-homed-by-layer → expected-failures-typed-with-codes
Universal failures live in `kernel/errors`, a feature's in its `domain/errors`, and adapters map transport failures to them; nothing raw passes a boundary.

| Why | Tags |
|---|---|
| a failure declared where its contract lives is found with it, and a raw transport failure that passes the boundary couples its caller to the vendor. | [] |

## Types

### value-object-built-only-by-its-check → invariant-checked-at-construction · MUST
A business value with an invariant — an email, an amount in its currency, a percentage — is a value object of the domain, and its check lives there; a boundary — an adapter's mapper, a form, a parser — gets one only through that check, never through a mechanism of its own.

| Why | Tags |
|---|---|
| the invariant has one home, in the layer that owns its meaning, and a second way to make the value would be a second definition that drifts. | [data] |

### schema-derives-from-domain-types → domain-values-never-typed-again
A schema over a domain type or enum derives its values from it, so the edge depends on the domain and never restates it.

| Why | Tags |
|---|---|
| a schema that restates the domain drifts from it, and a stricter or looser schema locks out, or lets in, what the domain does not mean. | [] |

## Effects

### environment-read-only-by-the-root → configuration-parsed-once-at-boot
Only `root/` — or the configuration provider a lower block names — and the entry files read the environment; a spec may read it to drive the program.

| Why | Tags |
|---|---|
| the root parses the configuration where it builds the program, and no module depends on the process's environment through a read no signature shows. | [security] |

### stateful-clients-built-by-the-root → one-explicit-composition-root
A stateful client — a cache client, a store, a connection — is never created at a module's top level: it is built by the composition root and handed in.

| Why | Tags |
|---|---|
| a client built at import time is shared by every test and every render on the server, and cannot be replaced. | [] |

## Patterns and design

### decorators-applied-at-composition-root → one-explicit-composition-root
A behaviour wrapped around an implementation is a decorator, applied at the composition root where the implementation is chosen.

| Why | Tags |
|---|---|
| the wrapped unit stays unchanged, and the root shows every wrapper beside the choice it wraps. | [] |

### ports-and-use-cases-answer-or-change → function-answers-or-changes-state · MUST
A port or use-case answers a question or changes state, never both. A command may load what it changes — the entity, or the aggregate whose invariants it keeps — through its own port of the write side, and decides only on what it loaded and what its caller passed.

| Why | Tags |
|---|---|
| a read that writes cannot be retried or cached, and a command that reads beyond what it changes decides on data its caller never saw, while what it changes it must load to keep its invariants. | [] |

### command-returns-nothing → function-answers-or-changes-state
A command returns nothing. Returning the identity of what it created is strongly discouraged, and avoided wherever the caller can supply the identity: the caller makes the identifier and passes it in.

| Why | Tags |
|---|---|
| a command that returns data is half a query its caller comes to depend on; an identifier the caller makes lets it retry the command safely and read the result through a query. | [] |
