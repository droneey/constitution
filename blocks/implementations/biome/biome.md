---
id: biome
summary: Formats and lints TypeScript, with GritQL rules of our own.
requires: [typescript]
extends: null
abstract: false
checks: [format, lint, names]
dictionary: [Biome, biome.json, biome-ignore, GritQL, .grit]
governs: ["biome.json", "**/*.grit"]
---

# Biome

> Formats and lints. `biome.json` extends the parts of the constitution's release archive: `presets/biome/foundation/self.jsonc`, Biome's own settings, then `core.jsonc`, `typescript.jsonc` and a part named after each other active block that has rules of its own, such as `react-dom.jsonc`, and on the architecture axis `architecture/core.jsonc` and its peers. Together they hold every active rule whose check is `format` or `lint`, and, with `useFilenamingConvention`, the names of source files and of `__tests__/`:
> - the limits as errors — `noExcessiveLinesPerFunction` 100, `noExcessiveLinesPerFile` 500, `noExcessiveCognitiveComplexity` 10 — with both line limits off under `**/__tests__/**`;
> - `noDoubleEquals` without its `null` exception;
> - `noExplicitAny` everywhere, tests included; `noNonNullAssertion`, `noTsIgnore`; `noFloatingPromises`, `noMisusedPromises`; `noEmptyBlockStatements`;
> - `noSkippedTests`, `noFocusedTests`, `useExpect`; `noConsole`, `noDebugger`, `noAlert`;
> - `noReExportAll`; `useExhaustiveSwitchCases`; `useMaxParams` at three positional parameters, while whether values make one whole is reviewed; `useNamingConvention`;
> - GritQL rules for empty names, empty verbs, `should … when …` case names, casts of a response body, `toEqual`, `mock.module`, and sets of named values written as literal unions or `as const` arrays.
>
> A rule it cannot hold is reported, and needs another tool, a review or an override.
