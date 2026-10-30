# Functions

> Governs parameter objects and return types.

## Parameters

### parameter-object-has-a-named-type → function-takes-at-most-three-positions · SHOULD

The object a function takes its values in is typed by a named type — `PlaceOrderInput` — when the function is exported by its module or is a member of an exported type, as a port's is; a function inside its module may type that object inline in its signature.

| Why |
|---|
| the type names the whole the values make, callers and specs build it by that name, and an exported signature stays short to read and compact in declarations. |

## Return types

### return-type-no-wider-than-returned · SHOULD

A declared return type is no wider than what the function returns.

| Why |
|---|
| a wider annotation throws away what the compiler knew, and every caller narrows again. |
