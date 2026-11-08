# Betterleaks

> Governs the secret scan in the commit hooks.

## General

### staged-secret-scan-in-pre-commit → secret-never-in-the-repository · MUST

The `pre-commit` hook runs Betterleaks over the staged files of every version-control commit.

#### Why

A secret stopped before the version-control commit never reaches the repository history, where it is compromised for good.

#### Examples

```yaml title="Avoid"
# lefthook.yaml
pre-push:
  jobs:
    - name: secrets
      run: betterleaks git --no-banner
```

```yaml title="Prefer"
# lefthook.yaml
pre-commit:
  parallel: true
  jobs:
    - name: secrets
      run: betterleaks git --pre-commit --staged --redact --no-banner
```
