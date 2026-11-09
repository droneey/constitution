# Variants

> Governs the scales component variants draw from.

## General

### variant-values-from-shared-scales · SHOULD

Every component variant comes from a scale the design system declares once for every component. Such a scale is, for instance, a size of `sm`, `md` and `lg` or a tone of `neutral`, `brand` and `danger`, and a component takes the subset it needs.

#### Why

A component with a scale of its own gives a size or a tone another meaning than its neighbours do, and a caller learns a new word for each component.

#### Examples

```pseudo title="Avoid"
# libs/ui/button
type ButtonProps = { size: "small" | "regular" | "big", tone: "primary" | "destructive" }

# libs/ui/badge
type BadgeProps = { size: "xs" | "s" | "m", tone: "info" | "red" }
```

```pseudo title="Prefer"
# libs/ui/theme/scales
type Size = "sm" | "md" | "lg"
type Tone = "neutral" | "brand" | "danger"

# libs/ui/button
type ButtonProps = { size: Size, tone: Tone }

# libs/ui/badge
type BadgeProps = { size: "sm" | "md", tone: Tone }
```
