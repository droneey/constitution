# tsc

## compiler-is-the-type-gate → rules-held-by-tools
The compiler, not a bundler or the runtime, is the type gate: `tsc --noEmit` runs in the check with the strict options — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

| Why | Check | Tags |
|---|---|---|
| a bundler strips the types without checking them, so a build can pass with every type wrong. | tool/types | [] |

## paths-mirror-package-imports → alias-declared-in-package-imports
`paths` in `tsconfig.json` repeats the aliases of `imports` word for word, and only them.

| Why | Check | Tags |
|---|---|---|
| the compiler does not resolve a folder's `index.ts` through `imports`, so it needs the mirror; an alias only `paths` declares resolves in the editor and fails at run time. | review | [] |
