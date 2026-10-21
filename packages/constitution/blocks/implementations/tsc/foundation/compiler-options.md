# Compiler options

> Governs the compiler's strict options.

## General

### compiler-is-the-type-gate → rule-held-by-a-tool-where-one-can · MUST

The compiler, not a bundler or the runtime, is the type gate, and its configuration sets the strict options — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

| Why | Tags |
|---|---|
| a bundler strips the types without checking them, so a build can pass with every type wrong. | [] |
