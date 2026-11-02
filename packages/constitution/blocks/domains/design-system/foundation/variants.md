# Variants

> Governs a component's variants and the scales they draw from.

## General

### own-variants-one-typed-map · MUST

A component's own variants are one typed map or one exhaustive function. Those variants — the look only its root needs, such as its `size` or `tone` — are declared in one place that gives each member's style and types the variant parameters: a declarative map from variant to style, or a function whose exhaustive branch gives each member's style; no condition outside it decides a style, and no second declaration repeats an axis.

| Why |
|---|
| a style decided by a condition outside the declaration, or an axis declared twice, is missed by the next change to that variant, and parameters typed apart from it accept a variant it lacks — a single source of truth. |

### cascading-variant-set-once-on-ancestor · MUST

A variant that restyles descendants is set once on their ancestor. Such a variant — a themed subtree, a look set by a parent — is resolved by the platform's inheritance of styles, or where it has none by the theme's own scope, never passed down as a prop.

| Why |
|---|
| a prop drilled for looks couples every component in between to a decision only the ancestor and the leaves care about. |

### variant-values-from-shared-scales · SHOULD

Variant values come from scales the design system declares once for every component. Among them are a size, such as `sm`, `md`, `lg`, and a tone, such as `neutral`, `brand`, `danger`; a component takes the subset it needs.

| Why |
|---|
| a component with a scale of its own gives a size or a tone another meaning than its neighbours do, and a caller learns a new word for each component. |
