# Tasks

> Governs how Poe runs the tasks of one action.

## General

### task-group-walks-poes-own-list → task-group-run-by-its-prefix · MUST

The task named by an action walks Poe's own list of tasks. It is a shell task that takes the names `poe _list_tasks` gives, sorted, and runs each of its prefix; where none is, it runs nothing, and it fails when `poe _list_tasks` fails.

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
"fix:format" = "ruff format"
"fix:lint" = "ruff check --fix"

[tool.poe.tasks.fix]
shell = '''
tasks=$(poe _list_tasks) || exit 1
for task in $(printf '%s\n' $tasks | sort); do
  case "$task" in fix:*) poe "$task" || exit 1;; esac
done
'''
```
