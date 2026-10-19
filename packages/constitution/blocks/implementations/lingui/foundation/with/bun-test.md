# Bun test

> Governs specs that render Lingui's macros.

## General

### macros-expanded-by-the-test-preload · MUST

`bunfig.toml` and `bunfig.integration.toml` both preload `src/__tests__/lingui.fixtures.ts`, a plugin that expands the macros with the transform the build uses and compiles a catalog a spec imports.

| Why | Tags |
|---|---|
| `bun test` expands no macro of its own, so a spec that imports one fails before it runs. | [testing, ux] |
