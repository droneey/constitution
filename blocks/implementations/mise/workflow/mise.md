# mise

## archive-hook-installs-the-commit-hooks → hooks-and-release-automation-from-the-shared-source
The `postinstall` hook of the shared configuration's archive also installs the commit hooks, never a package manager's install script.

| Why | Check | Tags |
|---|---|---|
| the hooks then arrive with the configuration they belong to, in a repository of any language, and no dependency's install script runs to set them up. | review | [] |

## ci-runs-the-pinned-toolchain → one-check-command
CI installs the toolchain from `mise.toml`, so the check runs on the pinned versions, never on the runner's.

| Why | Check | Tags |
|---|---|---|
| a check on another version of a tool checks another thing than the developer ran. | review | [] |
