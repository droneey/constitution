# Comments

> Governs a comment in TypeScript: the JSDoc that documents what a package publishes.

## General

### published-declaration-documented-by-jsdoc → only-published-declarations-documented-only-where-not-obvious · SHOULD

The documentation of a published declaration is a JSDoc block that states no type the signature states. It is a `/** … */` block on the declaration a package publishes: no `{string}` after `@param`, no `@returns {T}`.

| Why |
|---|
| documentation in any other form is not shown by the editor where the declaration is used, and a type written in the block repeats the signature and drifts from it. |
