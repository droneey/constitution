# Run the check in CI

> One command runs every tool. The agent runs it before it hands back, CI runs it on every pull request, and the commit hooks run the fast part of it on every commit.

## The one check

Each tool's block writes its commands into the unit's manifest, through the block of the unit's runner — `package.json` scripts for Bun, `[tool.poe.tasks]` for Poe — each named by its action first: `check:lint`, `check:types`, `test:unit`, `fix:lint`. The script named by the action alone runs every script of its prefix, so a script of the project's own, `check:docs` say, joins by its name. A unit's `check` is its whole gate: its `check:` scripts, then its `test`, then `mutate:branch`, the mutants of the lines the branch changed, where the unit has a mutation tool — `bun run --sequential 'check:*' test mutate:branch` — so a unit checks itself without the program; `bun run --sequential 'check:*'` runs the static checks alone, and `mutate:all` every mutant, by hand. `constitution run check` runs, in each unit, what its runner gives for `check` — Bun's `bun run check`, Poe's `poe check` — the root's unit first, then every member's, and stops at the first that fails; `constitution run test` and `constitution run fix` run the specs and the fixes the same way:

```sh
constitution run check
```

[The plugin's stop hook](../reference/plugin.md#hooks) blocks an agent's hand-back while the tree has changed since that command last passed.

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
      - run: constitution run check
```

`mise install` brings the Constitution's release with the rest of the toolchain, so the tools the configurations run, such as the mutation check, are there.

## Run the fast part on every commit

With the `workflow` axis, lefthook runs the commit hooks the release's presets give: branch names and commit messages, the formatters on the staged files, and the secrets scan. `constitution presets apply` writes them into `lefthook.yaml`, each job under its name.

Add `lefthook install` to the `postinstall` of `mise.toml`, after the two hooks that link the release in [the quick start](../../README.md#-quick-start), so every clone installs them.

The hooks are never bypassed with `--no-verify` or `LEFTHOOK=0`.
