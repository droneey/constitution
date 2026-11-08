---
id: tsc
summary: The TypeScript compiler checks the types.
requires: [typescript, task-runner]
languages: [typescript]
governs: ["tsconfig.json", "tsconfig.src.json", "tsconfig.test.json"]
---

# tsc

> The compiler, `tsc`, checks the types of the program and its specs.

`constitution` writes the compiler options of every block into the unit's `tsconfig.json`, or into its `tsconfig.src.json` where the specs have a configuration of their own. That file extends no shared file, and a list such as `lib` or `types` joins what each block gives.
