# Lefthook with Betterleaks

> The secret scan in the commit hook: the part `presets/common/lefthook/workflow/betterleaks.yaml` runs `betterleaks git --pre-commit --staged --redact`.

### staged-changes-scanned-before-commit → secrets-scanned-before-each-commit
`pre-commit` scans the staged changes for secrets.

| Why | Tags |
|---|---|
| a secret stopped before the commit never reaches history, where it is compromised for good. | [] |

### commit-scan-redacted → scanner-reports-redacted
The commit hook's scan passes `--redact`.

| Why | Tags |
|---|---|
| a finding the hook prints stays in the terminal and in any log that captures it. | [] |
