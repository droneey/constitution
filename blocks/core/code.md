# Code

> How code is written, in any language. Each rule is stated once, by concern; the language block gives its form. Code documents itself through names and structure, and comments are the rare exception.

## Naming

The case of source file names belongs to the language block; every other file is kebab-case.

## intention-revealing-names · SHOULD
A name says what a thing is for: intention-revealing, pronounceable, searchable, with no abbreviation that is not already a term of the domain and no noise word.
**Why:** code is read far more often than written, and a name that needs a comment has failed.
**Check:** review
**Tags:** naming

## names-from-the-glossary · SHOULD
Names follow the business's own words, from the glossary of `PROJECT.md`: `cancelOrder`, not `updateRecord`. A new term goes into the glossary with the change that introduces it.
**Why:** when code and people use the same words, a request maps to the code without translation.
**Check:** review
**Tags:** naming

## one-word-per-concept · SHOULD
One concept has one word across the program, and one word names one concept: not `fetch`, `load` and `get` for the same act.
**Why:** a reader who sees two words assumes two things, and searches miss the other one.
**Check:** review
**Tags:** naming

## no-empty-names · SHOULD
No name is only an empty word — `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff`, `thing` — as a variable, a parameter or a destructured field. Generic code in `libs/` may use them for what is truly generic.
**Why:** an empty name makes the reader look up what it holds, every time.
**Check:** tool — lint
**Tags:** naming

## no-empty-verbs · SHOULD
A function is named by a concrete verb and its object, never an empty verb alone: `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set`, `update`.
**Why:** an empty verb says a function does something, never what.
**Check:** tool — lint
**Tags:** naming

## collections-plural-items-singular · SHOULD
A collection is named in the plural and one of its items in the singular, destructured names included.
**Why:** the name alone tells a list from one element, so a loop reads `for order of orders`.
**Check:** review
**Tags:** naming

## events-named-in-past-tense · SHOULD
An event is named for what happened, in the past tense: `OrderPlaced`, not `PlaceOrder`.
**Why:** an event records a fact that already happened; a command asks for one.
**Check:** review
**Tags:** naming

## domain-names-free-of-vendor-and-storage · SHOULD
A domain name names the concept, never the vendor or the storage behind it: `UserRecord`, not `UserMongoDocument`.
**Why:** a vendor in a domain name must be renamed everywhere when the vendor changes, and leaks it into code that should not know it.
**Check:** review
**Tags:** naming

## values-carry-their-unit · SHOULD
A value with a unit carries the unit in its name: `timeoutMs`, `DEFAULT_TIMEOUT_MS`, `sizeBytes`.
**Why:** a number without its unit is read in the wrong one sooner or later, and the bug looks like correct code.
**Check:** review
**Tags:** naming

## file-is-one-semantic-unit · SHOULD
A file holds one semantic unit and is named after it; unrelated exports go to their own files.
**Why:** a file's name then tells what is inside, and a change to one unit touches one file.
**Check:** review
**Tags:** naming, architecture

## booleans-read-as-predicates · SHOULD
A boolean variable, parameter or predicate starts with `is`, `has`, `can`, `should` or `did`. A domain may set the prefixes for booleans of its own kind, such as the properties of a presentational component.
**Why:** `if (isVisible)` reads as a question with a yes-or-no answer; `if (visible)` does not say which.
**Check:** tool — lint
**Tags:** naming

## Arguments

## named-arguments-past-the-first · SHOULD
Every argument past the first is named: the language's options record or keyword-only parameters. Exceptions: a signature a framework or library imposes, a symmetric binary operation whose order is its convention — a reducer, a comparator, a combiner — and a single-value transform.
**Why:** every call site describes itself, and a parameter can be added without touching callers.
**Check:** tool — lint
**Tags:** naming

## Units

## function-does-one-thing · SHOULD
A function does one thing, at one level of abstraction. If it needs a comment to mark its second part, it is two functions.
**Why:** a function that does one thing can be named, tested and reused; one that does two is none of these.
**Check:** review
**Tags:** architecture

## function-file-and-complexity-limits · MUST
A function holds at most 100 lines, a file at most 500, and a function's cognitive complexity is at most 10. A spec has no line limit. A tool enforces the limits as errors.
**Why:** past these sizes code stops fitting in a reader's head, and a limit that only warns is ignored.
**Check:** tool — lint
**Tags:** architecture

## guard-clauses-first · SHOULD
Failure paths leave first, through guard clauses, so the main path stays at the top level of indentation. A genuine hierarchy — a parser, a tree walk — is the exception.
**Why:** each level of nesting is one more condition the reader must hold while reading the line.
**Check:** review
**Tags:** architecture

## deep-modules-no-pass-through · SHOULD
A module hides much behind a small interface. A layer that only passes a call through is removed.
**Why:** a pass-through adds a place to read and change without hiding anything.
**Check:** review
**Tags:** architecture

## pure-by-default · SHOULD
A function's output depends only on its input. Effects live where the laws put them, never inside an otherwise pure helper.
**Why:** a pure function can be understood, tested and moved on its own.
**Check:** review
**Tags:** architecture

## readability-over-cleverness · SHOULD
A longer, obvious form beats a terse, obscure one.
**Why:** clever code saves its author a minute and costs every reader more.
**Check:** review
**Tags:** naming

## Comments and leftovers

## comments-explain-why · SHOULD
A comment states a constraint, a workaround or a decision the code cannot show. A comment that narrates the next line is removed.
**Why:** the code already says what it does; a narrating comment only repeats it and drifts from it.
**Check:** review
**Tags:** naming

## interface-docs-only-for-non-obvious-public-api · SHOULD
Interface documentation is written only for a public interface whose use is not obvious from its names and types.
**Why:** documentation that repeats a signature adds reading and drifts; where the use is not obvious, it saves a caller from reading the implementation.
**Check:** review
**Tags:** naming

## todo-names-its-issue · SHOULD
A to-do comment names its issue: `TODO(#<issue>)`. A to-do without one is done, filed, or removed.
**Why:** an issue has an owner and a place in the plan; a bare to-do is forgotten where it stands.
**Check:** tool — lint
**Tags:** workflow

## no-commented-out-code · MUST
Code is never commented out; it is deleted. History keeps it.
**Why:** commented-out code rots unseen, misleads readers, and version control already remembers it.
**Check:** review
**Tags:** workflow

## no-dead-code · MUST
No unused file, dependency, export, parameter, variable or branch. Code and dependencies that only tests reach are unused too. An export a surface offers is not dead code.
**Why:** dead code is read, maintained and feared by people who cannot know it does nothing.
**Check:** tool — unused
**Tags:** architecture

## no-debug-output-in-shipped-code · SHOULD
Shipped code writes no debug output and stops at no breakpoint; diagnostics go through the logging port. The output of a command-line program is its interface, not debug.
**Why:** stray output is noise to users and can leak what it prints.
**Check:** tool — lint
**Tags:** workflow, security

## suppression-states-its-reason · MUST
Silencing a check — a lint rule, a type error, a mutant, a deliberately ignored error — carries its reason beside it. A bare suppression is forbidden.
**Why:** the next reader must know whether the exception still holds, and a suppression without a reason cannot be judged.
**Check:** tool — lint
**Tags:** workflow

## Absence

## absence-has-one-value-normalised-at-boundary · MUST
Internal code spells absence with one value, which the language block names. The other spellings live only in wire types and at the boundary, which maps them to it.
**Why:** two spellings of absence make every check ask twice, and one of them is always forgotten.
**Check:** tool — lint
**Tags:** types, data

## Failure

## expected-failures-typed-with-codes · SHOULD
An expected failure is typed, carries a stable code `<MODULE>_<ENTITY>_<KIND>` and details that say what to do, and belongs to the contract that can fail. Universal failures live in `kernel/errors`, a feature's in its `domain/errors`, and adapters map transport failures to them; nothing raw passes a boundary.
**Why:** a caller that branches on a typed code keeps working when the message is reworded, and a failure that is part of the contract is handled by design.
**Check:** review
**Tags:** errors

## error-cause-preserved-logged-once · SHOULD
A mapped error keeps its cause. An error is logged once, where it is handled, never at every level it passes.
**Why:** the cause is what finds the bug; a failure logged at every level looks like several.
**Check:** review
**Tags:** errors

## one-error-handler-per-transport · SHOULD
Defects travel to the boundary. Each transport has one handler that turns a failure into what its user sees: what happened and what to do next, never a stack trace or internals. A program exits only there.
**Why:** one handler gives every failure the same shape and the same next step, and no internal detail leaks.
**Check:** review
**Tags:** errors, security, ux

## retry-only-transient-failures · SHOULD
Only a transient failure — a timeout, a dropped connection, a rate limit — is retried, with backoff and a limit.
**Why:** retrying a failure that will not change wastes time and repeats side effects.
**Check:** review
**Tags:** errors

## Requirements for implementation

What any error library a project uses must provide.

## error-kit-carries-code-cause-and-details · MUST
An error library gives every error a stable code, its cause and structured details, and a guard that recognises its errors by code.
**Why:** without these, the rules on failure above cannot be followed through the library.
**Check:** review
**Tags:** errors

## Types

## schema-derives-from-domain-types · MUST
A schema over a domain type or enum derives its values from it and is checked by type against what it produces. A subset of an enum is a named constant beside the enum, never a list typed out again.
**Why:** a schema that restates the domain drifts from it, and a stricter or looser schema locks out, or lets in, what the domain does not mean.
**Check:** tool — types
**Tags:** types

## guard-proves-every-property-it-claims · MUST
A type guard checks every property of the type it claims. A guard that checks one field and claims the whole type is a cast.
**Why:** code after the guard trusts every property, so a guard that checks one is a lie the type system repeats.
**Check:** review
**Tags:** types
**Example:**
```ts
// bad: claims a User, checks only the id
const isUser = (value: unknown): value is User =>
  typeof value === 'object' && value !== null && 'id' in value;

// good: the schema checks every property it claims
const isUser = (value: unknown): value is User => userSchema.safeParse(value).success;
```

## identifiers-branded-by-entity · SHOULD
An entity's identifier is a type of its own, branded by its entity, so an order's identifier cannot be passed where a user's is expected.
**Why:** two identifiers of one primitive type are swapped silently; a brand makes the compiler refuse it.
**Check:** tool — types
**Tags:** types

## types-live-with-their-consumer · SHOULD
A type lives beside the unit whose signature introduces it, and every other unit imports it from there. It moves to its own file when a second consumer appears, and never gets a second home through a re-export.
**Why:** one home per type means one place to change it and no copy to drift.
**Check:** review
**Tags:** types, architecture

## immutable-by-default · SHOULD
Values are immutable by default; a change makes a new value. Mutation is local and deliberate.
**Why:** a value no one can change can be shared and reasoned about without tracing who else holds it.
**Check:** review
**Tags:** types

## Effects

## effects-reached-through-ports · SHOULD
Clock, randomness, identifiers and the environment are reached through ports, never called directly from the logic.
**Why:** logic that reads the clock or draws a random number cannot be tested deterministically.
**Check:** review
**Tags:** architecture, testing

## environment-read-once-at-boot · SHOULD
One place reads the environment: `root/`, or the configuration provider a lower block names. Configuration is parsed once, at boot, into a typed value the rest of the program receives.
**Why:** a missing or malformed setting fails at start, not in the middle of a request, and no module depends on the process's environment.
**Check:** review
**Tags:** security, architecture

## Async

## async-work-awaited-or-deliberately-detached · MUST
Asynchronous work is awaited, or detached on purpose with its failure handled.
**Why:** a forgotten promise fails where nobody listens, and the program carries on as if it succeeded.
**Check:** tool — lint
**Tags:** errors

## io-has-timeout-and-cancellation · SHOULD
Every call across a process boundary has a timeout and can be cancelled.
**Why:** a call without a timeout can hang forever, and one that cannot be cancelled keeps working for a caller who left.
**Check:** review
**Tags:** errors, performance

## structured-concurrency · SHOULD
Concurrent work is started within a scope that waits for it, cancels it, and receives its failures; no task outlives the operation that started it.
**Why:** a task that outlives its scope leaks resources and reports failures to nobody.
**Check:** review
**Tags:** errors

## fast-source-updates-once-per-frame · SHOULD
A fast source — a resize, a scroll, a stream — updates state at most once per frame, folding its events in batches.
**Why:** dozens of updates a second redraw nothing the user can see and starve everything else.
**Check:** review
**Tags:** performance

## Idempotency

## operations-idempotent-by-design · SHOULD
An operation that may be repeated is idempotent: a key is minted once per intent and sent with every attempt, child identifiers are derived deterministically, and a transition to the current state does nothing.
**Why:** networks retry and users click twice; an idempotent operation turns a repeat into no change.
**Check:** test
**Tags:** data

## Patterns and design

## canonical-patterns-by-need · SHOULD
A pattern answers a present problem, and then the canonical one: strategy plus registry for vendors and kinds, factory or module object for adapters, decorator at the composition root, reducer for transitions, transition table for state machines, builder for test data.
**Why:** one known pattern per problem is recognised at a glance; an invented one, or one used in advance, must be learned and maintained.
**Check:** review
**Tags:** architecture

## inheritance-only-for-errors-and-framework-points · SHOULD
Behaviour is composed from small units. Inheritance is used only for error types and for a framework's extension points.
**Why:** inheritance couples a child to its parent's internals and resists every change the hierarchy did not foresee.
**Check:** review
**Tags:** architecture

## dry-applies-to-knowledge · SHOULD
Don't-repeat-yourself applies to knowledge, not to text that merely looks alike. Placement lifts shared code on the second consumer; an abstraction waits for the third occurrence.
**Why:** two copies of one fact drift, but two similar pieces with different reasons to change are coupled wrongly by one abstraction.
**Check:** review
**Tags:** architecture

## function-answers-or-changes-state · SHOULD
A function either answers a question or changes state, never both. A query has no side effect; a command takes its data as input and never calls a query of its own.
**Why:** a question that changes something cannot be asked twice safely, and a caller cannot tell which calls are safe.
**Check:** review
**Tags:** architecture

## talk-only-to-neighbours · SHOULD
A unit calls its own collaborators, never the collaborators of their collaborators: no chain that walks into another object's internals.
**Why:** a chain couples the caller to the whole path, so a change anywhere along it breaks the caller.
**Check:** review
**Tags:** architecture
