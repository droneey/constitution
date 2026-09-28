---
id: tailwind
summary: Styling with Tailwind — tokens, variant maps and class merging.
requires: [ui, browser, typescript]
extends: null
abstract: false
checks: []
dictionary: [Tailwind, cva, tailwind-merge, clsx, "@utility", "@theme"]
governs: ["**/*.css", "**/*.variants.ts"]
---

# Tailwind

> Styling through utilities generated from the design system's tokens, with `cva` for variant maps and `cn()` for merging classes.

## Requirements

| Requirement | How in Tailwind | Status |
|---|---|---|
| `ui-styling-restricted-to-tokens` | `@theme` holds the tokens and resets the default scales | met |
| `ui-styling-one-set-for-themes` | the tokens' variables are redefined under one selector | met |
| `ui-styling-container-queries` | `@container` and its variants | met |
| `ui-styling-cascading-variants` | `@utility` with `&[data-…]` | met |
| `ui-variant-map-types-props` | `cva` with `VariantProps` | met |
