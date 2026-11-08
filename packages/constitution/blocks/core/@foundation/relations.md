# Relations

> Governs how a unit is built, holds state, and depends on, calls or extends another.

## Vocabulary

A **unit** is a class, a module or a package that others call or import.

A **package** is the unit a manifest declares and ships.

A **contract** is what a unit's callers may rely on, its operations and their promises, apart from any implementation of it.

A set is **open** when its members share one contract and the program treats them alike, such as vendors, subcommands or formats, and **closed** when the program's logic decides on each member apart, such as stages or outcomes; a set with one member is not yet open.

A unit's **stability** is the share of the dependency links touching it that point into it; a unit that depends on no other is fully stable.

A pipeline's **runner** is the one function that runs its steps.

## Modules

### unit-answers-to-one-stakeholder-group · SHOULD

Every class or module answers to one stakeholder group. A stakeholder group is a group of people whose needs change a unit.

| Why |
|---|
| a unit that serves two stakeholder groups changes for both, and a change for one breaks the other — the single-responsibility principle. |

### module-is-deep · SHOULD

Every module offers little and hides much: few operations, each doing much its callers need not know.

| Why |
|---|
| a shallow module makes its callers learn nearly as much as the work behind it — information hiding. |

### module-imports-form-no-cycle · MUST

All files and modules import one another in one direction, forming no cycle, direct or through a chain.

| Why |
|---|
| a cycle ties two modules into one unit that can be neither tested nor changed apart — the acyclic dependencies principle. |

### dependency-points-toward-stability · SHOULD

Every unit depends only on units no less stable than itself.

| Why |
|---|
| a unit others rely on that depends on one with less reason to stay put changes whenever that one does, and carries the change to all of them — the stable dependencies principle. |

### unit-talks-only-to-its-neighbours · SHOULD

Every unit calls only its neighbours, never theirs. A unit's neighbours are the units it holds, creates, is handed or imports. No chain walks into another unit's internals. Exempt: walking plain, immutable data.

| Why |
|---|
| a chain couples the caller to the whole path, so a change anywhere along it breaks the caller — the law of Demeter. |

## Contracts

### contract-shaped-by-its-callers-role · SHOULD

Every contract offers what one role of caller needs, never the whole of what an implementation can do. Roles include reading, writing and notifying, and the callers of one role share its contract, even when each calls only part of it.

| Why |
|---|
| a contract wider than its role couples every caller to operations it never uses, and one cut per caller multiplies contracts that change together — the interface segregation principle. |

### implementation-keeps-the-whole-contract · MUST

Every implementation of a contract keeps all of it. No operation of it refuses as unsupported, requires more or promises less than the contract says.

| Why |
|---|
| a caller written against the contract breaks on the first call that reaches an implementation keeping less of it — the Liskov substitution principle. |

## Deprecation

### deprecated-form-never-used · MUST

All new code uses only forms nothing marks deprecated. It calls nothing a dependency or the program marks deprecated, and uses no form deprecated in favour of another.

| Why |
|---|
| new code on a deprecated form breaks when a later release removes it, and two spellings of one thing double what a reader has to know. |

### retired-code-marked-deprecated · SHOULD

All code kept only for its old callers is marked deprecated where it is declared.

| Why |
|---|
| code kept for old callers without the mark draws new ones, who build on what is meant to go. |

### deprecation-names-its-replacement · SHOULD

Every deprecation mark names what replaces the code it marks.

| Why |
|---|
| a mark that names no replacement tells a caller to leave and not where to go, so the caller stays and finds no way off it. |

## Construction and state

### unit-usable-once-built · SHOULD

Every unit is ready to use once its constructor or factory returns, never waiting for a further call to set it up.

| Why |
|---|
| a unit that needs a call after it is built fails for the first caller who does not make it, at run time and far from the step it missed. |

### ordered-steps-held-by-their-types · SHOULD

Where steps run in a required order, each step returns what the next one takes, so the types hold the order. No caller has to know it.

| Why |
|---|
| an order of calls only the documentation states fails for the first caller who does not know it, at run time and far from the step it missed. |

### state-never-global-and-mutable · MUST

All state that changes lives in values the program creates and passes in, never at module, static or global level. Exempt: a spec's own setup, made anew for each case, and the diagnostic handles.

| Why |
|---|
| global state couples units through an order of calls no signature shows, and leaks from one test into the next. |

## Inheritance and patterns

### behaviour-composed-not-inherited · SHOULD

Every unit shares behaviour by composing other units, never by inheriting an implementation. Exempt: a class the language or a framework requires to extend another, such as an error type or a framework's base.

| Why |
|---|
| a child that inherits an implementation breaks when its parent's internals change, and the hierarchy resists every change it did not foresee — composition over inheritance. |

### override-marked-where-declared · MUST

Every method that overrides one of its base is marked as an override where it is declared. Wherever the language has an override mark, it is that mark. Exempt: a constructor, and a method of the language's root type that the language calls to build or extend a class.

| Why |
|---|
| without the mark, a new method that overrides one by accident changes behaviour silently instead of failing the check. |

### pattern-chosen-by-problem · SHOULD

Every problem that calls for a pattern takes the one known for it. Such pairs include the stages of a thing and a union of its stages with pure transition functions; an outside API turned into the contract the code needs and a wrapper that translates it; and a fact others react to and an event.

| Why |
|---|
| an invented pattern is learned and kept by every reader, where the known one for its problem is recognised at a glance. |

### pipeline-steps-run-by-their-runner · SHOULD

Every pipeline's steps are run in order by its runner alone, and no step calls another.

| Why |
|---|
| a step that calls the next hides the pipeline's order inside its steps, so none is added, removed or tested alone — pipes and filters. |

### new-kind-added-as-a-member · SHOULD

Every new kind of an open set is added as a new member with its registration. The code that handles the other members is left as it is.

| Why |
|---|
| code edited for each new member breaks the existing members whenever one is added — the open–closed principle. |
