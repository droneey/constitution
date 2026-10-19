# Custom properties

> Governs custom properties: where they are read, and how an animated one is typed.

## General

### custom-property-read-where-defined · MUST

A custom property is read only through `var()`, and only where the theme, or a rule that matches the element or one of its ancestors, defines it, or with a fallback written in its `var()`.

| Why | Tags |
|---|---|
| a custom property nothing defines resolves to an invalid value, and the declaration that reads it silently falls back to the inherited or initial value. | [] |

### animated-custom-property-registered · MUST

A custom property that is animated or transitioned is registered by `@property` with its syntax, its inheritance and a valid initial value.

| Why | Tags |
|---|---|
| an unregistered property is plain text to the browser: it jumps instead of animating, and a value of the wrong type passes until it breaks the declaration that reads it. | [] |
