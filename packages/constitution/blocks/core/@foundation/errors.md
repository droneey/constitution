# Errors

> Governs a failure: raised, caught, carried, shown.

## Vocabulary

A failure is **expected** when the contract foresees it and a caller can act on it, such as not found, invalid input or a conflict, and a **defect** when it is a bug or a fault of the machine or the setup it runs on that no caller can fix.

An answer an outside system gives on purpose to turn a request down, such as a declined payment or a client-error status, is an expected failure, whether or not that system's contract lists it.

An **optional part** is one the user can do without, such as analytics, a preview or a recommendation.

A **supervisor** is a unit that runs workers, reports their failures and starts them again.

An **interface** of the program is one way its users reach it, such as a command line, a server's API, a user interface or a consumer of messages.

The **handler of last resort** is the one place where a failure nothing else handled is turned into what the user of an interface sees.

A failure is **handled** where the code changes what the program does next because of it; logging it and carrying on is not handling it.

A **transient** failure is one the same request might not meet again, such as a timeout, a dropped connection or a rate limit, and it is expected.

A retry is **safe** when the operation is idempotent by design or carries an idempotency key its receiver honours.

## Kinds of failure

### failure-is-expected-or-defect · MUST

Every failure is expected or a defect, and is carried as the kind it is.

| Why |
|---|
| a caller handles only what it foresees, so a defect carried as an expected failure hands it a case it cannot act on, and an expected failure carried as a defect ends work a caller could have saved. |

### defect-never-replaced-by-a-fallback · MUST

Every defect reaches its caller as a defect, never replaced by a fallback value. Exempt: the one fallback where an optional part is called, which shows the part as unavailable.

| Why |
|---|
| a defect handled like an expected failure hides the bug and corrupts the data that follows. |

### expected-failure-carries-a-stable-code · SHOULD

Every expected failure carries a stable code a caller branches on and details that say what to do.

| Why |
|---|
| a caller with no stable code to branch on reads the failure's shape or its message and breaks when either changes, and one with no details is left to guess what to do. |

### expected-failure-is-the-programs-own-error · SHOULD

Every expected failure is an error of the program's own, never one of the framework that serves the program.

| Why |
|---|
| a caller handed a framework's error has no code of the program's to branch on, and its handling breaks when the framework changes its errors. |

### expected-failure-named-in-the-signature · SHOULD

Every function names in its signature each expected failure it can produce. It names it in its signature's type, or in one named type of its failures beside it.

| Why |
|---|
| a failure no signature names reaches a caller who never wrote a case for it. |

### expected-failure-documented-where-no-signature-names-it · SHOULD

Every expected failure no signature can name is named in the function's documentation. The documentation gives the condition it arises in, whether its package publishes the function or not.

| Why |
|---|
| a caller handles only the failures it knows of, and where no signature and no compiler carry them, the documentation is the one place a caller inside the package or outside it learns of them. |

### failure-told-apart-by-code · MUST

Every failure is told apart by its type or its code, never by its message.

| Why |
|---|
| a message is text anyone may reword at any time, so code that branches on it breaks silently at the next rewording. |

### failure-names-only-reachable-steps · SHOULD

Every failure names only a next step its reader can take. The step it names, such as an operation to call, a program to start or a value to send, exists, is open to the one the failure reaches with the rights they hold, and accepts what it names.

| Why |
|---|
| whoever reads a failure (a person, a script, a language model) follows its advice literally, so a step it cannot take leaves them stuck or retrying the same rejection. |

### parse-failure-lists-every-problem · SHOULD

Every failed parse of a value from outside lists every problem at once. It is one expected failure whose details name every problem found.

| Why |
|---|
| a parse that stops at the first problem makes its caller fix and resend once for each. |

### parse-failure-never-repeats-the-rejected-value · MUST

Every failed parse names each problem by its path, never by the value it rejected.

| Why |
|---|
| a rejected value repeated in the failure carries what the sender sent into every log the failure reaches. |

## Catching and carrying

### catch-handles-only-what-it-recognises · MUST

Every failure is handled only where it is recognised by its type or its code. This holds whether it is caught or returned as a value, and every other failure is passed on, raised again or returned. Exempt: where an optional part is called, a supervisor, and the handler of last resort.

| Why |
|---|
| a failure handled where it is not understood is handled wrongly, and one logged and carried on leaves the program running on a state nobody expected. |

### failure-never-dropped-unread · MUST

Every failure is read where it arrives, never dropped unread: no catch is empty and no returned failure is discarded. Exempt: a failure ignored on purpose, with a suppression that says why.

| Why |
|---|
| a swallowed failure, caught or returned, turns into wrong data that shows up far from its cause. |

### dependency-failure-mapped-where-it-is-wrapped · MUST

All code that wraps a dependency maps each failure of it that it recognises to one of the program's own. Every other passes as a defect, wrapped at most once in a defect of the program's own, never as an expected failure.

| Why |
|---|
| a dependency's failure that leaves its wrapper unmapped ties every caller to the dependency's errors, so a change of dependency breaks code far from it, and one mapped to an expected failure hands its caller a case it cannot act on. |

### optional-part-isolated-from-its-faults · MUST

Every failure inside an optional part stops where that part is called. It is contained there, and the operation that called the part goes on.

| Why |
|---|
| a fault in a part the user can do without otherwise takes down the action it serves. |

### error-keeps-its-cause · MUST

Every error that maps another keeps it as its cause.

| Why |
|---|
| an error mapped without its cause loses the trace and the message that point at the bug, and whoever reads it starts the search from nothing. |

### raised-value-is-an-error · MUST

Where the language raises failures, only an error is raised, never a string, a plain object or another value. Exempt: the value a framework's contract has its callers raise to steer it.

| Why |
|---|
| a raised value that is no error has no stack and no code, so no handler recognises it and no log traces it. |

## Retries

### transient-failure-reaches-its-caller-once-no-retry-is-left · MUST

Every transient failure reaches its caller only once the level that retries it has no retry left or none is safe. That level is the one `failure-retried-at-one-level` gives.

| Why |
|---|
| a transient failure passed on before its retries are used up stacks the caller's retries on the callee's, and the caller retries what the callee was still retrying. |

### failure-retried-only-when-transient · MUST

Every failure is retried only when it is transient and a retry is safe, and only within a limit.

| Why |
|---|
| a retry of a failure that will not change wastes time, and one of an operation that is not idempotent repeats its effect. |

### failure-retried-at-one-level · MUST

Every failure is retried at one level: by the code nearest the call or, where something else runs the work again within its own limit, such as a broker or a scheduler, by that run alone. No level above retries a failure whose retries are used up.

| Why |
|---|
| retries stacked at several levels multiply each other's attempts, keeping a struggling system down. |

### retry-waits-by-backoff-or-the-asked-delay · MUST

Every retry waits by an exponential backoff with a random spread, or for the delay the other side asks for.

| Why |
|---|
| retries that fire at once, or all together, turn one failure into a crowd that keeps the other side down — exponential backoff with jitter. |

## At the interfaces

### last-resort-handler-one-per-interface · MUST

Each interface of the program has one handler of last resort. It turns every failure that reaches it into what that interface's user sees. Failures may be caught in any number of places of the interface, and each of them hands its defect to that handler.

| Why |
|---|
| without one handler per interface, a failure reaches its user in whatever shape the code that met it chose, or in the runtime's own, with internals shown and no next step. |

### failure-ends-the-program-only-at-the-last-resort · MUST

Every failure ends the program only at a handler of last resort.

| Why |
|---|
| code that ends the program where it meets a failure skips the handler that would show its user what happened, and the cleanup a stop owes its work. |

### failure-shown-as-what-happened-and-what-next · SHOULD

Every failure a user sees says what happened and what to do next, never a stack trace or the program's internals.

| Why |
|---|
| a user can act on a next step but not on a trace, and internals shown to a user leak how the program works. |
