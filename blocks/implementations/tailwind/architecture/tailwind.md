# Tailwind

## variants-in-one-cva-map · MUST
A component's own variants are one `cva` map in `<name>.variants.ts`, which types the props through `VariantProps`. The axis is declared once, never again as an enum or a union; `cn()` merges classes and never decides one.
**Why:** a second declaration of an axis drifts from the map, and a class decided outside the map is a variant nobody can find.
**Check:** review
**Tags:** types, architecture
**Implements:** `variant-axis-declared-once-in-map`
