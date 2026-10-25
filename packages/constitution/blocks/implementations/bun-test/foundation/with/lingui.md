# Lingui

> Governs specs that render Lingui's macros.

## General

### macros-expanded-by-the-test-preload → macros-expanded-by-the-lingui-transform · MUST

Every `bunfig` a run of the specs reads preloads `src/__tests__/lingui.fixtures.ts`, a plugin that runs that transform and compiles a catalog a spec imports.

| Why |
|---|
| `bun test` expands no macro of its own, so a spec that imports one fails before it runs. |
