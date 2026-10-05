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

## diagnostics-through-the-logging-port → no-debug-output-in-shipped-code
Diagnostics a program keeps on purpose go through the logging port, never straight to the console or a stream.

| Why | Check | Tags |
|---|---|---|
| a port decides in one place where diagnostics go and what they may carry, and a test replaces it without touching the code. | review | [] |

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

## one-error-handler-per-transport → failure-shown-as-what-happened-and-what-next
Defects travel to the boundary. Each transport has one handler that turns a failure into what its user sees, and a program exits only there.

| Why | Check | Tags |
|---|---|---|
| one handler gives every failure the same shape and the same next step, and no internal detail leaks past it. | review | [] |

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

## environment-read-once-at-boot · MUST
Only `root/` — or the configuration provider a lower block names — and the entry files read the environment; a spec may read it to drive the program. Configuration is parsed once, at boot, into a typed value the rest of the program receives.

| Why | Check | Tags |
|---|---|---|
| a missing or malformed setting fails at start, not in the middle of a request, and no module depends on the process's environment through a read no signature shows. | review | [security] |

## stateful-clients-built-by-the-root → one-explicit-composition-root
A stateful client — a cache client, a store, a connection — is never created at a module's top level.

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
A port or use-case answers a question or changes state, never both, without exception.

| Why | Check | Tags |
|---|---|---|
| a read that writes cannot be retried or cached, and a command that reads decides on data its caller never saw. | review | [] |
