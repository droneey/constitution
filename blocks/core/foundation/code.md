# Code

> How code is written, in any language. Each rule is stated once, by concern; the language block gives its form. Code documents itself through names and structure, and comments are the rare exception.

## Naming

The case of source file names belongs to the language block; every other file is kebab-case.

## intention-revealing-names · SHOULD
A name says what a thing is for: intention-revealing, pronounceable, searchable, with no abbreviation that is not already a term of the domain and no noise word.

| Why | Check | Tags |
|---|---|---|
| code is read far more often than written, and a name that needs a comment has failed. | review | [] |

## names-from-the-glossary · SHOULD
Names follow the business's own words, from the glossary of `PROJECT.md`: `cancelOrder`, not `updateRecord`. A new term goes into the glossary with the change that introduces it.

| Why | Check | Tags |
|---|---|---|
| when code and people use the same words, a request maps to the code without translation. | review | [] |

## one-word-per-concept · SHOULD
One concept has one word across the program, and one word names one concept: not `fetch`, `load` and `get` for the same act.

| Why | Check | Tags |
|---|---|---|
| a reader who sees two words assumes two things, and searches miss the other one. | review | [] |

## no-empty-names · SHOULD
No name is only an empty word — `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff`, `thing` — as a variable, a parameter or a destructured field. Generic code that knows nothing of the program may use them for what is truly generic.

| Why | Check | Tags |
|---|---|---|
| an empty name makes the reader look up what it holds, every time. | tool — lint | [] |

## no-empty-verbs · SHOULD
A function is named by a concrete verb and its object, never an empty verb alone: `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set`, `update`.

| Why | Check | Tags |
|---|---|---|
| an empty verb says a function does something, never what. | tool — lint | [] |

## collections-plural-items-singular · SHOULD
A collection is named in the plural and one of its items in the singular, destructured names included.

| Why | Check | Tags |
|---|---|---|
| the name alone tells a list from one element, so a loop reads `for order of orders`. | review | [] |

## events-named-in-past-tense · SHOULD
An event is named for what happened, in the past tense: `OrderPlaced`, not `PlaceOrder`.

| Why | Check | Tags |
|---|---|---|
| an event records a fact that already happened; a command asks for one. | review | [] |

## values-carry-their-unit · SHOULD
A value with a unit carries the unit in its name: `timeoutMs`, `DEFAULT_TIMEOUT_MS`, `sizeBytes`.

| Why | Check | Tags |
|---|---|---|
| a number without its unit is read in the wrong one sooner or later, and the bug looks like correct code. | review | [] |

## file-is-one-semantic-unit · SHOULD
A file holds one semantic unit and is named after it; unrelated exports go to their own files.

| Why | Check | Tags |
|---|---|---|
| a file's name then tells what is inside, and a change to one unit touches one file. | review | [] |

## booleans-read-as-predicates · SHOULD
A boolean variable, parameter or predicate starts with `is`, `has`, `can`, `should` or `did`. A domain may set the prefixes for booleans of its own kind, such as the properties of a presentational component.

| Why | Check | Tags |
|---|---|---|
| `if (isVisible)` reads as a question with a yes-or-no answer; `if (visible)` does not say which. | tool — lint | [] |

## Arguments

## at-most-three-positional-arguments · SHOULD
A function takes at most three positional parameters. Values that make one whole — the fields of an order, the options of a call — travel as one named object, whatever their number. A signature a framework or library imposes is exempt.

| Why | Check | Tags |
|---|---|---|
| each position is an order the caller must remember, and values that belong together are one concept; a call site of one object describes itself, and a field is added without touching callers. | tool — lint | [] |

## Units

## function-does-one-thing · SHOULD
A function does one thing, at one level of abstraction. If it needs a comment to mark its second part, it is two functions.

| Why | Check | Tags |
|---|---|---|
| a function that does one thing can be named, tested and reused; one that does two is none of these. | review | [] |

## function-file-and-complexity-limits · MUST
A function holds at most 100 lines, a file at most 500, and a function's cognitive complexity is at most 10. A spec has no line limit. A tool enforces the limits as errors.

| Why | Check | Tags |
|---|---|---|
| past these sizes code stops fitting in a reader's head, and a limit that only warns is ignored. | tool — lint | [] |

## guard-clauses-first · SHOULD
Failure paths leave first, through guard clauses, so the main path stays at the top level of indentation. A genuine hierarchy — a parser, a tree walk — is the exception.

| Why | Check | Tags |
|---|---|---|
| each level of nesting is one more condition the reader must hold while reading the line. | review | [] |

## readability-over-cleverness · SHOULD
A longer, obvious form beats a terse, obscure one.

| Why | Check | Tags |
|---|---|---|
| clever code saves its author a minute and costs every reader more. | review | [] |

## module-hides-much-behind-small-interface · SHOULD
A module hides much behind a small interface: few operations, each doing a lot a caller need not know.

| Why | Check | Tags |
|---|---|---|
| a deep module spares its callers the details it hides; a shallow one makes them learn an interface nearly as large as the work behind it. | review | [] |

## pure-by-default · SHOULD
A function's output depends only on its input, and an effect never hides inside an otherwise pure helper.

| Why | Check | Tags |
|---|---|---|
| a pure function can be understood, tested and moved on its own. | review | [] |

## Comments and leftovers

## comments-explain-why · SHOULD
A comment states a constraint, a workaround or a decision the code cannot show. A comment that narrates the next line is removed.

| Why | Check | Tags |
|---|---|---|
| the code already says what it does; a narrating comment only repeats it and drifts from it. | review | [] |

## interface-docs-only-for-non-obvious-public-api · SHOULD
Interface documentation is written only for a public interface whose use is not obvious from its names and types.

| Why | Check | Tags |
|---|---|---|
| documentation that repeats a signature adds reading and drifts; where the use is not obvious, it saves a caller from reading the implementation. | review | [] |

## todo-names-its-issue · SHOULD
A to-do comment names its issue: `TODO(#<issue>)`. A to-do without one is done, filed, or removed.

| Why | Check | Tags |
|---|---|---|
| an issue has an owner and a place in the plan; a bare to-do is forgotten where it stands. | review | [] |

## no-commented-out-code · MUST
Code is never commented out; it is deleted. History keeps it.

| Why | Check | Tags |
|---|---|---|
| commented-out code rots unseen, misleads readers, and version control already remembers it. | review | [] |

## no-dead-code · MUST
No unused file, dependency, export, parameter, variable or branch. Code and dependencies that only tests reach are unused too. An export a module offers through its public entry is not dead code.

| Why | Check | Tags |
|---|---|---|
| dead code is read, maintained and feared by people who cannot know it does nothing. | tool — unused | [] |

## suppression-states-its-reason · MUST
Silencing a check — a lint rule, a type error, a mutant, a deliberately ignored error — carries its reason beside it. A bare suppression is forbidden.

| Why | Check | Tags |
|---|---|---|
| the next reader must know whether the exception still holds, and a suppression without a reason cannot be judged. | tool — lint | [] |

## no-debug-output-in-shipped-code · SHOULD
Shipped code writes no debug output and stops at no breakpoint. The output of a command-line program is its interface, not debug.

| Why | Check | Tags |
|---|---|---|
| stray output is noise to users and can leak what it prints. | tool — lint | [security] |

## Absence

## absence-has-one-value-normalised-at-boundary · MUST
Internal code spells absence with one value, which the language block names.

| Why | Check | Tags |
|---|---|---|
| two spellings of absence make every check ask twice, and one of them is always forgotten. | tool — lint | [data] |

## Failure

## error-cause-preserved-logged-once · SHOULD
A mapped error keeps its cause. An error is logged once, where it is handled, never at every level it passes.

| Why | Check | Tags |
|---|---|---|
| the cause is what finds the bug; a failure logged at every level looks like several. | review | [errors] |

## retry-only-transient-failures · SHOULD
Only a transient failure — a timeout, a dropped connection, a rate limit — is retried, with backoff and a limit.

| Why | Check | Tags |
|---|---|---|
| retrying a failure that will not change wastes time and repeats side effects. | review | [errors] |

## expected-failures-typed-with-codes · SHOULD
An expected failure is typed, carries a stable code `<MODULE>_<ENTITY>_<KIND>` and details that say what to do, and belongs to the contract that can fail.

| Why | Check | Tags |
|---|---|---|
| a caller that branches on a typed code keeps working when the message is reworded, and a failure that is part of the contract is handled by design. | review | [errors] |

## failure-shown-as-what-happened-and-what-next · SHOULD
What a user sees of a failure says what happened and what to do next, never a stack trace or internals.

| Why | Check | Tags |
|---|---|---|
| a user can act on a next step but not on a trace, and internals shown to a user leak how the program works. | review | [errors, security, ux] |

## Requirements for implementation

What any error library a project uses must provide.

## error-kit-carries-code-cause-and-details · MUST
An error library gives every error a stable code, its cause and structured details, and a guard that recognises its errors by code.

| Why | Check | Tags |
|---|---|---|
| without these, the rules on failure above cannot be followed through the library. | review | [errors] |

## Types

## guard-proves-every-property-it-claims · MUST
A type guard checks every property of the type it claims. A guard that checks one field and claims the whole type is a cast.

| Why | Check | Tags |
|---|---|---|
| code after the guard trusts every property, so a guard that checks one is a lie the type system repeats. | review | [] |

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

| Why | Check | Tags |
|---|---|---|
| two identifiers of one primitive type are swapped silently; a brand makes the compiler refuse it. | tool — types | [] |

## domain-values-never-typed-again · MUST
A set of values the domain declares is never typed out again. A subset of an enum is a named constant beside the enum, and a schema over a domain type is checked by type against the value it produces.

| Why | Check | Tags |
|---|---|---|
| a restated set drifts from the domain, and a schema that is stricter or looser than its type locks out, or lets in, what the domain does not mean. | tool — types | [] |

## types-live-with-their-consumer · SHOULD
A type lives beside the unit whose signature introduces it, and every other unit imports it from there. It moves to its own file when a second consumer appears, and never gets a second home through a re-export.

| Why | Check | Tags |
|---|---|---|
| one home per type means one place to change it and no copy to drift. | review | [] |

## immutable-by-default · SHOULD
Values are immutable by default; a change makes a new value. Mutation is local and deliberate.

| Why | Check | Tags |
|---|---|---|
| a value no one can change can be shared and reasoned about without tracing who else holds it. | review | [] |

## Async

## async-work-awaited-or-deliberately-detached · MUST
Asynchronous work is awaited, or detached on purpose with its failure handled.

| Why | Check | Tags |
|---|---|---|
| a forgotten promise fails where nobody listens, and the program carries on as if it succeeded. | tool — lint | [errors] |

## io-has-timeout-and-cancellation · SHOULD
Every call across a process boundary has a timeout and can be cancelled.

| Why | Check | Tags |
|---|---|---|
| a call without a timeout can hang forever, and one that cannot be cancelled keeps working for a caller who left. | review | [errors, performance] |

## structured-concurrency · SHOULD
Concurrent work is started within a scope that waits for it, cancels it, and receives its failures; no task outlives the operation that started it.

| Why | Check | Tags |
|---|---|---|
| a task that outlives its scope leaks resources and reports failures to nobody. | review | [errors] |

## Idempotency

## operations-idempotent-by-design · SHOULD
An operation that may be repeated is idempotent: a key is minted once per intent and sent with every attempt, child identifiers are derived deterministically, and a transition to the current state does nothing.

| Why | Check | Tags |
|---|---|---|
| networks retry and users click twice; an idempotent operation turns a repeat into no change. | test | [data] |

## Patterns and design

## inheritance-only-for-errors-and-framework-points · SHOULD
Behaviour is composed from small units. Inheritance is used only for error types and for a framework's extension points.

| Why | Check | Tags |
|---|---|---|
| inheritance couples a child to its parent's internals and resists every change the hierarchy did not foresee. | review | [] |

## canonical-patterns-by-need · SHOULD
A pattern answers a present problem, and then the canonical one: strategy plus registry for vendors and kinds, reducer for transitions, transition table for state machines, builder for test data.

| Why | Check | Tags |
|---|---|---|
| one known pattern per problem is recognised at a glance; an invented one, or one used in advance, must be learned and maintained. | review | [] |

## dry-applies-to-knowledge · SHOULD
Don't-repeat-yourself applies to knowledge, not to text that merely looks alike. An abstraction waits for the third occurrence.

| Why | Check | Tags |
|---|---|---|
| two copies of one fact drift, but two similar pieces with different reasons to change are coupled wrongly by one abstraction. | review | [] |

## function-answers-or-changes-state · SHOULD
A function either answers a question or changes state, never both. A query has no side effect; a command takes its data as input and never calls a query of its own.

| Why | Check | Tags |
|---|---|---|
| a question that changes something cannot be asked twice safely, and a caller cannot tell which calls are safe. | review | [] |

## talk-only-to-neighbours · SHOULD
A unit calls its own collaborators, never the collaborators of their collaborators: no chain that walks into another object's internals.

| Why | Check | Tags |
|---|---|---|
| a chain couples the caller to the whole path, so a change anywhere along it breaks the caller. | review | [] |
