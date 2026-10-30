# Exit codes

> Governs how the program is run, and how commander's own exits and an action's failures reach the program's exit codes.

## General

### commander-exits-overridden-and-mapped → exit-codes-from-one-map · MUST

The program calls `exitOverride()`, and a `CommanderError` whose `exitCode` is 0 — help or the version, asked for — ends the run with 0, and every other — an unknown command or option, a missing or bad argument, help shown because no command was given — with the usage code 2. No action calls commander's `error()`; it throws the program's own failure.

| Why |
|---|
| commander otherwise ends its usage failures with `process.exit(1)`, the code the map gives a failure the user can act on, and an `error()` raised by an action reaches the map as one of commander's. |

### commander-run-by-parse-async-inside-the-last-resort-handler → last-resort-handler-one-per-entry · MUST

The program is run with `await program.parseAsync(argv)`, never with `parse`, inside the program's one handler of last resort, which every `CommanderError` and every failure an action lets escape reach.

| Why |
|---|
| `parse` returns before an asynchronous action ends, so its failure is never awaited; with the exits overridden, every failure of a run surfaces from `parseAsync`, so one handler around it ends every command by the same map. |
