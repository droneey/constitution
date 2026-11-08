# Comments

> Governs a comment in TypeScript: the JSDoc that documents what a package publishes.

## Vocabulary

**JSDoc** is the `/** … */` block on a declaration that editors and tools read as its documentation, with its tags, such as `@throws` and `@deprecated`.

## General

### published-declaration-documented-by-jsdoc · SHOULD

Every published declaration's documentation is a JSDoc block.

#### Why

Documentation in any other form is not shown by the editor where the declaration is used.

#### Examples

```ts title="Avoid"
// packages/money/src/money.ts
export const Money = {
  // Whether the amount is below zero, as a refund's is.
  isNegative: (money: Money): boolean => money.amount < 0n,
};
```

```ts title="Prefer"
// packages/money/src/money.ts
export const Money = {
  /** Whether the amount is below zero, as a refund's is. */
  isNegative: (money: Money): boolean => money.amount < 0n,
};
```
