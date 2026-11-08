# Betterleaks

> Governs the secret scan in the commit hooks.

## General

### staged-secret-scan-in-pre-commit → secret-never-in-the-repository · MUST

The `pre-commit` hook runs Betterleaks over the staged files of every version-control commit.

| Why |
|---|
| a secret stopped before the version-control commit never reaches the repository history, where it is compromised for good. |
