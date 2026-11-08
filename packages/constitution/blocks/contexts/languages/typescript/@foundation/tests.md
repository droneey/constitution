# Tests

> Governs specs and cases in TypeScript: the cases that prove exported types.

## General

### exported-type-proven-by-type-cases · SHOULD

Every exported generic or conditional type of a package others import is proven by type cases the compiler checks.

#### Why

A consumer relies on what such a type computes, and nothing else fails when a change computes something else.

#### Examples

```text title="Avoid"
packages/money/src/
├── money.ts          exports AmountOf<TMoney>
└── money.test.ts     specs of values only
```

```ts title="Prefer"
// packages/money/src/money.test-d.ts
import { expectTypeOf, test } from 'vitest';
import type { Amount, AmountOf, Currency, Money } from './money';

test('should take the amount of its currency', () => {
  // Act
  type EuroAmount = AmountOf<Money<Currency.Eur>>;

  // Assert
  expectTypeOf<EuroAmount>().toEqualTypeOf<Amount<Currency.Eur>>();
});

test('should take no amount when given no money', () => {
  // Act
  type NoAmount = AmountOf<string>;

  // Assert
  expectTypeOf<NoAmount>().toBeNever();
});
```
