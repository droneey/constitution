# JavaScript runtime

> Governs the compiler's mirror of the aliases `package.json` declares.

## General

### paths-mirror-package-imports → alias-declared-in-package-imports · MUST

`paths` in `tsconfig.json` repeats the aliases of `imports` word for word, and only them.

| Why |
|---|
| the compiler does not resolve a folder's `index.ts` through `imports`, so it needs the mirror; an alias only `paths` declares resolves in the editor and fails at run time under Node.js. |
