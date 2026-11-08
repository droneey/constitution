# Allowlist

> Governs how a false positive of the scan is allowed, and where the reason stands.

## General

### finding-allowed-by-line-comment-or-fingerprint → suppression-silences-one-finding · MUST

Every false positive is allowed by a `betterleaks:allow` comment on its line or by its fingerprint in `.betterleaksignore`. It is never allowed by disabling a rule.

| Why |
|---|
| `betterleaks:allow` names no rule, so its line bounds it, and a fingerprint names one finding, while a disabled rule stops finding the real secrets too. |

### betterleaks-fingerprint-reason-on-the-line-above → suppression-states-its-reason · MUST

Every fingerprint in `.betterleaksignore` has its reason in a `#` comment line above it, never after it on its line.

| Why |
|---|
| Betterleaks reads the words after a fingerprint as part of it, so a reason written there voids the allowance, the finding stays reported, and the reason is dropped to make the allowance work. |
