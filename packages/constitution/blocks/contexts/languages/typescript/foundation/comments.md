# Comments

> Governs JSDoc and deprecation.

## General

### published-declaration-documented-by-jsdoc → published-declaration-documented-only-where-not-obvious · SHOULD

The documentation of a declaration a package publishes is a `/** … */` block on that declaration that states no type the signature already states: no `{string}` after `@param`, no `@returns {T}`.

| Why |
|---|
| the editor shows that block wherever the declaration is used, and a type written in it repeats the signature and drifts from it. |

## Deprecation

### deprecated-by-jsdoc-tag → retired-code-marked-deprecated · SHOULD

Code kept only for its old callers carries a JSDoc `@deprecated` tag that names its replacement.

| Why |
|---|
| the tag travels with the declaration, so every use of it is marked where it is written, not only where it is declared. |
