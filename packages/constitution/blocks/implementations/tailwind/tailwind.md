---
id: tailwind
summary: Styling with Tailwind — tokens, variant maps and class merging.
requires: [presentation, client/browser, css]
languages: []
governs: ["**/*.css", "**/*.tsx", "**/libs/ui/**"]
---

# Tailwind

> Styling through Tailwind's utilities generated from the project's tokens, with `cva` for variant maps and `cn()` for merging classes.

`cn()` joins classes with `clsx` and merges them with `tailwind-merge`, and a utility of the project's own is an `@utility`.
