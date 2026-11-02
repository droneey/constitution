# Compiler options

> Governs the compiler's strict options.

## General

### compiler-is-the-type-gate → rule-held-by-a-tool-where-one-can · MUST

The compiler is the type gate, not a bundler or the runtime. Its configuration sets the strict options — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

| Why |
|---|
| a bundler strips the types without checking them, so a build can pass with every type wrong. |
