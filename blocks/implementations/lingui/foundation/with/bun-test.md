# Lingui with Bun test

> Specs that render Lingui's macros.

## macros-expanded-by-the-test-preload → messages-through-lingui-macros
`bunfig.toml` preloads `src/__tests__/lingui.fixtures.ts`, a plugin that expands the macros with the transform the build uses and compiles a catalog a spec imports.

| Why | Check | Tags |
|---|---|---|
| `bun test` expands no macro of its own, so a spec that imports one fails before it runs. | review | [testing] |
