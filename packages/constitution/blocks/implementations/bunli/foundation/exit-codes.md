# Exit codes

> Governs a command's exit codes and the one handler its failures reach.

## General

### bunli-handler-exits-by-the-map → exit-codes-from-one-map · MUST

A handler lets no failure escape to bunli: it ends each one with the code the exit map gives it.

| Why | Tags |
|---|---|
| bunli answers a failure that escapes a handler with its own message and the exit `1`, whatever failed, an internal error included. | [] |

### bunli-usage-failures-exit-two → exit-codes-from-one-map · MUST

The program's entry adds a listener to the process's `exit` that turns an exit `1` given before any handler starts — bunli's answer to an unknown command, an unknown flag or a flag's bad value — into the usage code `2`.

| Why | Tags |
|---|---|
| bunli ends its own usage failures with `process.exit(1)`, the code the map gives to a failure the user can act on, and offers no hook to change it. | [] |

### bunli-handler-through-the-error-handler → last-resort-handler-one-per-entry · MUST

Every handler runs its work through the program's one error handler, which maps a failure to the exit map.

| Why | Tags |
|---|---|
| every command then exits by the same map, whatever fails. | [] |
