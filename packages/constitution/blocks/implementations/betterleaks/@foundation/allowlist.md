# Allowlist

> Governs how a false positive of the scan is allowed, and where the reason stands.

## General

### finding-allowed-by-line-comment-or-fingerprint → suppression-silences-one-finding · MUST

Every false positive is allowed by a `betterleaks:allow` comment on its line or by its fingerprint in `.betterleaksignore`. It is never allowed by disabling a rule.

#### Why

`betterleaks:allow` names no rule, so its line bounds it, and a fingerprint names one finding, while a disabled rule stops finding the real secrets too.

#### Examples

```toml title="Avoid"
# .betterleaks.toml
[extend]
useDefault = true
# Why: the payment specs hold the provider's test key
disabledRules = ["generic-api-key"]
```

```ts title="Prefer"
// src/features/payments/infrastructure/card-gateway/__tests__/payment-gateway.adapter.integration.test.ts
// Why: the provider's published test key, which charges nothing
const testKey = 'pk_test_51HxFakeKeyForSpecsOnly'; // betterleaks:allow
```

### betterleaks-fingerprint-reason-on-the-line-above → suppression-states-its-reason · MUST

Every fingerprint in `.betterleaksignore` has its reason in a `#` comment line above it, never after it on its line.

#### Why

Betterleaks reads the words after a fingerprint as part of it, so a reason written there voids the allowance, the finding stays reported, and the reason is dropped to make the allowance work.

#### Examples

```text title="Avoid"
# .betterleaksignore
4e1f2a9c:docs/payments.md:generic-api-key:42  the sample key of the docs
```

```text title="Prefer"
# .betterleaksignore
# Why: the provider's published sample key, shown in the docs
4e1f2a9c:docs/payments.md:generic-api-key:42
```
