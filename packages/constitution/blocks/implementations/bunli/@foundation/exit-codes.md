# Exit codes

> Governs a subcommand's exit codes and the one handler its failures reach.

## General

### bunli-handler-through-the-last-resort-handler → last-resort-handler-one-per-interface · MUST

No failure escapes a handler to bunli. Every handler runs its work through the command line's one handler of last resort, which ends each failure with the code the exit map gives it.

| Why |
|---|
| bunli answers a failure that escapes a handler with its own message and the exit `1`, whatever failed, an internal error included, so neither the user nor a script that calls the program can tell what happened. |

### bunli-usage-failures-exit-two → exit-code-map-keeps-the-conventional-codes · MUST

Every usage failure bunli answers exits with the usage code `2`. The program turns an exit `1` given before any handler starts, bunli's answer to an unknown subcommand, an unknown flag or a flag's bad value, into `2`, such as by a listener on the process's `exit`.

| Why |
|---|
| bunli ends its own usage failures with `process.exit(1)`, the code the map gives a failure the user can act on, and offers no hook to change it, so a script reads a mistyped flag as a failure of the run. |
