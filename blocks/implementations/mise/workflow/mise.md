# mise

## tool-configuration-from-the-kit-archive · SHOULD
Shared configuration that is not an npm package comes from the release archive of its source: devkit's `devkit.tar.gz` for the tools outside the package manager, the constitution's `constitution.tar.gz` for its presets. mise installs each through its `github` backend, pinned by version, with `asset_pattern` naming the archive and `strip_components = 0` so the archive keeps its folders; `mise.lock` holds the checksum GitHub publishes for it. A `postinstall` hook links it as `.devkit` or `.constitution`, which version control ignores. The same hook installs the commit hooks, never a package manager's install script.
**Why:** the configuration then arrives pinned and verified like the tool itself, in a repository of any language, at one path in every repository, and a dependency bot bumps it like any other tool.
**Check:** review
**Tags:** security, process
**Implements:** `shared-tooling-from-pinned-packages`
