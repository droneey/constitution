---
id: bunli
summary: bunli declares each command, its flags and its handler.
requires: [bun, cli]
extends: null
abstract: false
checks: []
dictionary: [bunli]
governs: ["**/cli/**"]
---

# bunli

> The command framework of a Bun program.

## Requirements

| Requirement | How in bunli | Status |
|---|---|---|
| `command-framework-parses-flags-by-schema` | `option(schema)`, parsed before the handler | met |
| `command-framework-leaves-exits-to-the-handler` | the program's failures pass its handler; bunli's own exits — an unknown command, a bad global flag, help, version — call `process.exit` with its own codes | partial: the program's failures all pass the handler; bunli's own exits keep its codes |
| `command-framework-runs-in-a-test-sandbox` | the terminal and prompt session are injected; signal listeners, `Date.now()` and the lookup of `bunli.config.*` stay real | partial: those effects change nothing a spec checks |
