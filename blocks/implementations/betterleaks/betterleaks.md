---
id: betterleaks
kind: implementation
summary: Scans changes and history for committed secrets.
chapters: []
requires: [git]
extends: null
abstract: false
checks: [secrets]
owns: [Betterleaks, betterleaks, .betterleaks.toml, .betterleaksignore, "betterleaks:allow"]
governs: [".betterleaks.toml", ".betterleaksignore"]
status: stable
---

# Betterleaks

> Finds secrets in changes and history. `.betterleaks.toml` extends devkit's preset — betterleaks' default rules: cloud keys, forge tokens, private keys, JWTs, credentials in connection strings — and holds every active rule whose check is `tool — secrets`. The check runs `betterleaks git`, never `betterleaks dir`, which also reads ignored files such as a local `.env`.

## secrets-scanned-on-every-change · MUST
The check scans the history the clone holds and the uncommitted changes, staged or not, and CI runs it on every pull request.
**Why:** a secret a hook missed, or a hook someone skipped, is still caught before it merges.
**Check:** tool — secrets
**Tags:** security
**Implements:** `no-secret-in-repository`

## history-scanned-once-on-adoption · SHOULD
The whole history, every ref, is scanned once when the scanner is adopted, and before a first public release.
**Why:** a secret committed before the scanner existed is in history all the same.
**Check:** review
**Tags:** security
**Implements:** `secret-in-history-is-compromised`

## scanner-reports-redacted · MUST
Every scan passes `--redact`: a report shows a finding by its rule, file and line, never by its value.
**Why:** a report that prints the secret leaks it again, into the CI log.
**Check:** review
**Tags:** security
**Implements:** `no-secret-or-personal-data-in-output`

## allowlisted-finding-states-its-reason · MUST
A false positive is allowed on its line by `betterleaks:allow` followed by its reason, or by its fingerprint in `.betterleaksignore` under a `#` line that states the reason; never by disabling a rule.
**Why:** a disabled rule stops finding the real secrets too.
**Check:** review
**Tags:** security
**Implements:** `suppression-states-its-reason`
