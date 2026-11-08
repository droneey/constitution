# Modes

> Governs the semantic tokens every theme mode resolves, and how its values are derived.

## General

### theme-modes-share-one-token-set · MUST

Every theme mode resolves the same set of semantic tokens.

#### Why

A theme mode that lacks a token, or adds one of its own, leaves a component that reads it unstyled or styled apart there, and the theme mode a change forgets ships broken.

#### Examples

```text title="Avoid"
token                    light             dark
color.surface.default    color.gray.50     color.gray.950
color.surface.muted      color.gray.100    -
color.surface.glow       -                 color.blue.900
color.text.default       color.gray.900    color.gray.50
```

```text title="Prefer"
token                    light             dark
color.surface.default    color.gray.50     color.gray.950
color.surface.muted      color.gray.100    color.gray.900
color.text.default       color.gray.900    color.gray.50
```

### mode-values-derived-by-rule · SHOULD

Every theme mode's values are derived from the primitive tokens by a declared rule. They are recomputed when a primitive token changes, never picked by eye.

#### Why

A value picked by eye stays as it was when a primitive token changes, and is the first to break the contrast of its theme mode.

#### Examples

```pseudo title="Avoid"
# libs/ui/theme/modes
let light = {
  "color.surface.default": color.gray.50,
  "color.surface.muted": color.gray.100
}

let dark = {
  "color.surface.default": color.gray.950,
  "color.surface.muted": color.gray.850  # picked to look right
}
```

```pseudo title="Prefer"
# libs/ui/theme/modes
let light = {
  "color.surface.default": color.gray.50,
  "color.surface.muted": color.gray.100
}

let MIRRORED_STEPS_SUM = 1000

function darkOf(primitive)
  return primitive.scale.step(MIRRORED_STEPS_SUM - primitive.step)

let dark = mapValues(light, darkOf)
```
