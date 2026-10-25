# Exit codes

> Governs how commander's own exits and an action's failures reach the program's exit codes.

## General

### commander-exits-overridden-and-mapped → exit-codes-from-one-map · MUST

The program calls `exitOverride()`, and a `CommanderError` whose `exitCode` is 0 — help or the version, asked for — ends the run with 0, and every other — an unknown command or option, a missing or bad argument, help shown because no command was given — with the usage code 2. No action calls commander's `error()`; it throws the program's own failure.

| Why | Tags |
|---|---|
| commander otherwise ends its usage failures with `process.exit(1)`, the code the map gives a failure the user can act on, and an `error()` raised by an action reaches the map as one of commander's. | [errors] |

### commander-run-inside-the-last-resort-handler → last-resort-handler-one-per-entry · MUST

`parseAsync` runs inside the program's one handler of last resort, which every `CommanderError` and every failure an action lets escape reach.

| Why | Tags |
|---|---|
| with the exits overridden, every failure of a run surfaces from `parseAsync`, so one handler around it ends every command by the same map. | [errors] |
