# Code

> How code is written, in any language. Each rule is stated once, by concern; the language block gives its form. Code documents itself through names and structure, and comments are the rare exception.

## Naming

The case of source file names belongs to the language block; every other file is kebab-case.

### intention-revealing-names · SHOULD
A name says what a thing is for: intention-revealing, pronounceable, searchable, with no abbreviation that is not already a term of the business and no noise word.

| Why | Tags |
|---|---|
| code is read far more often than written, and a name that needs a comment has failed. | [] |

### names-from-the-glossary · SHOULD
Names follow the business's own words, from the glossary of `PROJECT.md`: `cancelOrder`, not `updateRecord`. A new term goes into the glossary with the change that introduces it.

| Why | Tags |
|---|---|
| when code and people use the same words, a request maps to the code without translation. | [] |

### one-word-per-concept · SHOULD
One concept has one word across the program, and one word names one concept: not `fetch`, `load` and `get` for the same act.

| Why | Tags |
|---|---|
| a reader who sees two words assumes two things, and searches miss the other one. | [] |

### no-empty-names · SHOULD
No name is only an empty word — `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff`, `thing` — as a variable, a parameter or a destructured field. Generic code that knows nothing of the program may use them for what is truly generic.

| Why | Tags |
|---|---|
| an empty name makes the reader look up what it holds, every time. | [] |

### no-empty-verbs · SHOULD
A function is named by a concrete verb and its object, never an empty verb alone: `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set`, `update`. A name an interface the code implements imposes — a handler's `get` — is exempt.

| Why | Tags |
|---|---|
| an empty verb says a function does something, never what. | [] |

### collections-plural-items-singular · SHOULD
A collection is named in the plural and one of its items in the singular, destructured names included.

| Why | Tags |
|---|---|
| the name alone tells a list from one element, so a loop reads `for order of orders`. | [] |

### events-named-in-past-tense · SHOULD
An event is named for what happened, in the past tense: `OrderPlaced`, not `PlaceOrder`.

| Why | Tags |
|---|---|
| an event records a fact that already happened; a command asks for one. | [] |

### values-carry-their-unit · SHOULD
A value with a unit carries the unit in its name: `timeoutMs`, `DEFAULT_TIMEOUT_MS`, `sizeBytes`.

| Why | Tags |
|---|---|
| a number without its unit is read in the wrong one sooner or later, and the bug looks like correct code. | [] |

### file-is-one-semantic-unit · MUST
A file holds one semantic unit and is named after it; unrelated exports go to their own files.

| Why | Tags |
|---|---|
| a file's name then tells what is inside, and a change to one unit touches one file. | [] |

### domain-names-free-of-vendor-and-storage · SHOULD
A name of the business names its concept, never the vendor or the storage behind it: `UserRecord`, not `UserMongoDocument`.

| Why | Tags |
|---|---|
| a vendor in such a name must be renamed everywhere when the vendor changes, and leaks it into code that should not know it. | [] |

### booleans-read-as-predicates · SHOULD
A boolean variable, parameter or predicate starts with `is`, `has`, `can`, `should` or `did`. A domain block may set the prefixes for booleans of its own kind, such as the properties of a presentational component.

| Why | Tags |
|---|---|
| `if (isVisible)` reads as a question with a yes-or-no answer; `if (visible)` does not say which. | [] |

## Arguments

### parameters-at-most-three-wholes-as-one-object · SHOULD
A function takes at most three positional parameters. Values that make one whole — the fields of an order, the options of a call — travel as one named object, whatever their number. A signature a framework or library imposes is exempt.

| Why | Tags |
|---|---|
| each position is an order the caller must remember, and values that belong together are one concept; a call site of one object describes itself, and a field is added without touching callers. | [] |

### no-boolean-positional-parameter · SHOULD
A boolean is never a positional parameter: it travels as a named field of the call's object, or the function becomes two that each say what they do.

| Why | Tags |
|---|---|
| `save(user, true)` cannot be read at the call site; a named field or a function of its own says what the flag means. | [] |

### same-type-parameters-told-apart · SHOULD
Two or more parameters of one type travel as one named object, or are told apart by their types; an operation whose two operands play one role — a comparison, a comparator, a combiner — takes them in order.

| Why | Tags |
|---|---|
| two values of one type in a row are swapped silently: `transfer(fromId, toId)` compiles either way round. | [] |

## Units

### function-does-one-thing · SHOULD
A function does one thing, at one level of abstraction. If it needs a comment to mark its second part, it is two functions.

| Why | Tags |
|---|---|
| a function that does one thing can be named, tested and reused; one that does two is none of these. | [] |

### function-file-and-complexity-limits · MUST
A function holds at most 100 lines, a file at most 500, and a function's cognitive complexity is at most 10. A spec has no line limit, and a function whose body is one markup literal — a drawing kept as a component — may lift the line limit by a suppression that says so. A tool enforces the limits as errors.

| Why | Tags |
|---|---|
| past these sizes code stops fitting in a reader's head, and a limit that only warns is ignored. | [] |

### guard-clauses-first · SHOULD
Failure paths leave first, through guard clauses, so the main path stays at the top level of indentation. A genuine hierarchy — a parser, a tree walk — is the exception.

| Why | Tags |
|---|---|
| each level of nesting is one more condition the reader must hold while reading the line. | [] |

### readability-over-cleverness · SHOULD
A longer, obvious form beats a terse, obscure one.

| Why | Tags |
|---|---|
| clever code saves its author a minute and costs every reader more. | [] |

### module-hides-much-behind-small-public-entry · SHOULD
A module hides much behind a small public entry: few operations, each doing a lot a caller need not know.

| Why | Tags |
|---|---|
| a deep module spares its callers the details it hides; a shallow one makes them learn a public entry nearly as large as the work behind it. | [] |

### pure-by-default · SHOULD
A function's output depends only on its input, and an effect never hides inside an otherwise pure helper.

| Why | Tags |
|---|---|
| a pure function can be understood, tested and moved on its own. | [] |

### no-import-cycles · MUST
Modules form no import cycle, direct or through a chain of modules.

| Why | Tags |
|---|---|
| a cycle ties two modules into one unit that can be neither tested nor changed apart. | [] |

## Comments and leftovers

### comments-explain-why · SHOULD
A comment states a constraint, a workaround or a decision the code cannot show. A comment that narrates the next line is removed.

| Why | Tags |
|---|---|
| the code already says what it does; a narrating comment only repeats it and drifts from it. | [] |

### docs-only-for-non-obvious-public-entry · SHOULD
Documentation of a public entry states only what its names and types cannot — a precondition, a unit, a failure it throws, an effect, a bound — and never restates them.

| Why | Tags |
|---|---|
| documentation that repeats a signature adds reading and drifts; where the use is not obvious, it saves a caller from reading the implementation. | [] |

### retired-code-marked-deprecated · SHOULD
Code kept only for its old callers is marked deprecated where it is declared, naming what replaces it.

| Why | Tags |
|---|---|
| the mark stops new callers at the point of use, and the replacement it names is the way off. | [] |

### deprecated-forms-never-used · MUST
New code calls nothing a dependency or the program marks deprecated, and uses no form a dependency has deprecated in favour of another.

| Why | Tags |
|---|---|
| a deprecated form is removed in a later release, and two spellings of one thing double what a reader must know. | [] |

### todo-names-its-issue · SHOULD
A to-do comment names its issue: `TODO(#<issue>)`. A to-do without one is done, filed, or removed.

| Why | Tags |
|---|---|
| an issue has an owner and a place in the plan; a bare to-do is forgotten where it stands. | [] |

### no-commented-out-code · MUST
Code is never commented out; it is deleted.

| Why | Tags |
|---|---|
| commented-out code rots unseen and misleads readers, while deleted code stays recoverable from an earlier version of the project. | [] |

### no-dead-code · MUST
No unused file, dependency, export, parameter, variable or label, and no unreachable statement. Code and dependencies that only tests reach are unused too. An export a module offers through its public entry is not dead code.

| Why | Tags |
|---|---|
| dead code is read, maintained and feared by people who cannot know it does nothing. | [] |

### suppression-states-its-reason · MUST
Silencing a check — a lint rule, a type error, a mutant, a deliberately ignored error — carries its reason beside it. A bare suppression is forbidden.

| Why | Tags |
|---|---|
| the next reader must know whether the exception still holds, and a suppression without a reason cannot be judged. | [] |

### suppression-silences-one-finding · MUST
A suppression silences one finding: it sits on the finding's line or the line above, or names the finding itself, and names the one rule, code or mutator it silences wherever the tool's form can name one; never a group of rules, a whole tool, a range or a whole file. A suppression that silences no finding the check would report is removed.

| Why | Tags |
|---|---|
| a suppression of one rule on one line can be judged where it stands; a broad one silences rules and lines nobody meant to, and one that silences nothing outlives the finding it was for. | [] |

### diagnostics-through-the-logging-facade · MUST
Diagnostics a program keeps on purpose go through the language's standard logging facade, or through a logger of the program's own where the language has none; never straight to the console or a stream.

| Why | Tags |
|---|---|
| one logger decides where diagnostics go and what they may carry, and a facade every library already writes to puts the program's records and theirs through one pipeline. | [] |

### no-debug-output-in-shipped-code · SHOULD
Shipped code writes no debug output and stops at no breakpoint. What a command-line program writes for its user — its results, prompts and messages — is its output, not debug.

| Why | Tags |
|---|---|
| stray output is noise to users and can leak what it prints. | [security] |

## Absence

### absence-has-one-value · MUST
Code spells absence with one value, which the language block names; another spelling appears only where an external format or an API the code calls imposes it.

| Why | Tags |
|---|---|
| two spellings of absence make every check ask twice, and one of them is always forgotten. | [data] |

## Failure

### error-cause-preserved · MUST
A mapped error keeps its cause.

| Why | Tags |
|---|---|
| the cause is what finds the bug. | [errors] |

### error-logged-once · SHOULD
An error is reported once, where it is handled, never at every level it passes.

| Why | Tags |
|---|---|
| a failure reported at every level looks like several. | [errors] |

### retry-only-transient-failures · SHOULD
Only a transient failure — a timeout, a dropped connection, a rate limit — is retried, with backoff and a limit.

| Why | Tags |
|---|---|
| retrying a failure that will not change wastes time and repeats side effects. | [errors] |

### expected-failures-typed-with-codes · SHOULD
An expected failure is typed, carries a stable code a caller can branch on and details that say what to do, and belongs to the contract that can fail.

| Why | Tags |
|---|---|
| a caller that branches on a typed code keeps working when the message is reworded, and a failure that is part of the contract is handled by design. | [errors] |

### parse-failure-is-one-coded-error · SHOULD
A parser's failure becomes one coded error of the kit, with its cause, and each problem the parser reports becomes one of its details, with the path to where it was found and never the value it rejected.

| Why | Tags |
|---|---|
| the caller handles one error type and sees every problem of the input at once, each pointing at its place. | [errors] |

### framework-errors-never-raised · SHOULD
Code raises the error kit's errors, never the error types of the framework that serves it — a server's or a command-line framework's — which carry no code of the program's expected failures.

| Why | Tags |
|---|---|
| a framework's error carries no code a caller can branch on, and the code that raises it is tied to that framework. | [errors] |

### failures-listed-beside-the-contract · SHOULD
A contract that can fail lists the expected failures it throws as one named type beside it, each an error of the kit with its code.

| Why | Tags |
|---|---|
| the language cannot say what a function throws, so the list is where a caller and a spec find every failure to handle. | [errors] |

### catch-narrows-and-rethrows · MUST
A catch handles only the failures it recognises by code, through the error kit's guard, and rethrows every other; a catch around a library's call maps that library's exceptions to the kit's coded errors.

| Why | Tags |
|---|---|
| a catch that handles everything turns a bug into a handled failure, and the bug is never seen. | [errors] |

### only-errors-thrown · MUST
Only errors are thrown or rejected — never a string, a plain object or another value — except the value a framework's contract has its callers throw to steer it, such as a router's redirect.

| Why | Tags |
|---|---|
| a thrown value that is not an error has no stack and no code, so no catch can recognise it and no log can trace it. | [errors] |

### failure-shown-as-what-happened-and-what-next · SHOULD
What a user sees of a failure says what happened and what to do next, never a stack trace or internals.

| Why | Tags |
|---|---|
| a user can act on a next step but not on a trace, and internals shown to a user leak how the program works. | [errors, security, ux] |

### one-error-handler-per-transport · MUST
Defects travel to the boundary. Each transport has one handler of last resort that turns a failure into what its user sees, and a program exits only there.

| Why | Tags |
|---|---|
| one handler gives every failure the same shape and the same next step, and no internal detail leaks past it. | [errors, security, ux] |

## Requirements for implementation

What any error library a project uses must provide.

### error-kit-carries-code-cause-and-details · MUST
An error library gives every error a stable code, its cause and structured details, and a guard that recognises its errors by code.

| Why | Tags |
|---|---|
| without these, the rules on failure above cannot be followed through the library. | [errors] |

## Async

### async-work-awaited-or-deliberately-detached · MUST
Asynchronous work is awaited, or detached on purpose with its failure handled.

| Why | Tags |
|---|---|
| a forgotten promise fails where nobody listens, and the program carries on as if it succeeded. | [errors] |

### resources-released-on-every-path · SHOULD
A resource that must be released — a handle, a lock, a subscription, a stream's reader — is released on every path, a failure's included.

| Why | Tags |
|---|---|
| a release written only on the path that succeeds leaks on the first failure, and the leak shows far from its cause. | [] |

### io-has-timeout-and-cancellation · SHOULD
Every call across a process boundary has a timeout and can be cancelled.

| Why | Tags |
|---|---|
| a call without a timeout can hang forever, and one that cannot be cancelled keeps working for a caller who left. | [errors, performance] |

### structured-concurrency · SHOULD
Concurrent work is started within a scope that waits for it, cancels it, and receives its failures; no task outlives the operation that started it.

| Why | Tags |
|---|---|
| a task that outlives its scope leaks resources and reports failures to nobody. | [errors] |

## Idempotency

### operations-idempotent-by-design · SHOULD
An operation that may be repeated is idempotent: a key is minted once per intent and sent with every attempt, child identifiers are derived deterministically, and a transition to the current state does nothing.

| Why | Tags |
|---|---|
| networks retry and users click twice; an idempotent operation turns a repeat into no change. | [data] |

## Patterns and design

### inheritance-only-for-errors-and-framework-points · SHOULD
Behaviour is composed from small units. Inheritance is used only for error types and for a framework's extension points.

| Why | Tags |
|---|---|
| inheritance couples a child to its parent's internals and resists every change the hierarchy did not foresee. | [] |

### override-marked-where-declared · MUST
A method that overrides one of its base class carries the language's mark of an override where it is declared, so the type checker fails on a mark that overrides nothing and on an override without one.

| Why | Tags |
|---|---|
| an override that stops overriding, or a new method that overrides one by accident, then fails the check instead of changing behaviour silently. | [] |

### canonical-patterns-by-need · SHOULD
A pattern answers a present problem, and then the canonical one: strategy plus registry for vendors and kinds, reducer for transitions, transition table for state machines, builder for test data.

| Why | Tags |
|---|---|
| one known pattern per problem is recognised at a glance; an invented one, or one used in advance, must be learned and maintained. | [] |

### dry-applies-to-knowledge · SHOULD
Don't-repeat-yourself applies to knowledge, not to text that merely looks alike. An abstraction waits for the third occurrence.

| Why | Tags |
|---|---|
| two copies of one fact drift, but two similar pieces with different reasons to change are coupled wrongly by one abstraction. | [] |

### function-answers-or-changes-state · SHOULD
A function either answers a question or changes state, never both. One that answers has no side effect; one that changes state reads nothing but what it changes, and decides only on that and on its input.

| Why | Tags |
|---|---|
| a question that changes something cannot be asked twice safely, a change that reads beyond what it changes decides on data its caller never saw, and a caller cannot tell which calls are safe. | [] |

### talk-only-to-neighbours · SHOULD
A unit calls its own collaborators, never the collaborators of their collaborators: no chain that walks into another object's internals.

| Why | Tags |
|---|---|
| a chain couples the caller to the whole path, so a change anywhere along it breaks the caller. | [] |
