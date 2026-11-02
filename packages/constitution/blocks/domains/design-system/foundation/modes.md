# Modes

> Governs the modes of a theme and how one is chosen.

## General

### theme-modes-share-one-token-set · MUST

A theme's modes share one set of semantic tokens. The modes a design system offers — light, dark, increased contrast — resolve the same names, and a component is written once for all of them.

| Why |
|---|
| a component written per mode doubles every style, and the mode a change forgets ships broken. |

### mode-values-derived-by-rule · SHOULD

Each mode's values are derived from the primitives by a declared rule. They are recomputed when a primitive changes, never picked by eye.

| Why |
|---|
| a value picked by eye stays as it was when a primitive changes, and is the first to break the contrast of its mode. |

### theme-follows-system-until-chosen · SHOULD

The theme follows the system's preference until the user chooses one. The choice persists and is applied before the first paint.

| Why |
|---|
| a theme applied after the first paint flashes the wrong one, and a choice lost on reload is a choice the user makes every visit. |
