# mise

## archive-hook-installs-the-commit-hooks → hooks-and-release-automation-from-the-shared-source
The `postinstall` hook of the shared configuration's archive also installs the commit hooks, never a package manager's install script.

| Why | Check | Tags |
|---|---|---|
| the hooks then arrive with the configuration they belong to, in a repository of any language, and no dependency's install script runs to set them up. | review | [] |
