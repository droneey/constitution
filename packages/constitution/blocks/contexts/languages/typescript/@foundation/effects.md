# Effects

> Governs abort signals, timeouts, scoped resources and promises.

## Calls

### cancellation-by-abort-signal → outside-call-can-be-cancelled · SHOULD

Every function that makes a call across a process boundary takes an `AbortSignal` and hands it on. It takes the signal in its parameter object and hands it to each such call, whether it makes the call itself or through a function it calls.

| Why |
|---|
| a call the signal does not reach keeps working after its caller gave up, and a cancellation in any other form is one no API of the platform takes. |

### outside-call-timed-out-by-abort-signal → outside-call-has-a-timeout · MUST

Every call across a process boundary whose client is given no timeout of its own is timed out by `AbortSignal.timeout(ms)`.

| Why |
|---|
| a timer of the program's own is a timeout no API of the platform takes, so the call it should stop goes on after the time runs out. |

### timeout-signal-joined-to-the-callers → outside-call-can-be-cancelled · MUST

Wherever a call across a process boundary has its caller's signal and a timeout's, the two are joined by `AbortSignal.any`. Neither is put in the other's place.

| Why |
|---|
| a call handed only one of the two signals ignores the other, so it runs on after the time is up or after its caller gave up. |

## Resources

### scoped-resource-held-by-using → scoped-resource-released-by-the-scoped-form · MUST

Every resource whose life is one scope is held by `using` or `await using`. Such resources include a file handle, a lock, a temporary folder and a connection for one task.

| Why |
|---|
| a release written in a `finally` is forgotten on the next path added. |

## Promises

### promise-awaited-returned-or-handed-to-a-scope → async-work-awaited-or-held-by-a-scope · MUST

Every promise is awaited, returned or handed to a scope that awaits it. No `void` discards one.

| Why |
|---|
| a promise nobody awaits fails where nobody sees it, and the work it stands for outlives the code that started it. |

### return-awaited-inside-try-or-using · MUST

Every promise returned inside a `try` block or a `using` declaration's scope is awaited where it is returned. It is written `return await`.

| Why |
|---|
| without the `await`, the function leaves the block before the promise fulfils or rejects, so its `catch` never sees the rejection, its `finally` runs too soon and a `using` releases the resource the work still needs. |
