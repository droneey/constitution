# Modes

> Governs the modes of a theme and how one is chosen.

## General

### theme-modes-share-one-token-set · MUST

The modes a design system offers — light, dark, increased contrast — are modes of one set of semantic tokens: every mode resolves the same names, and a component is written once for all of them.

| Why |
|---|
| a component written per mode doubles every style, and the mode a change forgets ships broken. |

### mode-values-derived-by-rule · SHOULD

The values of each mode are derived from the primitives by a declared rule and recomputed when a primitive changes, never picked by eye.

| Why |
|---|
| derived values keep contrast right when a colour changes, and a value picked by eye is the first to break it. |

### theme-follows-system-until-chosen · SHOULD

The theme follows the system's preference until the user chooses one; the choice persists and is applied before the first paint.

| Why |
|---|
| a theme applied after the first paint flashes the wrong one, and a choice lost on reload is a choice the user makes every visit. |
