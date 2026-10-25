---
id: tsc
summary: The TypeScript compiler checks the types.
requires: [typescript, json]
extends: null
abstract: false
languages: [typescript]
governs: ["tsconfig.json", "tsconfig.src.json", "tsconfig.test.json"]
---

# tsc

> The compiler, **`tsc`**, checks the types of the program and its specs.

The compiler's `extends` takes the parts in order, and a later part's option replaces an earlier's whole, a list such as `lib` or `types` included, so `types` is set by one part alone.
