---
id: gitleaks
kind: implementation
summary: Scans changes and history for committed secrets.
chapters: []
requires: [git]
extends: null
abstract: false
checks: [secrets]
owns: [Gitleaks, gitleaks, .gitleaks.toml, .gitleaksignore, "gitleaks:allow"]
governs: [".gitleaks.toml", ".gitleaksignore"]
status: stable
---

# Gitleaks

> Finds secrets in changes and history. Its configuration holds every active rule whose check is `tool — secrets`, extending the default rule set — cloud keys, forge tokens, private keys, JWTs, connection strings with credentials, entropy only in assignments — from the devkit preset.

## secrets-scanned-on-every-change · MUST
The check scans the branch's commits and the working tree, and CI runs it on every pull request.
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
A report shows a finding by its fingerprint and path, never by its value.
**Why:** a report that prints the secret leaks it again, into the CI log.
**Check:** review
**Tags:** security
**Implements:** `no-secret-or-personal-data-in-output`

## allowlisted-finding-states-its-reason · MUST
A false positive is allowed by its fingerprint or an inline `gitleaks:allow` marker, with its reason, never by disabling a rule.
**Why:** a disabled rule stops finding the real secrets too.
**Check:** review
**Tags:** security
**Implements:** `suppression-states-its-reason`
