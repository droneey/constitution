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
governs: ["tsconfig.json"]
---

# tsc

> The compiler checks the `types` role. `tsconfig.json` extends the parts of the constitution's release archive — `presets/typescript/tsc/foundation/self.json`, the compiler's own options and the strict ones, `core.json`, the options that refuse dead code, and the part of each other active block that has options of its own — of the platforms, only the one the program runs on. `presets/typescript/tsc/bindings.yaml` says which option holds which rule.
