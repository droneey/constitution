# Modes

> Governs the modes of a theme and how one is chosen.

## General

### theme-modes-share-one-token-set · MUST

The modes a design system offers — light, dark, increased contrast — are modes of one set of semantic tokens: every mode resolves the same names, and a component is written once for all of them.

| Why | Tags |
|---|---|
| a component written per mode doubles every style, and the mode a change forgets ships broken. | [ux, a11y] |

### mode-values-derived-by-rule · SHOULD

The values of each mode are derived from the primitives by a declared rule and recomputed when a primitive changes, never picked by eye.

| Why | Tags |
|---|---|
| derived values keep contrast right when a colour changes, and a value picked by eye is the first to break it. | [ux, a11y] |

### weight-adjusted-per-mode · SHOULD

Text and icon strokes are drawn slightly lighter in a dark mode than in a light one: the weights and stroke widths are mode values of their tokens, so a component never writes the adjustment.

| Why | Tags |
|---|---|
| light marks on a dark ground spread and read heavier than the same weight dark on light, so one weight looks bold in one mode and thin in the other. | [ux] |

### theme-follows-system-until-chosen · SHOULD

The theme follows the system's preference until the user chooses one; the choice persists and is applied before the first paint.

| Why | Tags |
|---|---|
| a theme applied after the first paint flashes the wrong one, and a choice lost on reload is a choice the user makes every visit. | [ux] |
