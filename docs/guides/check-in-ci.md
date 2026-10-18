# Run the check in CI

> One command runs every tool. The agent runs it before it hands back, CI runs it on every pull request, and the commit hooks run the fast part of it on every commit.

## Name the one check

`constitution.yaml` names the command that runs every check — format, lint, types, imports, tests, secrets, unused code, vulnerabilities:

```yaml
check: bun run check
```

The plugin blocks an agent's hand-back while the tree has changed since that command last passed. A repository without one writes `check: null`.

## Run it on every pull request

CI installs the same pinned toolchain through mise and runs the same command:

```yaml
name: Check

on:
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: jdx/mise-action@08ae2a091c038e1e05ec6f5115dc5c69d5a2a6b8 # v5.1.2
      - run: bun install --frozen-lockfile
      - run: bun run check
```

`mise install` brings the Constitution's release with the rest of the toolchain, so the presets the tools extend are there.

## Run the fast part on every commit

With the `workflow` axis, lefthook runs the commit hooks the release presets: branch names and commit messages, the formatters on the staged files, and the secrets scan. `lefthook.yaml` extends them:

```yaml
extends:
  - .droneey/constitution/presets/common/lefthook/workflow/version-control.yaml
  - .droneey/constitution/presets/common/lefthook/workflow/biome.yaml
  - .droneey/constitution/presets/common/lefthook/workflow/betterleaks.yaml
```

The same `postinstall` of `mise.toml` that links the release installs them, so every clone has them:

```toml
[hooks]
postinstall = [
  "mkdir -p .droneey",
  "ln -sfn \"$(mise where github:droneey/constitution)\" .droneey/constitution",
  "lefthook install",
]
```

The hooks are never bypassed with `--no-verify` or `LEFTHOOK=0`.
