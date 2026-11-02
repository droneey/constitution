# Errors

> Governs a failure: raised, caught, carried, shown.

## Kinds of failure

### failure-is-expected-or-defect · MUST

A failure is expected or a defect, and a defect is never replaced by a fallback value. An expected failure is a case the contract foresees and a caller can act on — not found, invalid input, a conflict; a defect is a bug or a broken environment no caller can fix. A transient failure — one the same request might not meet again: a timeout, a dropped connection, a rate limit — is expected. The one fallback for a defect stands where an optional part is called, and shows the part as unavailable.

| Why |
|---|
| a caller can handle only what it foresees, and a defect handled like an expected failure hides the bug and corrupts the data that follows. |

### expected-failure-carries-a-stable-code · SHOULD

An expected failure carries a stable code of the program's own and is named where its callers read it. It is an error of the program’s own — never one of the framework that serves it — with a code a caller can branch on and details that say what to do, and a function that can produce it names it in its signature's type, or in one named type of its failures beside it.

| Why |
|---|
| a caller handed a framework's error has no code of the program's to branch on, and its handling breaks when the framework changes its errors; a failure no signature names reaches a caller who never wrote a case for it. |

### expected-failure-documented-where-no-signature-names-it · MUST

An expected failure that no signature can name is named in the function's documentation. It is named there with the condition it arises in, whether its package publishes the function or not.

| Why |
|---|
| a caller handles only the failures it knows of, and where no signature and no compiler carry them, the documentation is the one place a caller inside the package or outside it learns of them. |

### failure-names-only-reachable-steps · MUST

A failure names only a next step its reader can take. The step it names — an operation to call, a shell command to run, a value to send — exists, is open to the one the failure reaches with the rights they hold, and accepts what it names.

| Why |
|---|
| whoever reads a failure (a person, a script, a language model) follows its advice literally, so a step it cannot take leaves them stuck or retrying the same refusal. |

### failure-told-apart-by-code · MUST

A failure is told apart by its type or its code, never by its message.

| Why |
|---|
| a message is text a person may reword at any time, so code that branches on it breaks silently at the next rewording. |

### parse-failure-lists-every-problem · SHOULD

A failed parse of outside input lists every problem at once. It is one expected failure whose details name every problem found, each by its path, never by the value it rejected.

| Why |
|---|
| a parse that stops at the first problem makes its caller fix and resend once for each, and a rejected value repeated in the failure carries what the sender sent into every log the failure reaches. |

## Catching and carrying

### catch-handles-only-what-it-recognises · MUST

A failure is handled only where it is recognised, and never dropped unread. This holds for a catch and for a check of a failure returned as a value: a failure is recognised by its type or its code, and handling changes what the program does next; logging and carrying on is not handling. Every other failure is passed on, rethrown or returned, save where an optional part is called, at a supervisor, which reports the failures and starts its worker again, or at the handler of last resort. No catch is empty and no returned failure is discarded unread; code that ignores a failure on purpose says why in a suppression.

| Why |
|---|
| a swallowed failure, caught or returned, turns into wrong data that shows up far from its cause. |

### dependency-failure-mapped-where-it-is-wrapped · MUST

Code that wraps a dependency maps each failure of it that it recognises to one of the program's own. A transient failure it recognises is mapped too, and every other passes as a defect, at most wrapped once in a defect of the program's own that keeps its cause, never as an expected failure.

| Why |
|---|
| a dependency's failure that leaves its wrapper unmapped ties every caller to the dependency's errors, so a change of dependency breaks code far from it, and one mapped to an expected failure hands its caller a case it cannot act on. |

### optional-part-isolated-from-its-faults · MUST

A failure inside an optional part stops where that part is called. Such a part is analytics, a preview, a recommendation; the failure is contained and reported there, and the operation that called the part goes on.

| Why |
|---|
| a fault in a part the user can do without otherwise takes down the action it serves, and a fault reported out of band is still seen. |

### error-keeps-its-cause · MUST

An error that maps another keeps it as its cause.

| Why |
|---|
| an error mapped without its cause loses the trace and the message that point at the bug, and whoever reads it starts the search from nothing. |

### thrown-value-is-an-error · MUST

Only an error is thrown. Where the language throws, nothing else is thrown or rejected — never a string, a plain object or another value — except the value a framework’s contract has its callers throw to steer it.

| Why |
|---|
| a thrown value that is not an error has no stack and no code, so no catch can recognise it and no log can trace it. |

### failure-logged-once · SHOULD

A failure is logged once. The unit that handles it logs it or, where that unit logs nothing, the one it reports the failure to does; it is never logged at every level it passes.

| Why |
|---|
| a failure logged at every level it passes reads as several, and whoever reads the log chases incidents that never happened. |

## Retries

### failure-retried-only-when-transient · MUST

A failure is retried only when it is transient and a retry is safe, and only within a limit. A retry is safe when the operation is idempotent or carries its idempotency key. A failure is retried at one level: the code nearest the call or, for a unit of work a broker or a scheduler runs again within its own limit, that run alone. Once its retries are spent, or none is safe, it reaches the caller as an expected failure, which no level above retries again.

| Why |
|---|
| a retry of a failure that will not change wastes time, a retry of an operation that is not idempotent repeats its effect, and retries stacked at several levels multiply each other's attempts. |

### retry-waits-by-backoff-or-the-asked-delay · SHOULD

A retry waits by an exponential backoff with a random spread, or for the delay the other side asks for.

| Why |
|---|
| retries that fire at once, or all together, turn one failure into a crowd that keeps the other side down — exponential backoff with jitter. |

## At the entries

### last-resort-handler-one-per-entry · MUST

Each entry into the program has one handler of last resort. The handler of an entry — a command line, a server, a user interface, a consumer of messages — turns every failure that reaches it into what that entry’s user sees, and a failure ends the program only there.

| Why |
|---|
| without one handler per entry, a failure reaches its user in whatever shape the code that met it chose, or in the runtime's own, with internals shown and no next step. |

### failure-shown-as-what-happened-and-what-next · SHOULD

A failure a user sees says what happened and what to do next, never a stack trace or the program’s internals.

| Why |
|---|
| a user can act on a next step but not on a trace, and internals shown to a user leak how the program works. |

## Requirements for implementation

### error-library-gives-code-cause-and-details · MUST

An error library gives every error a stable code, its cause and structured details, and a guard that recognises its errors by code.

| Why |
|---|
| a library that gives no stable code leaves a catch to tell its errors apart by their message, one that drops the cause loses the trace that finds the bug, one with no structured details leaves a caller to read what to do out of a sentence, and one with no guard leaves every catch to inspect an error's shape by hand, where a lookalike passes. |
