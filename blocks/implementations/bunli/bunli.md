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

## Requirements

| Requirement | How | Met |
|---|---|---|
| `command-framework-parses-flags-by-schema` | `option(schema)`, parsed before the handler | yes |
| `command-framework-leaves-exits-to-the-handler` | the handler ends each of the program's failures by the map (`bunli-handler-exits-by-the-map`, through the one error handler on architecture); bunli's own usage failures — an unknown command, an unknown flag, a flag's bad value — call `process.exit(1)`, which the entry turns into `2` (`bunli-usage-failures-exit-two`), and help and version exit `0` | partly |
| `command-framework-runs-in-a-test-sandbox` | the terminal and prompt session are injected (`bunli-spec-with-fake-terminal`); signal listeners and bunli's own clock stay real and change nothing a spec checks, and the lookup of `bunli.config.*` finds none (`program-keeps-no-bunli-config`) | partly |
