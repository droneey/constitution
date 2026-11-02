# Effects

> Governs synchronous input and output on the path of a request under a JavaScript runtime.

## Event loop

### request-path-calls-no-sync-io · SHOULD

Code on the path of a request or an event the program serves calls no synchronous input or output, and runs heavy work in a worker. Such calls include `readFileSync` and `execFileSync`, and such heavy work includes a key derivation by `pbkdf2Sync` or `scryptSync`.

| Why |
|---|
| one synchronous call stalls the event loop, and every request the process holds waits behind it. |
