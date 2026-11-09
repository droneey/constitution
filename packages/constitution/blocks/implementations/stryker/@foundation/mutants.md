# Mutants

> Governs the mutants the configuration leaves out, the code Stryker cannot mutate, how an equivalent mutant is marked and the runs it caches.

## General

### diagnostic-mutants-left-out-by-the-ignorer → every-mutant-killed · MUST

Stryker's ignorer leaves out the mutants of text only a person reads, and no other. `ignorers` holds the Constitution's `diagnostics` ignorer, which leaves out the string and template mutants of a `.messages` file and the text a call takes. `diagnosticsTextArguments` names each such call by its shape — the function, the method or the constructor it calls, `super` among them, `*` standing for any letters — and the indexes of its text arguments; no other mutant is left out by the configuration.

#### Why

A caller relies on no text only a person reads, so a case written to kill such a mutant proves no plausible bug; a file's kind and a block's contract tell the text, never a name the ignorer guesses, and a call no block names keeps its mutants, so a missing entry shows in the run instead of hiding a case.

#### Examples

```json title="Avoid"
{
  "mutate": ["src/**/*.ts", "!src/**/*.messages.ts", "!src/**/errors/**"],
  "mutator": { "excludedMutations": ["StringLiteral"] }
}
```

```json title="Prefer"
{
  "mutate": ["src/**/*.ts"],
  "plugins": ["./node_modules/@droneey/constitution/tools/mutation-check/dist/ignorers.js"],
  "ignorers": ["diagnostics"],
  "diagnosticsTextArguments": { "new *Error": 0, "super": 0 }
}
```

### logic-kept-out-of-as-const → every-mutant-killed · MUST

An `as const` literal holds no logic. It holds only values written out and names: a function, a call or any other expression that computes is defined outside it and named inside.

#### Why

Stryker skips the whole of an `as` expression, so logic inside one is never mutated and passes the gate unmeasured.

#### Examples

```ts title="Avoid"
export const shippingRates = {
  standard: 499,
  express: Math.round(499 * 1.8),
  isFree: (total: number) => total >= 5000,
} as const;
```

```ts title="Prefer"
const isFreeShipping = (totalCents: number): boolean => totalCents >= freeShippingFromCents;

export const shippingRates = {
  standardCents: 499,
  expressCents: 899,
  isFree: isFreeShipping,
} as const;
```

### incremental-mode-left-off → every-mutant-killed · MUST

No run of Stryker is incremental. `incremental` stays at Stryker's default, off.

#### Why

With no spec reported per mutant, a result cached from an earlier run can hide a survivor the change made.

#### Examples

```json title="Avoid"
{
  "testRunner": "bun-specs",
  "incremental": true,
  "incrementalFile": ".stryker-tmp/incremental.json"
}
```

```json title="Prefer"
{
  "testRunner": "bun-specs"
}
```

## Suppressions

### equivalent-mutant-marked-on-its-line → suppression-silences-one-finding · MUST

Every equivalent mutant is marked on its line by `// Stryker disable next-line <mutator>`. The mark never names `all`.

#### Why

A disable without `next-line` holds to the end of the file, and `all` silences every mutator.

#### Examples

```ts title="Avoid"
// Stryker disable all: at maxQuantity both branches return maxQuantity.
export const clampQuantity = (quantity: number): number =>
  quantity >= maxQuantity ? maxQuantity : Math.max(1, quantity);
// Stryker restore all
```

```ts title="Prefer"
export const clampQuantity = (quantity: number): number =>
  // Stryker disable next-line EqualityOperator: at maxQuantity both branches return maxQuantity.
  quantity >= maxQuantity ? maxQuantity : Math.max(1, quantity);
```

### stryker-disable-gives-its-reason-after-the-colon → suppression-states-its-reason · MUST

Every mark of an equivalent mutant states its reason after its colon, as `// Stryker disable next-line <mutator>: <reason>`.

#### Why

A mark without its reason cannot be judged by its next reader, who cannot tell whether the mutant is still equivalent, so it is kept for ever or removed blind.

#### Examples

```ts title="Avoid"
export const clampQuantity = (quantity: number): number =>
  // Stryker disable next-line EqualityOperator
  quantity >= maxQuantity ? maxQuantity : Math.max(1, quantity);
```

```ts title="Prefer"
export const clampQuantity = (quantity: number): number =>
  // Stryker disable next-line EqualityOperator: at maxQuantity both branches return maxQuantity.
  quantity >= maxQuantity ? maxQuantity : Math.max(1, quantity);
```
