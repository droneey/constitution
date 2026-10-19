---
id: stryker
summary: Stryker measures the tests by the mutants they kill.
requires: [typescript]
extends: null
abstract: false
languages: [typescript]
dictionary: [Stryker, stryker.config.mjs]
governs: ["stryker.config.mjs"]
---

# Stryker

> Mutation testing.

Stryker has no `extends`: `stryker.config.mjs` spreads the parts of the Constitution's release archive in `presets/typescript/stryker/`, the scope of the language it mutates. In `foundation/`, `self.mjs` holds Stryker's own settings. The test runner's part names the archive's runner, `tools/mutation-check/dist/runner.js`, which runs each mutant against the specs that load its file. The toolchain's part leaves the archive's link out of the sandbox, the version control's part leaves agents' worktrees out of it, and a package manager's part leaves its environment out; their `ignorePatterns` and `plugins` are joined.

`core.mjs` mutates the logic: `src/` without core's exclusions from coverage — `__tests__`, the entry file, generated files and declarations. It sets `thresholds.break` at 100 and, through the archive's ignorer `tools/mutation-check/dist/ignorers.js`, leaves out the mutants no caller relies on. A part named after each other active block with files to leave out, `<block>.mjs`, adds its exclusions.

On the architecture axis, `architecture/core.mjs` leaves out the entry file of each artefact and the file that wires the program together, and each active block's part there leaves out its own.

`self.mjs` leaves `incremental` at Stryker's default, off: with no spec reported per mutant a cached result can hide a survivor.
