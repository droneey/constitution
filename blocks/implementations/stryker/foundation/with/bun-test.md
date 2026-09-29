# Stryker with Bun test

> Mutation testing over specs that `bun test` runs.

## stryker-drives-bun-test-by-command → mutants-all-killed
Stryker drives the specs through its command runner — `bun --config=./bunfig.mutation.toml test --bail` — with coverage off, the end-to-end specs left out, and `coverageAnalysis: "off"`.

| Why | Check | Tags |
|---|---|---|
| Stryker has no runner for `bun test`, and a run per mutant must be fast and stop at the first failure. | review | [] |

## stryker-runs-the-bun-test-command → stryker-drives-bun-test-by-command
Stryker's `testRunner` is `command`, with `coverageAnalysis: "off"`, and the command is `bun --config=./bunfig.mutation.toml test --bail`.

| Why | Check | Tags |
|---|---|---|
| the runner and the command are what make a run per mutant fast and stop at its first failure. | tool/mutation | [] |

## stryker-runs-on-node → other-runtime-only-where-bun-cannot
Stryker itself runs on Node — its code generator fails under Bun — so the script removes Bun's `node` shim from the PATH.

| Why | Check | Tags |
|---|---|---|
| it is the one tool Bun cannot run, and the script says so where it makes the exception. | review | [] |
