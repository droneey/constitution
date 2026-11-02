# Functions

> Governs a function in TypeScript: its parameter object and its return type.

## Parameters

### parameter-object-has-a-named-type · SHOULD

An exported function's parameter object has a named type. This holds for a function its module exports and for a member of an exported type, as a port's is; a function inside its module may type that object inline in its signature.

| Why |
|---|
| an object typed inline in an exported signature has no name for callers and specs to build it by, so each spells its fields again, and the signature grows long to read and in its declarations. |

## Return types

### return-type-no-wider-than-returned · SHOULD

A declared return type is no wider than what the function returns.

| Why |
|---|
| a wider annotation throws away what the compiler knew, and every caller narrows again. |
