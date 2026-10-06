# Relations

> Governs how one unit of code depends on, calls or extends another.

## Modules

### module-is-deep · SHOULD
A module hides much behind a small public entry: few operations, each doing much its callers need not know. A unit that only forwards a call to the next one adds nothing and is removed.

| Why | Tags |
|---|---|
| a deep module spares its callers the details it hides; a shallow one makes them learn an entry nearly as large as the work behind it. | [] |

### module-imports-form-no-cycle · MUST
Modules form no import cycle, direct or through a chain of modules.

| Why | Tags |
|---|---|
| a cycle ties two modules into one unit that can be neither tested nor changed apart. | [] |

### dependency-points-toward-stability · SHOULD
A unit depends only on units that change less often than itself: rules of the business on nothing volatile, and frameworks, transports and vendors on them.

| Why | Tags |
|---|---|
| a stable unit that depends on a volatile one changes whenever the volatile one does. | [] |

## Contracts

### contract-offers-a-caller-only-what-it-calls · MUST
A contract between units offers each caller only the operations it calls: a reader sees only reads, a writer only writes.

| Why | Tags |
|---|---|
| a wide contract couples every caller to operations it never uses, and hides which caller can change what. | [] |

### implementation-keeps-the-whole-contract · SHOULD
Every implementation of a contract keeps all of it: no operation of it refuses as unsupported, accepts less, or returns more than the contract says.

| Why | Tags |
|---|---|
| a caller relies on the contract, not on the implementation behind it. | [] |

### unit-talks-only-to-its-neighbours · SHOULD
A unit calls its own collaborators, never theirs: no chain walks into another unit's internals. Walking plain, immutable data is no such chain.

| Why | Tags |
|---|---|
| a chain couples the caller to the whole path, so a change anywhere along it breaks the caller. | [] |

## Construction and state

### unit-usable-once-built · SHOULD
A unit is ready to use when its constructor or factory returns; a required order of calls is enforced by types, each step returning what the next one takes.

| Why | Tags |
|---|---|
| a hidden order of calls is a bug waiting for the first caller who does not know it. | [] |

### state-never-global-and-mutable · MUST
State that changes never lives at module, static or global level; it lives in values the program creates and passes in.

| Why | Tags |
|---|---|
| global state couples units through an order of calls no signature shows, and leaks from one test into the next. | [] |

## Inheritance and patterns

### behaviour-composed-not-inherited · SHOULD
A unit shares behaviour by composing other units, never by inheriting an implementation; a class extends another only where the language or a framework requires it, such as an error type or a framework’s base.

| Why | Tags |
|---|---|
| inheritance couples a child to its parent’s internals and resists every change the hierarchy did not foresee. | [] |

### override-marked-where-declared · MUST
A method that overrides one of its base carries the language's mark of an override where it is declared, so a mark that overrides nothing and an override without one both fail the check.

| Why | Tags |
|---|---|
| an override that stops overriding, or a new method that overrides one by accident, fails the check instead of changing behaviour silently. | [] |

### pattern-chosen-by-problem · SHOULD
A pattern answers a problem the code has now, and it is then the one this table names: several interchangeable ways to do one job — a strategy and a registry keyed by kind; the states of a thing and the moves between them — a union of states and a pure transition function, a transition table when they grow; behaviour wrapped around an implementation — a decorator, applied where the implementation is chosen; an outside interface turned into the one the code needs — an adapter; a complicated subsystem behind a few operations — a facade; steps in a fixed order — a pipeline of functions; construction that depends on configuration — a factory, called where the program is wired; a fact others react to — an event; a request to run later, retry or undo — a command object. Never a global instance, a service locator, inheritance to reuse code, or a class of unrelated helpers.

| Why | Tags |
|---|---|
| one known pattern per problem is recognised at a glance; an invented one, or one used in advance, must be learned and kept. | [] |
