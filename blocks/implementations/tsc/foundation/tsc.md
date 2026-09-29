# tsc

## compiler-is-the-type-gate → rules-held-by-tools
The compiler, not a bundler or the runtime, is the type gate: `tsc --noEmit` runs in the check with the strict options — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

| Why | Check | Tags |
|---|---|---|
| a bundler strips the types without checking them, so a build can pass with every type wrong. | tool/types | [] |
