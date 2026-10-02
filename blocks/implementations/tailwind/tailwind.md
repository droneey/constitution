---
id: tailwind
summary: Styling with Tailwind — tokens, variant maps and class merging.
requires: [ui, browser, typescript, css]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [Tailwind, cva, tailwind-merge, clsx, "@utility", "@theme"]
governs: ["**/*.css", "**/*.variants.ts"]
---

# Tailwind

> Styling through utilities generated from the design system's tokens, with `cva` for variant maps and `cn()` for merging classes.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `ui-styling-restricted-to-tokens` | `@theme` holds the tokens and resets the default scales | yes |
| `ui-styling-one-set-for-themes` | the tokens' variables are redefined under one selector | yes |
| `ui-styling-container-queries` | `@container` and its variants | yes |
| `ui-styling-cascading-variants` | `@custom-variant` or `in-data-*` | yes |
| `ui-variant-map-types-props` | `cva` with `VariantProps` | yes |
