---
id: tsc
summary: The TypeScript compiler checks the types.
requires: [typescript]
extends: null
abstract: false
languages: [typescript]
dictionary: [tsc, .tsc-cache]
governs: ["tsconfig.json", "tsconfig.src.json", "tsconfig.test.json"]
---

# tsc

> The compiler checks the `types` role. `tsconfig.json` — or `tsconfig.src.json`, where the specs have a configuration of their own — extends the parts of the constitution's release archive — `presets/typescript/tsc/self.json`, the compiler's own options and the strict ones, `core.json`, the options that refuse dead code, and the part of each other active block that has options of its own, `<block>.json` — of the platforms, only the one the program runs on. `presets/typescript/tsc/bindings.yaml` says which option holds which rule.

### compiler-is-the-type-gate → rule-held-by-a-tool-where-one-can
The compiler, not a bundler or the runtime, is the type gate, and its configuration sets the strict options — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

| Why | Tags |
|---|---|
| a bundler strips the types without checking them, so a build can pass with every type wrong. | [] |

### paths-mirror-package-imports → alias-declared-in-package-imports
`paths` in `tsconfig.json` repeats the aliases of `imports` word for word, and only them.

| Why | Tags |
|---|---|
| the compiler does not resolve a folder's `index.ts` through `imports`, so it needs the mirror; an alias only `paths` declares resolves in the editor and fails at run time. | [] |
