# Lefthook with Betterleaks

> The secret scan in the commit hook: the part `presets/common/lefthook/workflow/betterleaks.yaml` runs `betterleaks git --pre-commit --staged --redact`.

### staged-changes-scanned-before-commit → secret-never-in-the-repository · MUST
`pre-commit` scans the staged changes for secrets.

| Why | Tags |
|---|---|
| a secret stopped before the commit never reaches history, where it is compromised for good. | [] |

### commit-scan-redacted → secret-and-personal-data-kept-out-of-output · MUST
The commit hook's scan passes `--redact`.

| Why | Tags |
|---|---|
| a finding the hook prints stays in the terminal and in any log that captures it. | [] |
