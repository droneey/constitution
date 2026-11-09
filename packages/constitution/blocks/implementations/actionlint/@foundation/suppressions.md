# Suppressions

> Governs how a finding of actionlint is suppressed.

## General

### actionlint-ignore-keyed-by-one-workflow → suppression-silences-one-finding · MUST

Every suppression of actionlint's own checks is an `ignore` pattern of its message, under the `paths` key of one workflow in `.github/actionlint.yaml`. It is never `-ignore` on the command line, nor a pattern under a key that matches several workflows.

#### Why

Actionlint has no comment that silences a finding where it stands, and a pattern matches the message alone, so one on the command line or under a broad key silences that finding in every workflow it reaches.

#### Examples

```yaml title="Avoid"
# .github/actionlint.yaml
paths:
  .github/workflows/**/*.yaml:
    ignore:
      # Why: the release step splits RELEASE_FLAGS into several flags on purpose
      - 'SC2086'
```

```yaml title="Prefer"
# .github/actionlint.yaml
paths:
  .github/workflows/release.yaml:
    ignore:
      # Why: the release step splits RELEASE_FLAGS into several flags on purpose
      - 'shellcheck reported issue in this script: SC2086:.+'
```
