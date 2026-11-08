# Bun test

> Governs mutation testing over specs that `bun test` runs.

## General

### stryker-runs-the-bun-specs-runner → every-mutant-killed · MUST

Stryker runs each mutant through the Constitution's `bun-specs` runner, with no coverage analysis of its own.

#### Why

Stryker's `command` runner, its default, runs `bun test` only as the whole suite for every mutant; `bun-specs` tries each mutant against only the specs whose imports reach its file, the nearest first, and stops at their first failure, so a run costs what proves each file rather than the whole suite per mutant.

#### Examples

```json title="Avoid"
{
  "testRunner": "command",
  "commandRunner": { "command": "bun test" },
  "coverageAnalysis": "perTest"
}
```

```json title="Prefer"
{
  "testRunner": "bun-specs",
  "plugins": ["./node_modules/@droneey/constitution/tools/mutation-check/dist/runner.js"],
  "coverageAnalysis": "off"
}
```
