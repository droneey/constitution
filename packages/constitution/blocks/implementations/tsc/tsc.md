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

> The compiler checks the types of the program and its specs.

The compiler's `extends` takes the parts in order, and a later part's option replaces an earlier's whole, a list such as `lib` or `types` included, so `types` is set by one part alone.
