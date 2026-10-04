# mise

## shared-configuration-archive-installed-by-mise → shared-tooling-from-pinned-packages
An archive of shared tool configuration — presets, starter files, built tools — is a mise tool through its `github` backend, pinned by version, with `asset_pattern` naming the archive and `strip_components = 0` so it keeps its folders; `mise.lock` holds the checksum GitHub publishes for it. A `postinstall` hook links it where the configuration reads it, and installs the commit hooks — never a package manager's install script.

| Why | Check | Tags |
|---|---|---|
| the configuration then arrives pinned and verified like the tool itself, in a repository of any language, and a dependency bot bumps it like any other tool. | review | [] |

## ci-runs-the-pinned-toolchain → one-check-command
CI installs the toolchain from `mise.toml`, so the check runs on the pinned versions, never on the runner's.

| Why | Check | Tags |
|---|---|---|
| a check on another version of a tool checks another thing than the developer ran. | review | [] |
