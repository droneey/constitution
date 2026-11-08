# Cascade

> Governs the important modifier and Tailwind's layer order.

## General

### important-modifier-never-in-a-class-list → declaration-never-important · MUST

No class list uses the important modifier, `px-0!` or `!px-0`.

| Why |
|---|
| the modifier writes an `!important` declaration the stylesheet rule never sees, so a class list overrides the cascade while the rule against `!important` passes. |

### tailwind-layers-are-the-order → layer-order-declared-first-in-the-entry-stylesheet · MUST

The entry stylesheet declares Tailwind's layer order first, `theme, base, components, utilities`, with each layer of the project's own named in it.

| Why |
|---|
| a layer named first by Tailwind's own import, or by a stylesheet of the project, takes its place by accident, so a utility loses to a rule it should override. |
