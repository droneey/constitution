# Comments

> Governs JSDoc and deprecation.

## General

### export-documented-by-jsdoc → export-documented-only-where-not-obvious · SHOULD

An export's documentation is a `/** … */` block on its declaration that states no type: no `{string}` after `@param`, no `@returns {T}`.

| Why | Tags |
|---|---|
| the editor shows that block wherever the export is used, and a type written in it repeats the signature and drifts from it. | [] |

## Deprecation

### deprecated-by-jsdoc-tag → retired-code-marked-deprecated · SHOULD

Code kept only for its old callers carries a JSDoc `@deprecated` tag that names its replacement.

| Why | Tags |
|---|---|
| the tag travels with the declaration, so every use of it is marked where it is written, not only where it is declared. | [] |
