# Effects

> Governs what blocks the event loop on the path of a request under a JavaScript runtime.

## Event loop

### request-path-calls-no-sync-io · MUST

No code on the path of a request or an event the program serves blocks the event loop with synchronous work. It makes no synchronous input or output call, such as `readFileSync` or `execFileSync`, and runs heavy work, such as a key derivation by `pbkdf2Sync` or `scryptSync`, off the event loop, such as in a worker.

| Why |
|---|
| one synchronous call stalls the event loop, and every request the process holds waits behind it. |
