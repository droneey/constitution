# Motion

> Governs transitions.

## General

### transition-names-its-properties · MUST

A transition names the properties it animates, in `transition` or `transition-property`, never `all`.

| Why | Tags |
|---|---|
| `all` also moves what nobody meant to move — a layout property, every colour of a theme switch, a property a later change adds — and each one that changes is animated, a layout property with a new layout every frame. | [performance, ux] |
