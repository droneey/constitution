# Relations

> Governs how a unit is built, holds state, and depends on, calls or extends another.

## Modules

### module-is-deep · SHOULD

A module hides much behind a small interface: few operations, each doing much its callers need not know. A unit that only forwards a call to the next one adds nothing and is removed, save a file that only re-exports, a seam that implements one part's contract by calling another part or something outside the program, and the one door a part offers for each of its operations, through which every caller reaches it.

| Why |
|---|
| a deep module spares its callers the details it hides; a shallow one makes them learn an interface nearly as large as the work behind it — Ousterhout's deep modules. |

### module-imports-form-no-cycle · MUST

Files and modules form no import cycle, direct or through a chain.

| Why |
|---|
| a cycle ties two modules into one unit that can be neither tested nor changed apart — the acyclic dependencies principle. |

### dependency-points-toward-stability · SHOULD

A unit depends only on units that change less often than itself.

| Why |
|---|
| a stable unit that depends on a volatile one changes whenever the volatile one does — the stable dependencies principle. |

## Contracts

### contract-shaped-by-its-callers-role · MUST

A contract between units offers the operations one role of caller needs — reading, writing, notifying — never the whole of what an implementation can do; callers of one role share it, even when each calls only part of it.

| Why |
|---|
| a contract wider than its role couples every caller to operations it never uses, and one cut per caller multiplies contracts that change together — the interface segregation principle. |

### implementation-keeps-the-whole-contract · MUST

Every implementation of a contract keeps all of it: no operation of it refuses as unsupported, requires more, or promises less than the contract says.

| Why |
|---|
| a caller relies on the contract, not on the implementation behind it — the Liskov substitution principle. |

### unit-talks-only-to-its-neighbours · SHOULD

A unit calls its own collaborators, never theirs: no chain walks into another unit's internals. Walking plain, immutable data is no such chain.

| Why |
|---|
| a chain couples the caller to the whole path, so a change anywhere along it breaks the caller — the law of Demeter. |

## Deprecation

### deprecated-form-never-used · MUST

New code calls nothing a dependency or the program marks deprecated, and uses no form deprecated in favour of another.

| Why |
|---|
| a deprecated form is removed in a later release, and two spellings of one thing double what a reader must know. |

### retired-code-marked-deprecated · SHOULD

Code kept only for its old callers is marked deprecated where it is declared, naming what replaces it.

| Why |
|---|
| the mark stops new callers where they use it, and the replacement it names is the way off. |

## Construction and state

### unit-usable-once-built · SHOULD

A unit is ready to use when its constructor or factory returns; a required order of calls is enforced by types, each step returning what the next one takes.

| Why |
|---|
| a hidden order of calls is a bug waiting for the first caller who does not know it. |

### state-never-global-and-mutable · MUST

State that changes never lives at module, static or global level; it lives in values the program creates and passes in. The diagnostics facades — the language’s logging facade, or the program’s own where the language has none, and the facades of tracing and metrics a block below names — configured once at start, are the one exception. A spec's own setup, which its hooks set for each case, is no state of the program.

| Why |
|---|
| global state couples units through an order of calls no signature shows, and leaks from one test into the next. |

## Inheritance and patterns

### behaviour-composed-not-inherited · SHOULD

A unit shares behaviour by composing other units, never by inheriting an implementation; a class extends another only where the language or a framework requires it, such as an error type or a framework’s base.

| Why |
|---|
| inheritance couples a child to its parent’s internals and resists every change the hierarchy did not foresee — composition over inheritance. |

### override-marked-where-declared · MUST

A method that overrides one of its base carries the language's mark of an override where it is declared, where the language has one, so a mark that overrides nothing and an override without one both fail the check.

| Why |
|---|
| an override that stops overriding, or a new method that overrides one by accident, fails the check instead of changing behaviour silently. |

### pattern-chosen-by-problem · SHOULD

A pattern, where a problem calls for one, is the one its problem names: several interchangeable ways to do one job — a strategy, registered by kind; a complicated subsystem behind a few operations — a facade; construction that depends on configuration — a factory; a fact others react to — an event; a request to run later, retry or undo — a command object. A class of unrelated helpers is no pattern.

| Why |
|---|
| one known pattern per problem is recognised at a glance; an invented one, or one used in advance, must be learned and kept. |
