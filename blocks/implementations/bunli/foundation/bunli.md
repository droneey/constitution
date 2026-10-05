# bunli

## bunli-spec-with-fake-terminal → command-tested-through-its-command-line
A command's spec builds the program with a fake terminal and prompt session — `createCLI(meta, terminal)` — and runs it on an argument list.

| Why | Check | Tags |
|---|---|---|
| the spec drives the command as a user does, and reads what the user would see. | test | [] |

## bunli-flags-declared-by-schema → outside-values-untyped-until-parsed
Every flag is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.

| Why | Check | Tags |
|---|---|---|
| a flag is validated once, before the handler runs, and the handler works with typed values. | review | [] |

## bunli-handler-exits-by-the-map → exit-codes-from-one-map
A handler lets no failure escape to bunli: it ends each one with the code the exit map gives it.

| Why | Check | Tags |
|---|---|---|
| bunli answers a failure that escapes a handler with its own message and the exit `1`, whatever failed, an internal error included. | test | [] |

## bunli-usage-failures-exit-two → exit-codes-from-one-map
The program's entry adds a listener to the process's `exit` that turns an exit `1` given before any handler starts — bunli's answer to an unknown command, an unknown flag or a flag's bad value — into the usage code `2`.

| Why | Check | Tags |
|---|---|---|
| bunli ends its own usage failures with `process.exit(1)`, the code the map gives to a failure the user can act on, and offers no hook to change it. | test | [] |
