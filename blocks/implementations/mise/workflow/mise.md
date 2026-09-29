# mise

## tool-configuration-from-the-constitution-archive → shared-tooling-from-pinned-packages
Shared tool configuration comes from the constitution's release archive, `constitution.tar.gz`, for the tools of every language: its presets, its starter files and its built tools. mise installs it through its `github` backend, pinned by version, with `asset_pattern` naming the archive and `strip_components = 0` so the archive keeps its folders; `mise.lock` holds the checksum GitHub publishes for it. A `postinstall` hook links it as `.constitution`, which version control ignores. The same hook installs the commit hooks, never a package manager's install script.

| Why | Check | Tags |
|---|---|---|
| the configuration then arrives pinned and verified like the tool itself, in a repository of any language, at one path in every repository, and a dependency bot bumps it like any other tool. | review | [] |

## ci-runs-the-pinned-toolchain → one-check-command
CI installs the toolchain from `mise.toml`, so the check runs on the pinned versions, never on the runner's.

| Why | Check | Tags |
|---|---|---|
| a check on another version of a tool checks another thing than the developer ran. | review | [] |
