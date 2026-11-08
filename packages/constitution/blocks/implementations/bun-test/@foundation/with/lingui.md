# Lingui

> Governs specs that render Lingui's macros.

## General

### macros-expanded-by-the-test-preload → macros-expanded-by-the-lingui-transform · MUST

The spec run expands Lingui's macros through a preload. Every `bunfig` a run of the specs reads preloads `src/__tests__/lingui.fixtures.ts`, a plugin that runs Lingui's macro transform and compiles a catalogue a spec imports.

| Why |
|---|
| `bun test` expands no macro of its own, so a spec that imports one fails before it runs. |
