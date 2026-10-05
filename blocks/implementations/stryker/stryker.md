---
id: stryker
summary: Stryker measures the tests by the mutants they kill.
requires: [typescript]
extends: null
abstract: false
checks: [mutation]
languages: [typescript]
roles: []
dictionary: [Stryker, stryker.config.mjs]
governs: ["stryker.config.mjs"]
---

# Stryker

> Mutation testing. Stryker has no `extends`: `stryker.config.mjs` spreads the parts of the constitution's release archive in `presets/typescript/stryker/`, the scope of the language it mutates — on foundation `self.mjs`, Stryker's own settings; the test runner's part, the archive's runner `tools/mutation-check/dist/runner.js`, which runs each mutant against the specs that load its file; the toolchain's part, which leaves the archive's link out of the sandbox, the version control's part, which leaves agents' worktrees out of it, and a package manager's part that leaves its environment out, their `ignorePatterns` joined; and `core.mjs`, which mutates the logic, `src/` without core's exclusions from coverage (`__tests__`, the entry file, generated files, declarations), with `thresholds.break` at 100 — and joins the exclusions of a part named after each other active block with files to leave out, `<block>.mjs`, such as the stories, and of the architecture parts, `core.mjs` and each active block's, the entry file of each artifact and the file that wires the program together. In the check, the archive's `tools/mutation-check/dist/main.js` mutates the lines a change touches, a new file whole, and whole the file a changed spec is named after and every file it loads, directly or through its fixtures, from the folder that holds its `__tests__/`; a file whose transpiled code a change leaves as it was — a change that only reformats it — gives no mutant. `mutation-check all` mutates everything. No incremental report is kept: with no spec reported per mutant a cached result can hide a survivor. A survivor fails the run.
