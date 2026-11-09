# Tasks

> Governs how Poe runs the tasks of one action.

## General

### task-group-walks-poes-own-list → task-group-run-by-its-prefix · MUST

The task named by an action walks Poe's own list of tasks. It takes the names `poe _list_tasks` gives, sorted, and runs each of its prefix; where none is, it runs nothing, and it fails when `poe _list_tasks` fails.

#### Why

Poe runs no pattern of its own, so a group kept as a list by hand misses the next task added under its prefix, while Poe's list of the declared tasks is the one place their names are kept — a single source of truth; `_list_tasks` is the internal task Poe's shell completion calls (poethepoet 0.49), not a documented command, so the group fails rather than passes empty if a release drops it.

#### Examples

```toml title="Avoid"
[tool.poe.tasks]
fix = ["fix:format", "fix:lint"]
"fix:format" = "ruff format"
"fix:lint" = "ruff check --fix"
```

```toml title="Prefer"
[tool.poe.tasks]
fix = "scripts/run-task-group.sh fix"
"fix:format" = "ruff format"
"fix:lint" = "ruff check --fix"
```

```bash title="Prefer"
#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

main() {
  local prefix="$1"
  local names
  local task

  names="$(poe _list_tasks | tr -s '[:space:]' '\n' | sort)"

  while IFS= read -r task <&3; do
    if [[ $task == "$prefix":* ]]; then
      poe "$task"
    fi
  done 3<<<"$names"
}

main "$@"
```
