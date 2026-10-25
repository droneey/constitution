# Effects

> Governs abort signals, scoped resources, promises and synchronous I/O.

## Calls and resources

### cancellation-by-abort-signal → outside-call-can-be-cancelled · SHOULD

An operation that can be cancelled takes an `AbortSignal` in its options object and hands it to every call across a process boundary it makes.

| Why |
|---|
| one signal from the caller stops all the work below it, and every API of the platform takes one. |

### outside-call-timed-out-by-abort-signal → outside-call-has-a-timeout · MUST

A call across a process boundary that its client does not bound by a timeout of its own is given `AbortSignal.timeout(ms)`, joined to its caller's signal by `AbortSignal.any` where it has one.

| Why |
|---|
| that signal is the timeout every API of the platform takes, and joining it to the caller's keeps one way to stop a call, whether the time ran out or the caller gave up. |

### scoped-resource-held-by-using → resource-released-on-every-path · MUST

A resource whose life is one scope — a file handle, a lock, a temporary folder, a connection for one task — is held by `using` or `await using`, and a promise returned inside its scope is awaited, so the resource outlives it.

| Why |
|---|
| the resource is then released at the end of its scope on every way out, a thrown failure included, where a `finally` is forgotten on the next path added. |

### promise-awaited-returned-or-handed-to-a-scope → async-work-awaited-or-held-by-a-scope · MUST

Every promise is awaited, returned or handed to a scope that awaits it; `void` never discards one.

| Why |
|---|
| a promise nobody awaits fails where nobody sees it, and the work it stands for outlives the code that started it. |

### request-path-calls-no-sync-io · SHOULD

Code on the path of a request or an event the program serves calls no synchronous input or output — `readFileSync`, `execFileSync` — and runs heavy work, a key derivation by `pbkdf2Sync` or `scryptSync` among it, in a worker.

| Why |
|---|
| one synchronous call stalls the event loop, and every request the process holds waits behind it. |
