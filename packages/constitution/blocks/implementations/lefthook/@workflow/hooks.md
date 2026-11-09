# Hooks

> Governs how Lefthook's hooks may be skipped.

## General

### lefthook-skip-variable-never-set → hooks-never-bypassed · MUST

No version-control commit is made with the `LEFTHOOK` variable set to `0`, which skips every hook. Exempt: the release automation's release commit.

#### Why

`LEFTHOOK=0` skips every hook without a word, so a version-control commit made with it passes none of their checks.

#### Examples

```bash title="Avoid"
LEFTHOOK=0 git commit -m "fix: Round invoice totals to the cent"
```

```bash title="Prefer"
git commit -m "fix: Round invoice totals to the cent"
```
