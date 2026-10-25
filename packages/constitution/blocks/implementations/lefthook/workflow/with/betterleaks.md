# Betterleaks

> Governs the secret scan in the commit hook.

## General

Lefthook's part of the workflow for Betterleaks runs `betterleaks git --pre-commit --staged --redact`.

### staged-changes-scanned-before-commit → secret-never-in-the-repository · MUST

`pre-commit` scans the staged changes for secrets.

| Why | Tags |
|---|---|
| a secret stopped before the commit never reaches history, where it is compromised for good. | [] |
