# Deprecations

> Governs what a deprecated entry of a distributed package says.

## General

### deprecated-entry-names-its-replacement → deprecation-names-its-replacement · SHOULD

Every deprecated entry of a distributed package names its replacement.

#### Why

A deprecation without a replacement leaves the consumer stuck between an entry that is going and nothing to move to.

#### Examples

```pseudo title="Avoid"
# @deprecated Removed in 4.0.0.
export function formatPrice(amountCents)
  return formatMoney(money(amountCents, defaultCurrency))
```

```pseudo title="Prefer"
# @deprecated Use formatMoney. Removed in 4.0.0.
export function formatPrice(amountCents)
  return formatMoney(money(amountCents, defaultCurrency))
```

### deprecated-entry-names-its-removal-version → retired-code-marked-deprecated · MUST

Every deprecated entry of a distributed package names the version that removes it.

#### Why

A deprecation without a removal version never ends, so consumers never plan the move and the entry is kept for ever or removed by surprise.

#### Examples

```pseudo title="Avoid"
# @deprecated Use formatMoney.
export function formatPrice(amountCents)
  return formatMoney(money(amountCents, defaultCurrency))
```

```pseudo title="Prefer"
# @deprecated Use formatMoney. Removed in 4.0.0.
export function formatPrice(amountCents)
  return formatMoney(money(amountCents, defaultCurrency))
```
