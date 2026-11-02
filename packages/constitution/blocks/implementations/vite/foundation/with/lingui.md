# Lingui

> Governs the build that expands Lingui's macros.

## General

### macros-expanded-by-the-lingui-plugin → macros-expanded-by-the-lingui-transform · MUST

The build expands Lingui's macros through Lingui's own plugin. It runs `lingui({ macroTransform: true })`, never another plugin's Babel options.

| Why |
|---|
| another plugin can drop its Babel options without a warning, and a macro that reaches the browser unexpanded throws. |
