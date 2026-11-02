# Effects

> Governs abort signals, scoped resources and promises.

## Calls and resources

### cancellation-by-abort-signal → outside-call-can-be-cancelled · SHOULD

A cancellable operation takes an `AbortSignal` and hands it on. It takes the signal in its options object and hands it to every call across a process boundary it makes.

| Why |
|---|
| a call the signal does not reach keeps working after its caller gave up, and a cancellation in any other form is one no API of the platform takes. |

### outside-call-timed-out-by-abort-signal → outside-call-has-a-timeout · MUST

A call across a process boundary is timed out by `AbortSignal.timeout(ms)` where its client sets no timeout of its own. The signal is joined to its caller's by `AbortSignal.any` where the caller has one.

| Why |
|---|
| a timer of the program's own is a timeout no API of the platform takes, and a timeout not joined to its caller's signal is a second way to stop the call, so the call ignores either the time running out or the caller giving up. |

### scoped-resource-held-by-using → resource-released-on-every-path · MUST

A resource whose life is one scope is held by `using` or `await using`. Such a resource is a file handle, a lock, a temporary folder or a connection for one task, and a promise returned inside its scope is awaited, so the resource outlives it.

| Why |
|---|
| a release written in a `finally` is forgotten on the next path added, and a promise returned unawaited from the scope runs after the resource it uses is released. |

### promise-awaited-returned-or-handed-to-a-scope → async-work-awaited-or-held-by-a-scope · MUST

Every promise is awaited, returned or handed to a scope that awaits it. `void` never discards one.

| Why |
|---|
| a promise nobody awaits fails where nobody sees it, and the work it stands for outlives the code that started it. |
