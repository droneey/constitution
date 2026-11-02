# Relations

> Governs how a unit is built, holds state, and depends on, calls or extends another.

## Modules

### unit-answers-to-one-actor · SHOULD

A class or a module answers to one actor: the one person or group whose needs change it.

| Why |
|---|
| a unit that serves two actors changes for both, and a change for one breaks the other — the single-responsibility principle. |

### module-is-deep · SHOULD

A module offers little and hides much. It offers few operations, each doing much its callers need not know. A unit that only forwards a call to the next one adds nothing and is removed, save a file that only re-exports, a seam that implements one part's contract by calling another part or something outside the program, and the one door a part offers for each of its operations, through which every caller reaches it.

| Why |
|---|
| a shallow module makes its callers learn nearly as much as the work behind it, and a unit that only forwards adds a file to read and change for nothing — information hiding. |

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

A contract between units offers what one role of caller needs, never the whole of what an implementation can do. Roles include reading, writing and notifying, and the callers of one role share its contract, even when each calls only part of it.

| Why |
|---|
| a contract wider than its role couples every caller to operations it never uses, and one cut per caller multiplies contracts that change together — the interface segregation principle. |

### implementation-keeps-the-whole-contract · MUST

Every implementation of a contract keeps all of it. No operation of it refuses as unsupported, requires more, or promises less than the contract says.

| Why |
|---|
| a caller written against the contract breaks on an implementation that keeps less of it, at the first call that reaches that implementation — the Liskov substitution principle. |

### unit-talks-only-to-its-neighbours · SHOULD

A unit calls its own collaborators, never theirs. No chain walks into another unit's internals; walking plain, immutable data is no such chain.

| Why |
|---|
| a chain couples the caller to the whole path, so a change anywhere along it breaks the caller — the law of Demeter. |

### new-kind-added-as-a-member · MUST

A new kind of an open set is added as a new member, without editing the others. The member comes with its registration, and the code that handles the other members is left as it is. A set is open when its members share one contract and the program treats them alike — vendors, subcommands, formats — and closed when the program's logic decides on each member apart — stages, outcomes; a set with one member is not yet open.

| Why |
|---|
| code that must be edited for each new member breaks the existing members whenever one is added — the open–closed principle. |

## Deprecation

### deprecated-form-never-used · MUST

New code uses nothing deprecated. It calls nothing a dependency or the program marks deprecated, and uses no form deprecated in favour of another.

| Why |
|---|
| new code on a deprecated form breaks when a later release removes it, and two spellings of one thing double what a reader must know. |

### retired-code-marked-deprecated · SHOULD

Code kept only for its old callers is marked deprecated where it is declared, naming what replaces it.

| Why |
|---|
| code kept for old callers without the mark draws new ones, who build on what is meant to go and find no way off it. |

## Construction and state

### unit-usable-once-built · SHOULD

A unit is ready to use once its constructor or factory returns. A required order of calls is enforced by types, each step returning what the next one takes.

| Why |
|---|
| a unit that needs a hidden order of calls fails for the first caller who does not know it, at run time and far from the step it missed. |

### state-never-global-and-mutable · MUST

State that changes never lives at module, static or global level. It lives in values the program creates and passes in. The diagnostics facades — the logging facade, which the effects chapter defines, and the facades of tracing and metrics a block below names — configured once at start, are the one exception. A spec's own setup, which its hooks set for each case, is no state of the program.

| Why |
|---|
| global state couples units through an order of calls no signature shows, and leaks from one test into the next. |

## Inheritance and patterns

### behaviour-composed-not-inherited · SHOULD

A unit shares behaviour by composing other units, never by inheriting an implementation. A class extends another only where the language or a framework requires it, such as an error type or a framework’s base.

| Why |
|---|
| a child that inherits an implementation breaks when its parent's internals change, and the hierarchy resists every change it did not foresee — composition over inheritance. |

### override-marked-where-declared · MUST

A method that overrides one of its base is marked as an override where it is declared. The mark is the language's, where it has one, so a mark that overrides nothing and an override without one both fail the check.

| Why |
|---|
| without the mark, an override that stops overriding, or a new method that overrides one by accident, changes behaviour silently instead of failing the check. |

### pattern-chosen-by-problem · SHOULD

A problem that calls for a pattern takes the one this table names. Several interchangeable ways to do one job: a strategy, and a registry keyed by kind. The states of a thing and the moves between them: a union of states and pure transition functions, a transition table when they grow. Behaviour wrapped around an implementation: a decorator. An outside API turned into the contract the code needs: an adapter. A complicated subsystem behind a few operations: a facade. Steps in a fixed order: a pipeline of functions. Construction that depends on configuration: a factory. A fact others react to: an event. A request kept to run later, retried or undone: a value that holds the request and its arguments. A class of unrelated helpers is no pattern.

| Why |
|---|
| an invented pattern must be learned and kept by every reader, where the known one for its problem is recognised at a glance. |

### pipeline-stages-run-by-their-owner · SHOULD

A pipeline's stages are run in order by their owner alone. The owner is the one function that runs the pipeline, and no stage calls another.

| Why |
|---|
| a stage that calls the next hides the pipeline's order inside its stages, so none is added, removed or tested alone — pipes and filters. |
