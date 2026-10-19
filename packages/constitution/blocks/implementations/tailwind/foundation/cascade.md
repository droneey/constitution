# Cascade

> Governs the important modifier and the order of Tailwind's layers.

## General

### important-modifier-never-in-a-class-list → declaration-never-important · MUST

No class list uses the important modifier, `px-0!` or `!px-0`.

| Why | Tags |
|---|---|
| the modifier writes an `!important` declaration the stylesheet rule never sees. | [] |

### tailwind-layers-are-the-order → layer-order-declared-once · SHOULD

The order of the layers is Tailwind's — `theme, base, components, utilities` — with the project's layers named among them. Tailwind is imported layer by layer (`@import "tailwindcss/theme.css" layer(theme)` and the rest), and any other stylesheet from outside into a layer of its own.

| Why | Tags |
|---|---|
| Tailwind declares its layers itself; a second order would fight it. | [] |
