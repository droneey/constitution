# Allowlist

> Governs how a false positive of the scan is allowed.

## General

### allowlisted-finding-states-its-reason → suppression-silences-one-finding · MUST

A false positive is allowed on its line by **`betterleaks:allow`** followed by its reason, or by its fingerprint in **`.betterleaksignore`** under a `#` line that states the reason; never by disabling a rule.

| Why |
|---|
| `betterleaks:allow` names no rule, so its line bounds it, and a fingerprint names one finding; a disabled rule stops finding the real secrets too. |
