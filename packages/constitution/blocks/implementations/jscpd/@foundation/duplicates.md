# Duplicates

> Governs the duplicates jscpd finds in a unit's code and how one is kept.

## General

### clone-in-source-joined-or-suppressed → copies-joined-when-they-change-together · MUST

Every duplicate jscpd reports in a unit's code is joined, or suppressed with its reason. jscpd reports a duplicate of five lines and fifty tokens from its second copy, in source or build code, leaving out its test code and its generated files. A duplicate the rule it tightens would join is joined into one home that each of its places reads; any other is suppressed on the copy written later, its reason saying that the copies only look alike.

#### Why

Jscpd reports from the second copy and cannot tell a fact copied from a shape repeated, so a duplicate joined as soon as it is reported guesses an axis two copies cannot show, and one left undecided is either a fact that drifts between its copies or a finding everyone learns to skip; a suppression with its reason shows the next reader the decision — the rule of three, and DRY.

#### Examples

```ts title="Avoid"
// src/features/invoices/domain/invoice/value-objects/invoice-total.value-object.ts
export const invoiceTotal = (lines: readonly InvoiceLine[]): Cents =>
  lines.reduce((total, line) => total + roundToCent(line.net * (1 + taxRate(line.country))), 0);

// src/features/refunds/domain/refund/value-objects/refund-total.value-object.ts
export const refundTotal = (lines: readonly RefundLine[]): Cents =>
  lines.reduce((total, line) => total + roundToCent(line.net * (1 + taxRate(line.country))), 0);
```

```ts title="Prefer"
// src/kernel/money/gross-total.ts
export const grossTotal = (lines: readonly TaxedLine[]): Cents =>
  lines.reduce((total, line) => total + roundToCent(line.net * (1 + taxRate(line.country))), 0);

// src/features/invoices/domain/invoice/value-objects/invoice-total.value-object.ts
export const invoiceTotal = (lines: readonly InvoiceLine[]): Cents => grossTotal(lines);

// src/features/refunds/domain/refund/value-objects/refund-total.value-object.ts
export const refundTotal = (lines: readonly RefundLine[]): Cents => grossTotal(lines);
```

## Suppressions

### jscpd-suppression-wraps-one-copy → suppression-silences-one-finding · MUST

Every jscpd suppression wraps one copy's lines alone. It is a comment `jscpd:ignore-start` on the line above the copy and a comment `jscpd:ignore-end` on the line below it.

#### Why

Jscpd's markers name no duplicate and silence every one that overlaps the lines between them, so a span wider than the copy hides the next duplicate made beside it.

#### Examples

```ts title="Avoid"
// jscpd:ignore-start: the two forms only look alike
export const shippingAddressLimits = [
  { name: 'street', minLength: 1, maxLength: 120 },
  { name: 'city', minLength: 1, maxLength: 80 },
  { name: 'postcode', minLength: 3, maxLength: 12 },
] as const;

export const billingAddressLimits = [
  { name: 'street', minLength: 1, maxLength: 120 },
  { name: 'city', minLength: 1, maxLength: 80 },
  { name: 'postcode', minLength: 3, maxLength: 12 },
] as const;
// jscpd:ignore-end
```

```ts title="Prefer"
export const shippingAddressLimits = [
  { name: 'street', minLength: 1, maxLength: 120 },
  { name: 'city', minLength: 1, maxLength: 80 },
  { name: 'postcode', minLength: 3, maxLength: 12 },
] as const;

// jscpd:ignore-start: billing's fields change with the tax authority's rules, shipping's with the carrier's
export const billingAddressLimits = [
  { name: 'street', minLength: 1, maxLength: 120 },
  { name: 'city', minLength: 1, maxLength: 80 },
  { name: 'postcode', minLength: 3, maxLength: 12 },
] as const;
// jscpd:ignore-end
```

### jscpd-suppression-gives-its-reason-after-the-colon → suppression-states-its-reason · MUST

Every jscpd suppression states its reason after a colon on its opening marker, as `jscpd:ignore-start: <reason>`.

#### Why

A reason on the marker's own line stays with the span it opens, where a reviewer judges the exception, and jscpd reads the marker with its reason as it reads the bare one.

#### Examples

```ts title="Avoid"
// Billing's fields change with the tax authority's rules, shipping's with the carrier's.
// jscpd:ignore-start
export const billingAddressLimits = [
  { name: 'street', minLength: 1, maxLength: 120 },
  { name: 'city', minLength: 1, maxLength: 80 },
] as const;
// jscpd:ignore-end
```

```ts title="Prefer"
// jscpd:ignore-start: billing's fields change with the tax authority's rules, shipping's with the carrier's
export const billingAddressLimits = [
  { name: 'street', minLength: 1, maxLength: 120 },
  { name: 'city', minLength: 1, maxLength: 80 },
] as const;
// jscpd:ignore-end
```
