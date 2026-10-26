---
id: tsc
summary: The TypeScript compiler checks the types.
requires: [typescript, json, _task-runner]
extends: null
abstract: false
languages: [typescript]
governs: ["tsconfig.json", "tsconfig.src.json", "tsconfig.test.json"]
---

# tsc

> The compiler, **`tsc`**, checks the types of the program and its specs.

The program writes the compiler options of every block into the unit's `tsconfig.json`, which extends no shared file, and a list such as `lib` or `types` joins what each block gives.
