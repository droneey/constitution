# Distribution

> Governs the declarations and the resolution of a TypeScript package others install.

## Contents

### package-export-typed-explicitly → distributed-unit-ships-its-types · MUST

Every export of a package others install states its type where its declaration needs one. That is a function's return type, or the type of a constant whose value is no literal, so each file's declarations are emitted from that file alone.

| Why |
|---|
| a type left to inference changes the declarations a consumer compiles against whenever a change inside a function widens what the compiler infers, and declarations that need inference can be emitted only by the whole compiler, never file by file. |

### distributed-package-checked-under-its-runtimes-resolution → unit-checked-on-every-runtime-it-supports · MUST

A package others install is type-checked under its runtimes' module resolution. That is the resolution of each runtime it supports — `nodenext` for Node.js — so an import that only a bundler resolves fails the check.

| Why |
|---|
| the `bundler` resolution passes an import without its extension that Node.js refuses at the consumer's first load. |
