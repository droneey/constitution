# Poe the Poet

## poe-only-without-a-script-runner · SHOULD
Poe the Poet runs the tasks only in a repository with no JavaScript toolchain; where a package manager of JavaScript runs the scripts, those scripts run the Python tools too, and `[tool.poe]` is absent.

| Why | Check | Tags |
|---|---|---|
| two task runners split the check command in two, and nobody knows which one runs everything. | review | [] |

## check-chains-area-tasks → check-chains-one-entry-per-area
The entries are tasks of `[tool.poe.tasks]`, and `check` is the sequence of the check tasks.

| Why | Check | Tags |
|---|---|---|
| a sequence task stops at the first task that fails, as a chain of commands does. | review | [] |

