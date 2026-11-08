# Variants

> Governs the scales component variants draw from.

## General

### variant-values-from-shared-scales · SHOULD

Every component variant comes from a scale the design system declares once for every component. Such a scale is, for instance, a size of `sm`, `md` and `lg` or a tone of `neutral`, `brand` and `danger`, and a component takes the subset it needs.

| Why |
|---|
| a component with a scale of its own gives a size or a tone another meaning than its neighbours do, and a caller learns a new word for each component. |
