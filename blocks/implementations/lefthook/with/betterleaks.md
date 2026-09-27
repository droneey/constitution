# Lefthook with Betterleaks

> The secret scan in the commit hook: devkit's `betterleaks` hook runs `betterleaks git --pre-commit --staged --redact`.

## staged-changes-scanned-before-commit · MUST
`pre-commit` scans the staged changes for secrets.
**Why:** a secret stopped before the commit never reaches history, where it is compromised for good.
**Check:** tool — secrets
**Tags:** security
**Implements:** `no-secret-in-repository`
