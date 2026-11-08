# Exit codes

> Governs how the program is run, and how commander's own exits and an action's failures reach the program's exit codes.

## General

### commander-exits-overridden → shared-resource-has-one-writer · MUST

Every program calls `exitOverride()`, so commander throws a `CommanderError` wherever it would end the process.

| Why |
|---|
| commander otherwise ends its usage failures with `process.exit(1)` itself, a second writer of the exit code beside the program's handler. |

### commander-error-mapped-to-the-usage-code → exit-code-map-keeps-the-conventional-codes · MUST

Every `CommanderError` ends the run by the exit map. One whose `exitCode` is 0, help or the version asked for, ends it with 0, and every other, such as an unknown subcommand or option, a missing or bad argument, or help shown because no subcommand was given, with the usage code 2.

| Why |
|---|
| commander gives its usage failures the code 1, which the map gives a failure the user can act on, so a script reads a typing error as a failed run. |

### commander-error-never-raised-by-an-action → exit-codes-from-one-map · MUST

No action calls commander's `error()`. It throws the program's own failure.

| Why |
|---|
| an `error()` raised by an action reaches the map as one of commander's, so a failure of the work ends with the usage code. |

### commander-run-by-parse-async-inside-the-last-resort-handler → last-resort-handler-one-per-interface · MUST

Every program runs by `await program.parseAsync(argv)` inside its one handler of last resort. It never runs by `parse`, and every `CommanderError` and every failure an action lets escape reach that handler.

| Why |
|---|
| `parse` returns before an asynchronous action ends, so its failure is never awaited; with the exits overridden, every failure of a run surfaces from `parseAsync`, so one handler around it ends every run by the same map. |
