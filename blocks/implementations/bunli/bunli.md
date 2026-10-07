---
id: bunli
summary: bunli declares each command, its flags and its handler.
requires: [bun, cli]
extends: null
abstract: false
languages: []
dictionary: [bunli]
governs: ["**/cli/**"]
---

# bunli

> The command framework of a Bun program.

### bunli-spec-with-fake-terminal → command-tested-through-its-command-line · SHOULD
A command's spec builds the program with a fake terminal and prompt session — `createCLI(meta, terminal)` — and runs it on an argument list.

| Why | Tags |
|---|---|
| the spec drives the command as a user does, and reads what the user would see. | [] |

### bunli-flags-declared-by-schema → outside-value-untyped-until-parsed · MUST
Every flag is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.

| Why | Tags |
|---|---|
| a flag is validated once, before the handler runs, and the handler works with typed values. | [] |

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

### program-keeps-no-bunli-config → fact-has-one-source · MUST
The program keeps no `bunli.config.*`: its configuration lives only in the code that builds it.

| Why | Tags |
|---|---|
| bunli merges a `bunli.config.*` it finds in the working folder into the configuration given in code, so a file beside the program changes what it ships as much as what a spec run from another folder builds. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `command-framework-parses-flags-by-schema` | `option(schema)`, parsed before the handler | yes |
| `command-framework-leaves-exits-to-the-handler` | the handler ends each of the program's failures by the map (`bunli-handler-exits-by-the-map`, through the one error handler on architecture); bunli's own usage failures — an unknown command, an unknown flag, a flag's bad value — call `process.exit(1)`, which the entry turns into `2` (`bunli-usage-failures-exit-two`), and help and version exit `0` | partly |
| `command-framework-runs-in-a-test-sandbox` | the terminal and prompt session are injected (`bunli-spec-with-fake-terminal`); signal listeners and bunli's own clock stay real and change nothing a spec checks, and the lookup of `bunli.config.*` finds none (`program-keeps-no-bunli-config`) | partly |
