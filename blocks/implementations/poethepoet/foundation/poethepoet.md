# Poe the Poet

## poe-only-without-a-script-runner · SHOULD
Poe the Poet runs the tasks only in a repository with no JavaScript toolchain; where a package manager of JavaScript runs the scripts, those scripts run the Python tools too, and `[tool.poe]` is absent.

| Why | Check | Tags |
|---|---|---|
| two task runners split the check command in two, and nobody knows which one runs everything. | review | [] |

## check-chains-area-tasks → one-check-command
Each area of the check — `format`, `lint`, `type`, `test`, `mutation`, `unused` and the rest — has one `<area>:check` task that only checks and runs every tool of that area, in each language of the repository, and an `<area>:fix` beside it where a tool can write; `check` is the sequence of the check tasks.

| Why | Check | Tags |
|---|---|---|
| CI, the hooks and a person run the same task names, so the names stay stable, and a second language adds its tools to the areas rather than a second set of names. | review | [] |
