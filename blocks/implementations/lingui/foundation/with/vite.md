# Lingui with Vite

> The build that expands Lingui's macros.

### macros-expanded-by-the-lingui-plugin → messages-through-lingui-macros
The build expands the macros through Lingui's own plugin, `lingui({ macroTransform: true })`, never through another plugin's Babel options.

| Why | Tags |
|---|---|
| another plugin can drop its Babel options without a warning, and a macro that reaches the browser unexpanded throws. | [] |
