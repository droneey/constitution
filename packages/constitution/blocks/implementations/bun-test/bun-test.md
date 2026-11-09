---
id: bun-test
summary: Bun's test runner, its coverage gate and its specs.
requires: [js-runtime/bun]
languages: [typescript]
governs: ["**/__tests__/**", "**/tests/**", "**/bunfig.toml", "**/bunfig.integration.toml"]
---

# Bun test

> Runs the specs, written against `bun:test`, and holds the coverage gate.

`constitution` writes a configuration for each run from the presets: `bunfig.toml`, which runs the unit specs, `bunfig.integration.toml`, which runs the unit and the integration specs in one run and holds the coverage gate, and, beside a mutation tool, the mutation run's. Bun measures lines and functions, not branches, and counts only the files a spec loads.
