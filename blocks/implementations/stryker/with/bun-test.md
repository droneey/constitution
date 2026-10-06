# Stryker with Bun test

> Mutation testing over specs that `bun test` runs.

### stryker-runs-the-archive-runner → mutants-all-killed
Stryker's `testRunner` is `bun-specs`, its `plugins` load the archive's `tools/mutation-check/dist/runner.js` by its path from the preset's own file, and `coverageAnalysis` is `"off"`.

| Why | Tags |
|---|---|
| Stryker's own runners do not run `bun test`; the archive's runner tries each mutant against only the specs whose imports reach its file, the nearest first, and stops at their first failure, so a run costs what proves each file rather than the whole suite per mutant. Stryker resolves a relative plugin from the folder it runs in, and a path from the preset finds the runner from any folder. | [] |
