---
id: tsc
summary: The TypeScript compiler checks the types.
requires: [typescript]
extends: null
abstract: false
checks: [types]
languages: [typescript]
roles: []
dictionary: [tsc]
governs: ["tsconfig.json", "tsconfig.src.json", "tsconfig.test.json"]
---

# tsc

> The compiler checks the `types` role. `tsconfig.json` — or `tsconfig.src.json`, where the specs have a configuration of their own — extends the parts of the constitution's release archive — `presets/typescript/tsc/foundation/self.json`, the compiler's own options and the strict ones, `core.json`, the options that refuse dead code, and the part of each other active block that has options of its own, `<block>.json` — of the platforms, only the one the program runs on. `presets/typescript/tsc/bindings.yaml` says which option holds which rule.
