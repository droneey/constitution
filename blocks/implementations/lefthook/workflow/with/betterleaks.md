# Lefthook with Betterleaks

> The secret scan in the commit hook: devkit's `betterleaks` hook runs `betterleaks git --pre-commit --staged --redact`.

## staged-changes-scanned-before-commit → secrets-scanned-before-each-commit
`pre-commit` scans the staged changes for secrets.

| Why | Check | Tags |
|---|---|---|
| a secret stopped before the commit never reaches history, where it is compromised for good. | tool — secrets | [] |
