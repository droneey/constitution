---
id: dependency-cruiser
summary: Holds the import rules between layers, modules and packages.
requires: [js-runtime, task-runner]
languages: [typescript]
governs: [".dependency-cruiser.jsonc"]
---

# dependency-cruiser

> Holds the imports.

dependency-cruiser, run as `depcruise --config .dependency-cruiser.jsonc`, reads the settings `constitution` writes there: each rule on imports once, by its name, over `src/` and its specs, and the rule against development dependencies in production over the development files the presets and the project's own settings name. Each preset file with `allowed` rules sets `allowedSeverity` to `error`, since it is `warn` unless set.
