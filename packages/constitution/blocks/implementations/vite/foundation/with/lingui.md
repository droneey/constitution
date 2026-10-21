# Lingui

> Governs the build that expands Lingui's macros.

## General

### macros-expanded-by-the-lingui-plugin → macros-expanded-by-the-lingui-transform · MUST

The build runs that transform through Lingui's own plugin, `lingui({ macroTransform: true })`, never through another plugin's Babel options.

| Why | Tags |
|---|---|
| another plugin can drop its Babel options without a warning, and a macro that reaches the browser unexpanded throws. | [ux] |
