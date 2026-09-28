---
id: typescript
summary: How TypeScript is written, resolved, typed and packaged.
requires: []
extends: null
abstract: false
checks: [types]
dictionary: [TypeScript, .ts, .tsx, .d.ts, index.ts, main.ts, types.d.ts, package.json, tsconfig.json, tsc, JSDoc]
governs: ["**/*.ts", "**/*.tsx", "package.json", "tsconfig.json"]
---

# TypeScript

> The form core's rules take in TypeScript. The source root is `src/` of the unit, a folder's surface is `index.ts`, a role file is `<name>.<role>.ts`, the entry is `main.ts`, and the wiring file is `root/wiring.ts`. The compiler checks the `types` role.
