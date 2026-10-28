---
id: tailwind
summary: Styling with Tailwind — tokens, variant maps and class merging.
requires: [ui, browser, typescript, css, html]
extends: null
abstract: false
languages: []
governs: ["**/*.css", "**/*.variants.ts"]
---

# Tailwind

> Styling through **Tailwind**'s utilities generated from the design system's tokens, with **`cva`** for variant maps and `cn()` for merging classes.

`cn()` joins classes with **`clsx`** and merges them with **`tailwind-merge`**; the tokens reach Tailwind as **`@theme inline`** aliases of their custom properties, one **`@theme`** block resets the default scales, and a utility of the project's own is an **`@utility`**.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `ui-styling-restricted-to-tokens` | `@theme` resets the default scales, and `@theme inline` holds the tokens' aliases | yes |
