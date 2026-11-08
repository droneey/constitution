# Comments

> Governs a comment in TypeScript: the JSDoc that documents what a package publishes.

## Vocabulary

**JSDoc** is the `/** … */` block on a declaration that editors and tools read as its documentation, with its tags, such as `@throws` and `@deprecated`.

## General

### published-declaration-documented-by-jsdoc · SHOULD

Every published declaration's documentation is a JSDoc block.

| Why |
|---|
| documentation in any other form is not shown by the editor where the declaration is used. |
