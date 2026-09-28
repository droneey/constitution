# Code

## Naming

The case of source file names belongs to the language block; every other file is kebab-case.

## domain-names-free-of-vendor-and-storage · SHOULD
A domain name names the concept, never the vendor or the storage behind it: `UserRecord`, not `UserMongoDocument`.
**Why:** a vendor in a domain name must be renamed everywhere when the vendor changes, and leaks it into code that should not know it.
**Check:** review
**Tags:** naming

## Units

## deep-modules-no-pass-through · SHOULD
A layer that only passes a call through to the next one is removed. A domain use-case exists only when its operation carries business logic; without any, its binding unit calls the port directly.
**Why:** a pass-through adds a place to read and change without hiding anything.
**Check:** review
**Implements:** `module-hides-much-behind-small-interface`

## Comments and leftovers

## diagnostics-through-the-logging-port · SHOULD
Diagnostics a program keeps on purpose go through the logging port, never straight to the console or a stream.
**Why:** a port decides in one place where diagnostics go and what they may carry, and a test replaces it without touching the code.
**Check:** review
**Implements:** `no-debug-output-in-shipped-code`

## Absence

## wire-absence-mapped-at-boundary · MUST
Other spellings of absence live only in wire types and in the adapters that read them, which map them to the one internal value at the boundary.
**Why:** a wire spelling that travels inward brings a second absence into code that checks for one.
**Check:** review
**Tags:** types, data
**Implements:** `absence-has-one-value-normalised-at-boundary`

## Failure

## typed-failures-homed-by-layer · SHOULD
Universal failures live in `kernel/errors`, a feature's in its `domain/errors`, and adapters map transport failures to them; nothing raw passes a boundary.
**Why:** a failure declared where its contract lives is found with it, and a raw transport failure that passes the boundary couples its caller to the vendor.
**Check:** review
**Tags:** errors
**Implements:** `expected-failures-typed-with-codes`

## one-error-handler-per-transport · SHOULD
Defects travel to the boundary. Each transport has one handler that turns a failure into what its user sees, and a program exits only there.
**Why:** one handler gives every failure the same shape and the same next step, and no internal detail leaks past it.
**Check:** review
**Tags:** errors, security, ux
**Implements:** `failure-shown-as-what-happened-and-what-next`

## Types

## schema-derives-from-domain-types · MUST
A schema over a domain type or enum derives its values from it, so the edge depends on the domain and never restates it.
**Why:** a schema that restates the domain drifts from it, and a stricter or looser schema locks out, or lets in, what the domain does not mean.
**Check:** review
**Tags:** types
**Implements:** `domain-values-never-typed-again`

## Effects

## environment-read-once-at-boot · SHOULD
One place reads the environment: `root/`, or the configuration provider a lower block names. Configuration is parsed once, at boot, into a typed value the rest of the program receives.
**Why:** a missing or malformed setting fails at start, not in the middle of a request, and no module depends on the process's environment.
**Check:** review
**Tags:** security

## Patterns and design

## decorators-applied-at-composition-root · SHOULD
A behaviour wrapped around an implementation is a decorator, applied at the composition root where the implementation is chosen.
**Why:** the wrapped unit stays unchanged, and the root shows every wrapper beside the choice it wraps.
**Check:** review
**Implements:** `canonical-patterns-by-need`
