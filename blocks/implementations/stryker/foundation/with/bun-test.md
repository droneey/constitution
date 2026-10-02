# Stryker with Bun test

> Mutation testing over specs that `bun test` runs.

## stryker-drives-bun-test-by-command → mutants-all-killed
Stryker drives the specs through its command runner — `bun --config=./bunfig.mutation.toml test --bail` — with coverage off, the end-to-end specs left out, and `coverageAnalysis: "off"`.

| Why | Check | Tags |
|---|---|---|
| Stryker's own runners do not run `bun test`; a run per mutant must be fast and stop at its first failure, and a community runner with per-test coverage was no faster over a whole program. | review | [] |

## stryker-runs-the-bun-test-command → stryker-drives-bun-test-by-command
Stryker's `testRunner` is `command`, with `coverageAnalysis: "off"`, and the command is `bun --config=./bunfig.mutation.toml test --bail`.

| Why | Check | Tags |
|---|---|---|
| the runner and the command are what make a run per mutant fast and stop at its first failure. | tool/mutation | [] |
