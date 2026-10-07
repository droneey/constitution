# Errors

> Governs a failure: raised, caught, carried, shown.

## Kinds of failure

### failure-is-expected-or-defect · MUST
A failure is expected — a case the contract foresees and a caller can act on: not found, invalid input, a conflict — or a defect: a bug or a broken environment no caller can fix. A defect is never replaced by a fallback value, and is caught to carry on only at the boundary of an optional part; everywhere else it travels to the handler of last resort.

| Why | Tags |
|---|---|
| a caller can handle only what it foresees, and a defect handled like an expected failure hides the bug and corrupts the data that follows. | [errors] |

### expected-failure-is-part-of-the-contract · SHOULD
An expected failure is an error of the program’s own — never one of the framework that serves it — with a stable code a caller can branch on and details that say what to do, and the contract that can produce it lists it: in its signature where the language can say so, else as one named type beside it.

| Why | Tags |
|---|---|
| a failure that is part of the contract is handled by design, and a framework’s error carries no code of the program’s. | [errors] |

### failure-told-apart-by-code · MUST
A failure is told apart by its type or its code, never by its message.

| Why | Tags |
|---|---|
| a message is text a person may reword at any time. | [errors] |

### parse-failure-lists-every-problem · SHOULD
A failed parse of outside input is one expected failure whose details name every problem found, each by its path, never by the value it rejected.

| Why | Tags |
|---|---|
| the caller handles one failure and sees every problem of its input at once, each pointing at its place. | [errors] |

## Catching and carrying

### catch-handles-only-what-it-recognises · MUST
A catch handles only the failures it recognises by type or code — handling changes what the program does next; logging and carrying on is not handling — and rethrows every other, save at the boundary of an optional part, which contains and reports them; one around a dependency maps that dependency's failures to the program's own. No catch is empty; one that ignores a failure on purpose says why in a suppression.

| Why | Tags |
|---|---|
| a swallowed failure turns into wrong data that shows up far from its cause. | [errors] |

### optional-part-isolated-from-its-faults · SHOULD
A failure inside an optional part — analytics, a preview, a recommendation — is contained at that part's boundary and reported, and the operation that called the part goes on.

| Why | Tags |
|---|---|
| a part the user can do without must not take down the action it serves, and a fault reported out of band is still seen. | [errors] |

### error-keeps-its-cause · MUST
An error that maps another keeps it as its cause.

| Why | Tags |
|---|---|
| the cause is what finds the bug. | [errors] |

### thrown-value-is-an-error · MUST
Where the language throws, only an error is thrown or rejected — never a string, a plain object or another value — except the value a framework’s contract has its callers throw to steer it.

| Why | Tags |
|---|---|
| a thrown value that is not an error has no stack and no code, so no catch can recognise it and no log can trace it. | [errors] |

### failure-reported-once · SHOULD
A failure is reported once, where it is handled, never at every level it passes.

| Why | Tags |
|---|---|
| a failure reported at every level looks like several. | [errors] |

### failure-retried-only-when-transient · SHOULD
A failure is retried only when it is transient — a timeout, a dropped connection, a rate limit — and the operation is idempotent or carries its idempotency key, with an exponential backoff, a random spread and a limit.

| Why | Tags |
|---|---|
| a retry of a failure that will not change wastes time, and a retry of an operation that is not idempotent repeats its effect. | [errors] |

## At the edge

### last-resort-handler-one-per-entry · MUST
A handler of last resort, one for each entry into the program — a command line, a server, a screen, a consumer of messages — turns every failure that reaches it into what that entry’s user sees, and the program exits only there.

| Why | Tags |
|---|---|
| one handler gives every failure the same shape and the same next step, and no internal detail leaks past it. | [errors] |

### failure-shown-as-what-happened-and-what-next · SHOULD
A failure a user sees says what happened and what to do next, never a stack trace or the program’s internals.

| Why | Tags |
|---|---|
| a user can act on a next step but not on a trace, and internals shown to a user leak how the program works. | [errors, security, ux] |

## Requirements for implementation

### error-library-gives-code-cause-and-details · MUST
A library of errors gives every error a stable code, its cause and structured details, and a guard that recognises its errors by code.

| Why | Tags |
|---|---|
| without these, the rules of this chapter cannot be kept through the library. | [errors] |
