---
id: typescript
summary: How TypeScript is written, resolved, typed and packaged.
requires: []
extends: null
abstract: false
checks: [types]
languages: [typescript]
roles: [format, lint, types, architecture, names, unused, versions, tests, coverage, mutation, secrets, audit, commits]
dictionary: [TypeScript, .ts, .tsx, .d.ts, index.ts, main.ts, types.d.ts, package.json, tsconfig.json, tsc, JSDoc]
governs: ["**/*.ts", "**/*.tsx", "package.json", "tsconfig.json"]
---

# TypeScript

> The form core's rules take in TypeScript. The source root is the `src/` of each package or application, and its entry is `main.ts`. The compiler checks the `types` role: `tsconfig.json` extends the parts of the constitution's release archive — `presets/typescript/foundation/self.json`, the compiler's own options and the strict ones, `core.json`, the options that refuse dead code, and the part of each other active block that has options of its own.
