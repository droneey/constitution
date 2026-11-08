# Commits

> Governs what Lefthook's `commit-msg` hook rejects.

## General

### commit-msg-hook-rejects-a-placeholder-subject → commit-subject-says-what-changed · MUST

The `commit-msg` hook rejects every subject that is only a placeholder, such as “update”, “wip” or “fix stuff”.

#### Why

A placeholder subject makes the repository history useless at exactly the version-control commit someone needs to understand, and a hook stops it before it is recorded.

#### Examples

```yaml title="Avoid"
# lefthook.yaml
commit-msg:
  jobs:
    - name: commit-header-format
      run: grep -qE '^(feat|fix|refactor|chore)!?: [A-Z]' {1}
```

```yaml title="Prefer"
# lefthook.yaml
commit-msg:
  jobs:
    - name: commit-header-format
      run: grep -qE '^(feat|fix|refactor|chore)!?: [A-Z]' {1}
    - name: commit-subject-placeholder
      run: |
        SUBJECT="$(head -1 {1} | sed 's/^[a-z]*!\{0,1\}: //')"
        if printf '%s\n' "$SUBJECT" | grep -qiE '^(update|wip|fix stuff|changes|misc)\.?$'; then
          echo "[commit-msg-hook-rejects-a-placeholder-subject] Say what the change does"
          exit 1
        fi
```
