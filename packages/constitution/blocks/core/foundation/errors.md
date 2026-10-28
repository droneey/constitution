# Errors

> Governs a failure: raised, caught, carried, shown.

## Kinds of failure

### failure-is-expected-or-defect · MUST

A failure is expected — a case the contract foresees and a caller can act on: not found, invalid input, a conflict — or a defect: a bug or a broken environment no caller can fix. A transient failure — one the same request might not meet again: a timeout, a dropped connection, a rate limit — is expected. A defect is never replaced by a fallback value, save at the boundary of an optional part, which shows the part as unavailable.

| Why |
|---|
| a caller can handle only what it foresees, and a defect handled like an expected failure hides the bug and corrupts the data that follows. |

### expected-failure-is-part-of-the-contract · SHOULD

An expected failure is an error of the program’s own — never one of the framework that serves it — with a stable code a caller can branch on and details that say what to do, and the contract that can produce it names it where its callers read it — in its signature's type, or in one named type of its failures beside it.

| Why |
|---|
| a failure that is part of the contract is handled by design, and a framework’s error carries no code of the program’s. |

### expected-failure-documented-where-no-signature-names-it · MUST

Where its signature cannot name a failure, every function that can produce an expected failure names it, and the condition it arises in, in its documentation, whether its package publishes the function or not.

| Why |
|---|
| a caller handles only the failures it knows of, and where no signature and no compiler carry them, the documentation is the one place a caller inside the package or outside it learns of them. |

### failure-names-only-reachable-steps · MUST

The next step a failure names — an operation to call, a command to run, a value to send — exists, is open to the one the failure reaches with the rights they hold, and accepts what it names.

| Why |
|---|
| whoever reads a failure — a person, a script, a model — follows its advice literally, and a step the schema refuses or a registration hid sends them round a loop the program built. |

### failure-told-apart-by-code · MUST

A failure is told apart by its type or its code, never by its message.

| Why |
|---|
| a message is text a person may reword at any time. |

### parse-failure-lists-every-problem · SHOULD

A failed parse of outside input is one expected failure whose details name every problem found, each by its path, never by the value it rejected.

| Why |
|---|
| the caller handles one failure and sees every problem of its input at once, each pointing at its place. |

## Catching and carrying

### catch-handles-only-what-it-recognises · MUST

A catch handles only the failures it recognises by type or code — handling changes what the program does next; logging and carrying on is not handling — and rethrows every other, save at an optional part's boundary, at a supervisor, which reports them and starts its worker again, and at the handler of last resort; one around a dependency maps the failures of that dependency it recognises to the program's own. No catch is empty; one that ignores a failure on purpose says why in a suppression.

| Why |
|---|
| a swallowed failure turns into wrong data that shows up far from its cause. |

### optional-part-isolated-from-its-faults · MUST

A failure inside an optional part — analytics, a preview, a recommendation — is contained at that part's boundary and reported, and the operation that called the part goes on.

| Why |
|---|
| a part the user can do without must not take down the action it serves, and a fault reported out of band is still seen. |

### error-keeps-its-cause · MUST

An error that maps another keeps it as its cause.

| Why |
|---|
| the cause is what finds the bug. |

### thrown-value-is-an-error · MUST

Where the language throws, only an error is thrown or rejected — never a string, a plain object or another value — except the value a framework’s contract has its callers throw to steer it.

| Why |
|---|
| a thrown value that is not an error has no stack and no code, so no catch can recognise it and no log can trace it. |

### failure-logged-once · SHOULD

A failure is logged once, by the unit that handles it or, where that unit logs nothing, by the one it reports the failure to; never at every level it passes.

| Why |
|---|
| a failure reported at every level looks like several. |

### failure-retried-only-when-transient · MUST

A failure is retried only when it is transient and the operation is idempotent or carries its idempotency key, and only within a limit. It is retried at one level: the code nearest the call or, for a unit of work a broker or a scheduler runs again within its own limit, that run alone. Once its retries are spent, or none is safe, it reaches the caller as an expected failure, which no level above retries again.

| Why |
|---|
| a retry of a failure that will not change wastes time, and a retry of an operation that is not idempotent repeats its effect. |

### retry-waits-by-backoff-or-the-asked-delay · SHOULD

A retry waits by an exponential backoff with a random spread, or for the delay the other side asks for.

| Why |
|---|
| retries that fire at once, or all together, turn one failure into a crowd that keeps the other side down. |

## At the entries

### last-resort-handler-one-per-entry · MUST

A handler of last resort, one for each entry into the program — a command line, a server, a user interface, a consumer of messages — turns every failure that reaches it into what that entry’s user sees, and a failure ends the program only there.

| Why |
|---|
| one handler gives every failure the same shape and the same next step, and no internal detail leaks past it. |

### failure-shown-as-what-happened-and-what-next · SHOULD

A failure a user sees says what happened and what to do next, never a stack trace or the program’s internals.

| Why |
|---|
| a user can act on a next step but not on a trace, and internals shown to a user leak how the program works. |

## Requirements for implementation

### error-library-gives-code-cause-and-details · MUST

A library of errors gives every error a stable code, its cause and structured details, and a guard that recognises its errors by code.

| Why |
|---|
| without these, the rules of this chapter cannot be kept through the library. |
