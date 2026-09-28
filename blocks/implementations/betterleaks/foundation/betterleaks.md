# Betterleaks

## secrets-scanned-on-every-change → no-secret-in-repository
The check scans the history the clone holds and the uncommitted changes, staged or not.

| Why | Check | Tags |
|---|---|---|
| a secret is caught wherever it waits — already committed, staged or only written — by the same run that checks the rest. | tool — secrets | [] |

## history-scanned-once-on-adoption → leaked-secret-rotated-at-once
The whole history, every ref, is scanned once when the scanner is adopted, and before a first public release.

| Why | Check | Tags |
|---|---|---|
| a secret committed before the scanner existed is in history all the same. | review | [] |

## scanner-reports-redacted → no-secret-or-personal-data-in-output
Every scan passes `--redact`: a report shows a finding by its rule, file and line, never by its value.

| Why | Check | Tags |
|---|---|---|
| a report that prints the secret leaks it again, into the CI log. | review | [] |

## allowlisted-finding-states-its-reason → suppression-states-its-reason
A false positive is allowed on its line by `betterleaks:allow` followed by its reason, or by its fingerprint in `.betterleaksignore` under a `#` line that states the reason; never by disabling a rule.

| Why | Check | Tags |
|---|---|---|
| a disabled rule stops finding the real secrets too. | review | [security] |
