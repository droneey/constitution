# Bun test

> Governs mutation testing over specs that `bun test` runs.

## General

### stryker-runs-the-distribution-runner → every-mutant-killed · MUST

Stryker runs each mutant through the `bun-specs` runner of the Constitution's distribution, with no coverage analysis of its own.

| Why |
|---|
| Stryker's own runners do not run `bun test`; the runner of the Constitution's distribution tries each mutant against only the specs whose imports reach its file, the nearest first, and stops at their first failure, so a run costs what proves each file rather than the whole suite per mutant. |
