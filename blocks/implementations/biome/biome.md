---
id: biome
kind: implementation
summary: Formats and lints TypeScript, with GritQL rules of our own.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: [format, lint, names]
owns: [Biome, biome.json, biome-ignore, GritQL, .grit]
governs: ["biome.json", "**/*.grit"]
status: stable
---

# Biome

> Formats and lints. `biome.json` extends devkit's general presets and the constitution's own, which hold the rules that name the constitution's folders and suffixes: `@droneey/constitution/biome/base` for core and TypeScript, and a part named after each other active block that has rules of its own, such as `biome/react`. Together they hold every active rule whose check is `format` or `lint`, and, with `useFilenamingConvention`, the names of source files and of `__tests__/`:
> - the limits as errors — `noExcessiveLinesPerFunction` 100, `noExcessiveLinesPerFile` 500, `noExcessiveCognitiveComplexity` 10 — with both line limits off under `**/__tests__/**`;
> - `noDoubleEquals` without its `null` exception, and a GritQL rule against `null` outside adapters;
> - `noExplicitAny` everywhere, tests included; `noNonNullAssertion`, `noTsIgnore`; `noFloatingPromises`, `noMisusedPromises`; `noEmptyBlockStatements`;
> - `noSkippedTests`, `noFocusedTests`, `useExpect`; `noConsole`, `noDebugger`, `noAlert`, with `noConsole` off only in the logger adapter and the command-line delivery layer;
> - `noReExportAll` and a GritQL rule that a surface only re-exports by name; `useExhaustiveSwitchCases`; a GritQL rule that a declared function takes one positional parameter — a callback keeps the signature its library gives it, and a comparator or reducer carries a suppression; `useNamingConvention`;
> - GritQL rules for empty names, empty verbs, `TODO(#<issue>)`, `should … when …` case names, casts of a response body, `toEqual` and `mock.module`.
>
> A rule it cannot hold is reported, and needs another tool, a review or an override.

## biome-suppression-names-rule-and-reason · MUST
A suppression is `// biome-ignore lint/<group>/<rule>: <reason>`: one rule and its reason; never a range or a whole file without one.
**Why:** a suppression that names its rule and reason can be judged; a blanket one silences rules nobody meant to.
**Check:** tool — lint
**Tags:** workflow
**Implements:** `suppression-states-its-reason`

## biome-warnings-fail-the-check · MUST
Warnings fail the check: every rule is an error, or the check passes `--error-on-warnings`.
**Why:** a warning that passes the check is ignored, and the rule it stands for is not held.
**Check:** review
**Tags:** workflow
**Implements:** `check-passes-before-hand-back`

## biome-check-never-writes · MUST
The check runs `biome check` without `--write`; `lint:fix` writes.
**Why:** a check that fixes what it checks passes code nobody reviewed.
**Check:** review
**Tags:** workflow
**Implements:** `check-only-checks`

## project-grit-rules-scoped · SHOULD
A project's own GritQL rule lives in `biome/<name>.grit`, scoped by an override, until a shared preset carries it: devkit's, or the constitution's when the rule names the constitution's folders.
**Why:** a rule of the project's own is found in one place and moves to the preset as one file.
**Check:** review
**Tags:** workflow
**Implements:** `shared-tooling-from-pinned-packages`
