# Variants

> Governs a component's variants and the scales they draw from.

## General

### own-variants-one-typed-map · MUST

A component's own variants — the look only its root needs, such as its `size` or `tone` — are one declarative map from variant to style, which also types the variant props; no condition outside the map decides a style, and no second declaration repeats an axis.

| Why |
|---|
| the map is the one place a variant is defined, so adding one cannot miss a copy and the props cannot disagree with it. |

### cascading-variant-set-once-on-ancestor · MUST

A variant that restyles descendants — a themed subtree, a look set by a parent — is set once on their ancestor and resolved by the platform's inheritance of styles, or where it has none by the theme's own scope, never passed down as a prop.

| Why |
|---|
| a prop drilled for looks couples every component in between to a choice only the ancestor and the leaves care about. |

### variant-values-from-shared-scales · SHOULD

Variant values come from scales the design system declares once for every component — a size such as `sm`, `md`, `lg`, a tone such as `neutral`, `brand`, `danger` — and a component takes the subset it needs.

| Why |
|---|
| a size or a tone then means the same on every component, and a caller never learns a new word for it. |
