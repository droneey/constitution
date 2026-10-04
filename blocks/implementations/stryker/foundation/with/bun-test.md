# Stryker with Bun test

> Mutation testing over specs that `bun test` runs.

## stryker-runs-each-mutant-against-the-specs-that-load-it → mutants-all-killed
Stryker runs each mutant through the archive's runner, which runs `bun --config=./bunfig.mutation.toml test --bail` over only the specs whose imports reach the mutant's file, the nearest first, with coverage off and the end-to-end specs and the spec of an entry file, where one is kept, left out; a mutant in a file no spec loads survives.

| Why | Check | Tags |
|---|---|---|
| Stryker's own runners do not run `bun test`, and the whole suite run for every mutant makes a run cost its mutants times the program's every spec; the specs that load a file are the ones that prove it, and the nearest of them fails first. An entry file's spec starts processes and can cost most of a run, while every mutant it could kill sits in logic whose own boundary's spec must kill it. | review | [] |

## stryker-runs-the-archive-runner → stryker-runs-each-mutant-against-the-specs-that-load-it
Stryker's `testRunner` is `bun-specs`, its `plugins` load `./.droneey/constitution/tools/mutation-check/dist/runner.js`, and `coverageAnalysis` is `"off"`.

| Why | Check | Tags |
|---|---|---|
| the runner is what keeps each mutant to the specs that load its file and stops at their first failure. | tool/mutation | [] |
