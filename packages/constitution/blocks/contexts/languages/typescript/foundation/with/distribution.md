# Distribution

> Governs the declarations and the resolution of a TypeScript package others install.

## Contents

### package-export-typed-explicitly → distributed-unit-ships-its-types · MUST

Every export of a package others install states its type wherever its declaration needs one — a function's return type, the type of a constant whose value is no literal — so each file's declarations are emitted from that file alone, held by the compiler's `isolatedDeclarations`.

| Why |
|---|
| the declarations a consumer compiles against then change only when a signature is edited, never when a change inside a function widens what the compiler infers, and any tool can emit them file by file. |

### distributed-package-checked-under-its-runtimes-resolution → distributed-unit-ships-its-types · MUST

A package others install is type-checked under the module resolution of the runtimes it supports — `nodenext` for Node.js — so an import that only a bundler resolves fails the check.

| Why |
|---|
| the `bundler` resolution passes an import without its extension that Node.js refuses at the consumer's first load. |
