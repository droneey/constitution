# Functions

> Governs parameter objects and return types.

## General

### parameter-object-has-a-named-type · SHOULD

The object a function takes its values in is typed by a named type — `PlaceOrderInput` — never by an object type written inline in the signature.

| Why | Tags |
|---|---|
| the type names the whole the values make, callers and specs build it by that name, and the signature stays short enough to read at a glance. | [] |

### return-type-no-wider-than-returned · SHOULD

A declared return type is no wider than what the function returns.

| Why | Tags |
|---|---|
| a wider annotation throws away what the compiler knew, and every caller narrows again. | [] |
