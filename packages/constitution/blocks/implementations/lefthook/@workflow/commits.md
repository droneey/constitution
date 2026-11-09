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
      run: scripts/reject-placeholder-subject.sh {1}
```

```bash title="Prefer"
#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local subject

  subject="$(head -n 1 "$message_file" | sed 's/^[a-z]*!\{0,1\}: //')"

  if grep -qiE '^(update|wip|fix stuff|changes|misc)\.?$' <<<"$subject"; then
    log "[commit-msg-hook-rejects-a-placeholder-subject] Say what the change does"
    exit 1
  fi
}

main "$@"
```
