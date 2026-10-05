# bunli

## bunli-spec-with-fake-terminal → command-tested-through-its-command-line
A command's spec builds the program with a fake terminal and prompt session — `createCLI(meta, terminal)` — and runs it on an argument list.

| Why | Check | Tags |
|---|---|---|
| the spec drives the command as a user does, and reads what the user would see. | test | [] |

## bunli-usage-failures-exit-two → exit-codes-from-one-map
The program's entry adds a listener to the process's `exit` that turns an exit `1` given before any handler starts — bunli's answer to an unknown command, an unknown flag or a flag's bad value — into the usage code `2`.

| Why | Check | Tags |
|---|---|---|
| bunli ends its own usage failures with `process.exit(1)`, the code the map gives to a failure the user can act on, and offers no hook to change it. | test | [] |

## bunli-configured-inline → tests-run-in-a-sandbox
`createCLI` takes the program's configuration — its name, version, description and plugins — inline, and the program keeps no `bunli.config.*`.

| Why | Check | Tags |
|---|---|---|
| bunli merges a `bunli.config.*` it finds in the working folder into the configuration given inline, so a spec run from another folder would build another program. | review | [] |
