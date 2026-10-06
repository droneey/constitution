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

> Mutation testing. Stryker has no `extends`: `stryker.config.mjs` spreads the parts of the constitution's release archive in `presets/typescript/stryker/`, the scope of the language it mutates — at the tool's root `self.mjs`, Stryker's own settings; the test runner's part, the archive's runner `tools/mutation-check/dist/runner.js`, which runs each mutant against the specs that load its file; the toolchain's part, which leaves the archive's link out of the sandbox, the version control's part, which leaves agents' worktrees out of it, and a package manager's part that leaves its environment out, their `ignorePatterns` joined; and `core.mjs`, which mutates the logic, `src/` without core's exclusions from coverage (`__tests__`, the entry file, generated files, declarations), with `thresholds.break` at 100 — and joins the exclusions of a part named after each other active block with files to leave out, `<block>.mjs`, and of the architecture parts, `core.mjs` and each active block's, the entry file of each artifact and the file that wires the program together. No incremental report is kept: with no spec reported per mutant a cached result can hide a survivor.

### equivalent-mutant-marked-on-its-line → suppression-silences-one-finding
An equivalent mutant is marked `// Stryker disable next-line <mutator>: <reason>`; never `all`.

| Why | Tags |
|---|---|
| a disable without `next-line` holds to the end of the file, and `all` silences every mutator. | [] |
