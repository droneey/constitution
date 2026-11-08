# Functions

> Governs a function in TypeScript: its parameter object and its return type.

## Parameters

### parameter-object-has-a-named-type · MUST

In a typed file, every exported function's parameter object has a named type. This holds for a function its module exports and for a member of an exported type, such as an interface's method; a function inside its module may type that object inline in its signature.

| Why |
|---|
| an object typed inline in an exported signature has no name for callers and specs to build it by, so each spells its fields again, and the signature grows long to read and in its declarations. |

## Return types

### return-type-no-wider-than-returned · MUST

Every declared return type is no wider than what its function returns. Exempt: a function that returns a contract, such as an interface, in place of its implementation's type.

| Why |
|---|
| a wider annotation throws away what the compiler knew, and every caller narrows again. |
